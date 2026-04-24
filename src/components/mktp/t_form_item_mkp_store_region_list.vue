<script setup>
import { ref, onMounted, useAttrs, watch } from "vue";

import { MessagePlugin } from "tdesign-vue-next";

import { axiosPostJsonBody, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";
import { message_plugin_config } from "@/assets/asset_biz_base_20251024.js";

defineProps({
    label: {
        type: String,
        required: true
    }
});

const model = defineModel();
const emit = defineEmits(["change"]);

const attrs = useAttrs();

watch(
    () => attrs.centerId,
    (newVal, oldVal) => {
        // console.log("centerId changed:", newVal);
        // model.value = null;
        onLoadData();
    }
);

const data_list = ref([]);
async function onLoadData() {
    data_list.value = [];
    if (!attrs.centerId) {
        return;
    }

    let centerId = !attrs.centerId ? null : attrs.centerId;
    let statusAttr = !attrs.status ? null : attrs.status;
    let distUrl = "/api/biz/mktp/storeRegion/list";
    axiosPostJsonBody(
        distUrl,
        {
            storeCenterId: centerId,
            status: statusAttr
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                data_list.value = response.data.data;
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
    setTimeout(() => {
        emit("change");
    }, 0);
}

onMounted(() => {
    onLoadData();
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
                v-if="attrs.externalOption"
                v-for="item in attrs.externalOption"
                :key="item.id"
                :label="item.title"
                :value="item.id"
            />
            <t-option
                v-for="item in data_list"
                :key="item.id"
                :label="item.titleAbs + '【' + item.statusTitle + '】'"
                :value="item.id"
            />
        </t-select>
    </t-form-item>
</template>

<style scoped></style>
