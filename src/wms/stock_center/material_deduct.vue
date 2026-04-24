<script setup lang="jsx">
import { ref, watch, onMounted, useAttrs } from "vue";

const thisModel = defineModel();

import { MessagePlugin } from "tdesign-vue-next";

import {
    axiosPostJson,
    axiosPostJsonBody,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

import { getOneWmsStockBatch } from "@/assets/asset_biz_wms_20251024.js";

import t_form_item_merchant from "@/components/md/t_form_item_merchant.vue";
import t_form_item_employee from "@/components/md/t_form_item_employee.vue";
import form_stock_unit_ratio from "@/components/wms/form_stock_unit_ratio.vue";
import form_spec_material from "@/components/md/form_spec_material.vue";
import t_form_item_house_center_list from "@/components/wms/t_form_item_house_center_list.vue";
import t_form_item_wms_house_list from "@/components/wms/t_form_item_wms_house_list.vue";
import t_form_item_stock_adjust_time_range from "@/components/wms/t_form_item_stock_adjust_time_range.vue";

const attrs = useAttrs();

const datePresets = ref({
    今天: dayjs().format("YYYY-MM-DD"),
    明天: dayjs().add(1, "day").format("YYYY-MM-DD"),
    后天: dayjs().add(2, "day").format("YYYY-MM-DD")
});

const this_batchId = ref(null);

const deduct_submit_data = ref({
    visible: false,
    storeHouseList: [],
    submitData: {
        centerId: null,
        houseId: null,
        stockUnitRatioId: null,
        specMaterialId: null,
        specDetailKey: null,
        stockNum: null,
        adjustDate: null,
        adjustTimeRangeId: null,
        bizEmployeeId: null,
        refBizOrderNo: null,
        remark: null,
        batchId: null
    },
    rules: {}
});

async function onCleanHouseId() {
    deduct_submit_data.value.submitData.houseId = null;
}

watch(
    thisModel,
    (newVal, oldVal) => {
        const visible = newVal.visible;
        this_batchId.value = newVal.batchId;
        deduct_submit_data.value.visible = visible;
        if (visible) {
            if (!newVal.batchId) {
                deduct_submit_data.value.submitData = {
                    bizEmployeeId: attrs.bizEmployeeId,
                    refBizOrderNo: attrs.refBizOrderNo
                };
            } else {
                getOneWmsStockBatch(
                    newVal.batchId,
                    response => {
                        deduct_submit_data.value.submitData = {
                            centerId: response.data.centerId,
                            houseId: response.data.houseId,
                            merchantId: response.data.merchantId,
                            specMaterialId: response.data.specMaterialId,
                            specDetailKey: response.data.materialSpecDetailKey,
                            stockUnitRatioId: response.data.stockUnitRatioId,
                            batchId: response.data.batchId,
                            bizEmployeeId: attrs.bizEmployeeId,
                            refBizOrderNo: attrs.refBizOrderNo
                        };
                    },
                    response => {
                        deduct_submit_data.value.visible = false;
                    }
                );
            }
        }
    },
    { immediate: true, deep: true }
);

const doSubmitDeduct = () => {
    let distUrl = attrs.dstUrl ? attrs.dstUrl : "/api/biz/wms/stockAdjust/deduct";
    axiosPostJsonBody(distUrl, deduct_submit_data.value.submitData, function (response) {
        if (!isAjaxRspSucc(response)) {
            MessagePlugin.error({
                content: response.data.tipMsg,
                duration: 3000,
                closeBtn: true,
                placement: "center",
                onClose: function () {}
            });
        } else {
            deduct_submit_data.value.visible = false;
            MessagePlugin.info({
                content: response.data.data,
                duration: 3000,
                closeBtn: true,
                placement: "center",
                onClose: function () {}
            });
        }
    });
};

onMounted(async () => {});
</script>
<template>
    <t-drawer
        id="deduct_submit_data"
        v-model:visible="deduct_submit_data.visible"
        @confirm="doSubmitDeduct"
        size="80%"
        placement="right"
        :closeBtn="true"
        :cancelBtn="null"
        confirmBtn="提交"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
    >
        <template #header>物料出库</template>
        <t-form
            :rules="deduct_submit_data.rules"
            :data="deduct_submit_data.submitData"
            requiredMarkPosition="right"
            @submit="doSubmitDeduct"
        >
            <form_spec_material
                label="出库物料"
                v-model="deduct_submit_data.submitData.specMaterialId"
                help="*必填"
                :disabled="this_batchId && this_batchId.length > 0"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <form_stock_unit_ratio
                label="出库单位"
                v-model="deduct_submit_data.submitData.stockUnitRatioId"
                help="*必填"
                :disabled="this_batchId && this_batchId.length > 0"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <t_form_item_merchant
                label="归属商户"
                v-model="deduct_submit_data.submitData.merchantId"
                help="*必填"
                :disabled="this_batchId && this_batchId.length > 0"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <t_form_item_house_center_list
                label="出库中心"
                v-model="deduct_submit_data.submitData.centerId"
                @change="onCleanHouseId"
                help="*必填"
                :disabled="this_batchId && this_batchId.length > 0"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <t_form_item_wms_house_list
                label="出库仓库"
                v-model="deduct_submit_data.submitData.houseId"
                help="*必填"
                :disabled="this_batchId && this_batchId.length > 0"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :houseType="globalConstDef.wmsHouseType.MerchantPublic.toString()"
                :centerId="deduct_submit_data.submitData.centerId"
            />
            <t-form-item label="出库批次" name="出库批次" help="*必填">
                <t-input
                    placeholder="出库批次"
                    v-model="deduct_submit_data.submitData.batchId"
                    :disabled="this_batchId && this_batchId.length > 0"
                />
            </t-form-item>
            <t-form-item label="出库数量" name="出库数量" help="*必填, 输入大于0的整数，不支持小数">
                <t-input
                    placeholder="出库数量"
                    v-model="deduct_submit_data.submitData.stockNum"
                    type="number"
                    suffix="出库单位"
                />
            </t-form-item>
            <t-form-item label="出库日期" name="出库日期" help="*必填">
                <t-date-picker
                    v-model="deduct_submit_data.submitData.adjustDate"
                    :presets="datePresets"
                    :clearable="true"
                    :allowInput="false"
                    :enableTimePicker="false"
                    format="YYYY-MM-DD"
                />
            </t-form-item>
            <t_form_item_stock_adjust_time_range
                label="出库时段"
                help="*必填"
                v-model="deduct_submit_data.submitData.adjustTimeRangeId"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <t_form_item_employee
                label="出库业务人"
                help="*必填, 仅展示拥有账号的人员"
                v-model="deduct_submit_data.submitData.bizEmployeeId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :hasAccount="globalConstDef.yesOrNo.Yes.toString()"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="deduct_submit_data.submitData.remark" />
            </t-form-item>
        </t-form>
    </t-drawer>
</template>

<style scoped></style>
