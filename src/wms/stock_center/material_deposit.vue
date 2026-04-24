<script setup lang="jsx">
import { ref, watch, onMounted, useAttrs } from "vue";

const thisModel = defineModel();

import { MessagePlugin } from "tdesign-vue-next";

import { axiosPostJsonBody, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";
import { getOneWmsStockBatch, getOneWmsHouseCenter } from "@/assets/asset_biz_wms_20251024.js";
import { oneSpecMaterialById } from "@/assets/asset_biz_md_20251024.js";

import form_enum_radio_group from "@/components/form_enum_radio_group.vue";
import t_form_item_merchant from "@/components/md/t_form_item_merchant.vue";
import t_form_item_employee from "@/components/md/t_form_item_employee.vue";
import form_stock_unit_ratio from "@/components/wms/form_stock_unit_ratio.vue";
import form_spec_material from "@/components/md/form_spec_material.vue";
import t_form_item_house_center_list from "@/components/wms/t_form_item_house_center_list.vue";
import t_form_item_house_region_list from "@/components/wms/t_form_item_house_region_list.vue";
import t_form_item_stock_adjust_time_range from "@/components/wms/t_form_item_stock_adjust_time_range.vue";
import form_stock_group_list from "@/components/wms/form_stock_group_list.vue";

const attrs = useAttrs();

const datePresets = ref({
    今天: dayjs().format("YYYY-MM-DD"),
    明天: dayjs().add(1, "day").format("YYYY-MM-DD"),
    后天: dayjs().add(2, "day").format("YYYY-MM-DD")
});

function initMaterialUnitId() {
    if (
        !deposit_submit_model.value.submitData.specMaterialId ||
        deposit_submit_model.value.submitData.specMaterialId < 1
    ) {
        return;
    }

    oneSpecMaterialById(
        deposit_submit_model.value.submitData.specMaterialId,
        response => {
            onSpecMaterialChange(response.data.unitId);
        },
        response => {}
    );
}

function createEmptySubmitModel() {
    return {
        merchantId: null,
        centerId: null,
        regionId: null,
        stockUnitRatioId: null,
        batchGroupId: null,
        specMaterialId: null,
        stockNum: null,
        adjustDate: null,
        adjustTimeRangeId: null,
        bizEmployeeId: null,
        refBizOrderNo: null,
        deductNeedAuth: null,
        deductForDepartment: null,
        deductForOtherDepartment: null,
        retentionNotice: null,
        retentionDays: null,
        retentionNoticeEmployeeNos: null,
        remark: null
    };
}

function onBatchGroupChange(vo) {
    console.log("onBatchGroupChange", JSON.stringify(vo));
}

const deposit_submit_model = ref({
    visible: false,
    regionExtOptions: [],
    disables: {
        centerId: false,
        merchantId: false,
        specMaterialId: false,
        stockUnitRatioId: false
    },
    materialUnitId: null,
    submitData: createEmptySubmitModel(),
    rules: {}
});

function resetDisableValue() {
    if (
        deposit_submit_model.value.submitData.centerId &&
        deposit_submit_model.value.submitData.centerId > 0
    ) {
        deposit_submit_model.value.disables.centerId = true;
    }

    if (
        deposit_submit_model.value.submitData.merchantId &&
        deposit_submit_model.value.submitData.merchantId > 0
    ) {
        deposit_submit_model.value.disables.merchantId = true;
    }

    if (
        deposit_submit_model.value.submitData.specMaterialId &&
        deposit_submit_model.value.submitData.specMaterialId > 0
    ) {
        deposit_submit_model.value.disables.specMaterialId = true;
    }

    if (
        deposit_submit_model.value.submitData.stockUnitRatioId &&
        deposit_submit_model.value.submitData.stockUnitRatioId > 0
    ) {
        deposit_submit_model.value.disables.stockUnitRatioId = true;
    }
}

function onCenterChange() {
    deposit_submit_model.value.submitData.houseId = null;
    getOneWmsHouseCenter(
        deposit_submit_model.value.submitData.centerId,
        function (response) {
            if (response.data.applyDepositFlag == globalConstDef.yesOrNo.Yes) {
                deposit_submit_model.value.regionExtOptions = [
                    { id: -1, title: "--- 使用仓库中心收单 ---" }
                ];
            } else {
                deposit_submit_model.value.regionExtOptions = [];
            }
        },
        function () {
            deposit_submit_model.value.regionExtOptions = [];
        }
    );
}

function onSpecMaterialChange(unitId) {
    deposit_submit_model.value.materialUnitId = unitId;
}

watch(
    thisModel,
    (newVal, oldVal) => {
        const visible = newVal.visible;
        deposit_submit_model.value.visible = visible;
        // console.log("attrs.stockUnitRatioId", attrs.stockUnitRatioId);
        // console.log("newVal", JSON.stringify(newVal));
        if (visible) {
            deposit_submit_model.value.submitData = createEmptySubmitModel();
            deposit_submit_model.value.submitData.bizEmployeeId = attrs.bizEmployeeId;
            deposit_submit_model.value.submitData.refBizOrderNo = attrs.refBizOrderNo;
            deposit_submit_model.value.submitData.centerId = attrs.centerId;
            deposit_submit_model.value.submitData.regionId = attrs.regionId;
            deposit_submit_model.value.submitData.merchantId = attrs.merchantId;
            deposit_submit_model.value.submitData.specMaterialId = attrs.specMaterialId;
            deposit_submit_model.value.submitData.stockUnitRatioId = attrs.stockUnitRatioId;

            resetDisableValue();

            if (newVal.batchId && newVal.batchId.length > 0) {
                getOneWmsStockBatch(
                    newVal.batchId,
                    response => {
                        deposit_submit_model.value.submitData = createEmptySubmitModel();
                        deposit_submit_model.value.submitData.bizEmployeeId = attrs.bizEmployeeId;
                        deposit_submit_model.value.submitData.refBizOrderNo = attrs.refBizOrderNo;

                        if (attrs.centerId && attrs.centerId > 0) {
                            deposit_submit_model.value.submitData.centerId = attrs.centerId;
                        } else {
                            deposit_submit_model.value.submitData.centerId = response.data.centerId;
                        }

                        if (attrs.regionId && attrs.regionId > 0) {
                            deposit_submit_model.value.submitData.regionId = attrs.regionId;
                        } else {
                            deposit_submit_model.value.submitData.regionId = response.data.regionId;
                        }

                        deposit_submit_model.value.submitData.merchantId = response.data.merchantId;
                        deposit_submit_model.value.submitData.specMaterialId =
                            response.data.specMaterialId;
                        deposit_submit_model.value.submitData.stockUnitRatioId =
                            response.data.stockUnitRatioId;

                        resetDisableValue();
                    },
                    response => {
                        deposit_submit_model.value.visible = false;
                    }
                );
            }

            initMaterialUnitId();
        }
    },
    { immediate: true, deep: true }
);

const doSubmitDeposit = () => {
    let distUrl = attrs.dstUrl ? attrs.dstUrl : "/api/biz/wms/stockAdjust/deposit";
    axiosPostJsonBody(distUrl, deposit_submit_model.value.submitData, function (response) {
        if (!isAjaxRspSucc(response)) {
            MessagePlugin.error({
                content: response.data.tipMsg,
                duration: 3000,
                closeBtn: true,
                placement: "center",
                onClose: function () {}
            });
        } else {
            deposit_submit_model.value.visible = false;
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
        id="deposit_submit_model"
        v-model:visible="deposit_submit_model.visible"
        @confirm="doSubmitDeposit"
        size="80%"
        placement="right"
        :closeBtn="true"
        :cancelBtn="null"
        confirmBtn="提交"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
    >
        <template #header>物料入库</template>
        <t-form
            :rules="deposit_submit_model.rules"
            :data="deposit_submit_model.submitData"
            requiredMarkPosition="right"
        >
            <form_spec_material
                label="入库物料"
                v-model="deposit_submit_model.submitData.specMaterialId"
                help="*必填"
                :disabled="deposit_submit_model.disables.specMaterialId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                @change="onSpecMaterialChange"
            />
            <form_stock_unit_ratio
                label="入库单位"
                v-model="deposit_submit_model.submitData.stockUnitRatioId"
                help="*必填"
                :disabled="deposit_submit_model.disables.stockUnitRatioId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :materialUnitId="deposit_submit_model.materialUnitId"
            />
            <t_form_item_merchant
                label="归属商户"
                v-model="deposit_submit_model.submitData.merchantId"
                help="*必填"
                :disabled="deposit_submit_model.disables.merchantId"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <t_form_item_house_center_list
                label="入库中心"
                v-model="deposit_submit_model.submitData.centerId"
                @change="onCenterChange()"
                help="*必填"
                :disabled="deposit_submit_model.disables.centerId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                showMode="stockOperate"
            />
            <t_form_item_house_region_list
                label="入库库区"
                help="*必填, 如仓库中心不支持收到需要选择区域"
                v-model="deposit_submit_model.submitData.regionId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :centerId="deposit_submit_model.submitData.centerId"
                :applyDepositFlag="globalConstDef.yesOrNo.Yes.toString()"
                :externalOption="deposit_submit_model.regionExtOptions"
                showMode="stockOperate"
            />
            <t-form-item label="入库数量" name="入库数量" help="*必填, 输入大于0的整数，不支持小数">
                <t-input
                    placeholder="入库数量"
                    v-model="deposit_submit_model.submitData.stockNum"
                    type="number"
                    suffix="入库单位"
                />
            </t-form-item>
            <t-form-item label="入库日期" name="入库日期" help="*必填">
                <t-date-picker
                    v-model="deposit_submit_model.submitData.adjustDate"
                    :presets="datePresets"
                    :clearable="true"
                    :allowInput="false"
                    :enableTimePicker="false"
                    format="YYYY-MM-DD"
                />
            </t-form-item>
            <t_form_item_stock_adjust_time_range
                label="入库时段"
                help="*必填，需要避开高峰时段"
                v-model="deposit_submit_model.submitData.adjustTimeRangeId"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <t_form_item_employee
                label="入库业务人"
                help="*必填, 仅展示拥有账号的人员，区别于系统操作人，方便库管人员带提单"
                v-model="deposit_submit_model.submitData.bizEmployeeId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :hasAccount="globalConstDef.yesOrNo.Yes.toString()"
            />
            <form_stock_group_list
                label="批次分组"
                v-model="deposit_submit_model.submitData.batchGroupId"
                help="*必填, 归属到该分组下的批次统一进行安全库存、出库、库龄管控"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :externalOption="[{ title: '### 不关联任何分组 ###', id: -1 }]"
                @valueChange="onBatchGroupChange"
            />
            <t-divider> 出库授权 </t-divider>
            <form_enum_radio_group
                label="出库授权"
                help="*必填, 如选中则出库首先需要入库业务人或者入库业务人直接主管审批"
                v-model="deposit_submit_model.submitData.deductNeedAuth"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.yesOrNo"
            />
            <form_enum_radio_group
                label="同部门可出库"
                help="*必填，如选中则入库人员同部门人员亦可提交库调申请"
                v-model="deposit_submit_model.submitData.deductForDepartment"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.yesOrNo"
            />
            <form_enum_radio_group
                label="其他部门可出库"
                help="*必填，如选中则非入库人员部门人员亦可出库"
                v-model="deposit_submit_model.submitData.deductForOtherDepartment"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.yesOrNo"
            />
            <t-divider> 库龄预警提醒 </t-divider>
            <form_enum_radio_group
                label="库龄预警"
                help="*必填，在库滞留超过一定天数触发，系统会在前一日13:00～18:00间发送邮件提醒"
                v-model="deposit_submit_model.submitData.retentionNotice"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.detentionNoticeType"
            />
            <t-form-item
                label="库龄天数"
                name="库龄天数"
                help="*必填"
                v-show="
                    deposit_submit_model.submitData.retentionNotice &&
                    deposit_submit_model.submitData.retentionNotice !=
                        globalConstDef.detentionNoticeType.NoNotice
                "
            >
                <t-input
                    placeholder="在库库龄预警天数"
                    suffix="天"
                    v-model="deposit_submit_model.submitData.retentionDays"
                />
            </t-form-item>
            <t-form-item
                label="其他提醒人员"
                name="其他提醒人员"
                help="选填，除了入库业务人之外的人员"
                v-show="
                    deposit_submit_model.submitData.retentionNotice &&
                    deposit_submit_model.submitData.retentionNotice !=
                        globalConstDef.detentionNoticeType.NoNotice
                "
            >
                <t-input
                    placeholder="请填写人员工号，多个人员使用英文逗号分隔"
                    v-model="deposit_submit_model.submitData.retentionNoticeEmployeeNos"
                />
            </t-form-item>
            <t-divider> 其他信息 </t-divider>
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="deposit_submit_model.submitData.remark" />
            </t-form-item>
        </t-form>
    </t-drawer>
</template>

<style scoped></style>
