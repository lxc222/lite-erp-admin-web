<script setup>
import { ref, onMounted, useAttrs, watch } from "vue";

import { MessagePlugin } from "tdesign-vue-next";

import { axiosPostJsonBody, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";

defineProps({
    label: {
        type: String,
        required: true
    }
});

const model = defineModel();
const emit = defineEmits(["change"]);

const attrs = useAttrs();

const data_list = ref([]);
async function onLoadData() {
    data_list.value = [];

    let supplierIdAttr = !attrs.supplierId ? null : attrs.supplierId;
    if (!supplierIdAttr) {
        return;
    }

    let statusAttr = !attrs.status ? null : attrs.status;
    axiosPostJsonBody(
        "/api/biz/scm/purchaseRelation/list",
        {
            supplierId: supplierIdAttr,
            status: statusAttr
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                data_list.value = response.data.data;
            } else {
                data_list.value = [];
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

watch(
    () => attrs.supplierId,
    (newVal, oldVal) => {
        // console.log("supplierId changed:", newVal);
        onLoadData();
    }
);

function onSelectChange() {
    emit("change");
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
                v-for="item in data_list"
                :key="item.id"
                :label="
                    item.materialTitle +
                    ' / ' +
                    item.materialCode +
                    ' / ' +
                    item.materialSpecValueTxt +
                    ' / ￥' +
                    item.purchasePrice +
                    '/' +
                    item.purchaseUnitTitle
                "
                :value="item.id"
            />
        </t-select>
        <template #statusIcon v-if="$slots.actionIcon">
            <slot name="actionIcon" />
        </template>
    </t-form-item>
</template>

<style scoped></style>
