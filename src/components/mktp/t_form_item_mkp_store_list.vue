<script setup>
import { ref, onMounted, useAttrs, watch } from "vue";

import { MessagePlugin } from "tdesign-vue-next";

import { axiosPostJsonBody, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";

defineProps({
    label: {
        type: String,
        required: false
    }
});

const model = defineModel();
const emit = defineEmits(["change"]);

const attrs = useAttrs();

watch(
    () => attrs.centerId,
    (newVal, oldVal) => {
        // console.log("centerId changed:", newVal);
        onLoadHouseList();
    }
);

const house_list = ref([]);

async function onLoadHouseList() {
    house_list.value = [];
    if (!attrs.centerId) {
        return;
    }

    let centerId = !attrs.centerId ? null : attrs.centerId;
    let statusAttr = !attrs.status ? null : attrs.status;

    let distUrl = "/api/biz/mktp/store/list";
    axiosPostJsonBody(
        distUrl,
        {
            storeCenterId: centerId,
            status: statusAttr
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                house_list.value = response.data.data;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

function onSelectChange() {
    emit("change");
}

onMounted(() => {
    onLoadHouseList();
});
</script>

<template>
    <t-form-item :label="label" :name="label" :help="attrs.help">
        <t-select
            v-model="model"
            @change="onSelectChange"
            :clearable="true"
            :filterable="true"
            :disabled="attrs.disabled ? true : false"
        >
            <t-option
                v-for="item in house_list"
                :key="item.id"
                :label="
                    item.storeCenterName +
                    ' - ' +
                    item.storeRegionNameAbs +
                    '/' +
                    item.title +
                    '【' +
                    item.statusTitle +
                    '】'
                "
                :value="item.id"
            />
        </t-select>
    </t-form-item>
</template>

<style scoped></style>
