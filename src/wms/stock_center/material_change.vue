<script setup lang="jsx">
import { ref, watch, onMounted } from "vue";

const thisModel = defineModel();

import { MessagePlugin } from "tdesign-vue-next";

import { axiosPostJsonBody, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";
import { getOneWmsHouseCenter } from "@/assets/asset_biz_wms_20251024.js";

import form_enum_radio_group from "@/components/form_enum_radio_group.vue";
import t_form_item_merchant from "@/components/md/t_form_item_merchant.vue";
import t_form_item_employee from "@/components/md/t_form_item_employee.vue";
import form_stock_unit_ratio from "@/components/wms/form_stock_unit_ratio.vue";
import form_spec_material from "@/components/md/form_spec_material.vue";
import t_form_item_house_center_list from "@/components/wms/t_form_item_house_center_list.vue";
import t_form_item_house_region_list from "@/components/wms/t_form_item_house_region_list.vue";
import t_form_item_stock_adjust_time_range from "@/components/wms/t_form_item_stock_adjust_time_range.vue";
import form_stock_group_list from "@/components/wms/form_stock_group_list.vue";

const datePresets = ref({
    今天: dayjs().format("YYYY-MM-DD"),
    明天: dayjs().add(1, "day").format("YYYY-MM-DD"),
    后天: dayjs().add(2, "day").format("YYYY-MM-DD")
});

function createEmptySubmitModel() {
    return {
        batchId: null,
        batchGroupId: null,
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
    submitData: createEmptySubmitModel(),
    rules: {}
});

watch(
    thisModel,
    (newVal, oldVal) => {
        const visible = newVal.visible;
        // console.log("c_dialog_material_deposit thisModel.visible:", visible);
        if (visible) {
            if (!newVal.row) {
                MessagePlugin.error({
                    content: "无法加载批次信息",
                    duration: 3000,
                    closeBtn: true,
                    placement: "center",
                    onClose: function () {}
                });
            } else {
                deposit_submit_model.value.visible = visible;
                deposit_submit_model.value.submitData = {
                    batchId: newVal.row.batchId,
                    batchGroupId: newVal.row.batchGroupId,
                    deductNeedAuth: newVal.row.deductNeedAuth,
                    deductForDepartment: newVal.row.deductForDepartment,
                    deductForOtherDepartment: newVal.row.deductForOtherDepartment,
                    retentionNotice: newVal.row.retentionNotice,
                    retentionDays: newVal.row.retentionDays,
                    retentionNoticeEmployeeNos: newVal.row.retentionNoticeEmployeeNos,
                    remark: newVal.row.remark
                };
            }
        }
    },
    { immediate: true, deep: true }
);

const doSubmitChange = () => {
    let distUrl = "/api/biz/wms/stockCenter/change";
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
        @confirm="doSubmitChange"
        size="40%"
        placement="right"
        :closeBtn="true"
        :cancelBtn="null"
        confirmBtn="提交"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
    >
        <template #header>批次修改</template>
        <t-form
            :rules="deposit_submit_model.rules"
            :data="deposit_submit_model.submitData"
            requiredMarkPosition="right"
        >
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
                help="*必填, 如选中则出库首先需要入业务人或者入库业务人直接主管审批"
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
