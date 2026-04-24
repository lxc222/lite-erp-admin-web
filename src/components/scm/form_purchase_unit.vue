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

const data_list = ref([]);
async function onLoadData() {
    let statusAttr = !attrs.status ? null : attrs.status;
    let supplierAttr = !attrs.supplier ? null : attrs.supplier;
    let materialUnitIdAttr = !attrs.materialUnitId ? null : attrs.materialUnitId;
    axiosPostJsonBody(
        "/api/biz/scm/purchaseUnit/list",
        {
            status: statusAttr,
            supplierId: supplierAttr,
            materialUnitId: materialUnitIdAttr
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
    [() => attrs.supplier, () => attrs.materialUnitId],
    ([newSupplier, newMaterialUnitId], [oldSupplier, oldMaterialUnitId]) => {
        model.value = null;
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
                    item.titleShow + ' | ' + item.unitTypeTitle + '【' + item.statusTitle + '】'
                "
                :value="item.id"
            />
        </t-select>
    </t-form-item>
</template>

<style scoped></style>
