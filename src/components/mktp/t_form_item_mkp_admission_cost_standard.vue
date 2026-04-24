<script setup>
import { ref, onMounted, useAttrs } from "vue";

import { MessagePlugin } from "tdesign-vue-next";

import { axiosPostJsonBody, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

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

    let statusAttr = !attrs.status ? null : attrs.status;
    let distUrl = "/api/biz/mktp/admissionCostStandard/list";
    axiosPostJsonBody(
        distUrl,
        {
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
    // 有时在事件处理函数中可能会遇到值更新延迟的问题。使用 nextTick 确保 DOM 更新完成
    setTimeout(() => {
        if (model.value) {
            for (let i = 0; i < data_list.value.length; i++) {
                if (data_list.value[i].id == model.value) {
                    let wareUnitId = data_list.value[i].wareUnitId;
                    let cost_standard_type = data_list.value[i].costType;
                    emit("change", wareUnitId, cost_standard_type);
                    return;
                }
            }
        }
        emit("change", null, null);
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
            <template :key="item.id" v-for="item in data_list">
                <t-option
                    v-if="item.costType == globalConstDef.mktpAdmissionCostType.Time"
                    :label="
                        item.title +
                        ' | ￥' +
                        item.unitCost +
                        '/' +
                        item.wareUnitTitle +
                        ' | ' +
                        item.costTypeTitle +
                        '【' +
                        item.statusTitle +
                        '】'
                    "
                    :value="item.id"
                /><t-option
                    v-else
                    :label="
                        item.title +
                        ' | ￥' +
                        item.unitCost +
                        '/' +
                        item.wareUnitTitle +
                        ' | ' +
                        item.costTypeTitle +
                        ' | ￥' +
                        item.minCost +
                        '~￥' +
                        item.maxCost +
                        ' | ' +
                        item.minUnitNum +
                        item.wareUnitTitle +
                        '~' +
                        item.maxUnitNum +
                        item.wareUnitTitle +
                        '【' +
                        item.statusTitle +
                        '】'
                    "
                    :value="item.id"
                />
            </template>
        </t-select>
    </t-form-item>
</template>

<style scoped></style>
