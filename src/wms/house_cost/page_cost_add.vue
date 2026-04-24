<script setup lang="jsx">
import { ref, watch, onMounted } from "vue";

const thisModel = defineModel();

import { MessagePlugin, LoadingPlugin } from "tdesign-vue-next";

import {
    axiosPostJson,
    axiosPostJsonBody,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

import t_form_item_house_center_list from "@/components/wms/t_form_item_house_center_list.vue";
import t_form_item_wms_house_list from "@/components/wms/t_form_item_wms_house_list.vue";
import t_form_item_wms_cost_item from "@/components/wms/t_form_item_wms_cost_item.vue";
import t_form_item_merchant from "@/components/md/t_form_item_merchant.vue";

const datePresets = ref({
    昨天: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    今天: dayjs().format("YYYY-MM-DD")
});

const cost_add_submit_data = ref({
    visible: false,
    addMode: false,
    submitData: {
        id: null,
        houseCenterId: null,
        houseId: null,
        renterId: null,
        costItemId: null,
        cost: null,
        costBeginDate: null,
        costEndDate: null,
        remark: null
    },
    rules: {
        title: [
            { required: true, message: "名称*必填", type: "error", trigger: "blur" },
            {
                required: true,
                message: "名称*必填",
                type: "error",
                trigger: "change"
            }
        ]
    }
});

watch(thisModel, (newVal, oldVal) => {
    const visible = newVal.visible;
    // console.log("visible", newVal);
    if (visible) {
        cost_add_submit_data.value.visible = true;
    } else {
        cost_add_submit_data.value.visible = false;
    }
});

const onSubmitCostData = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/wms/houseCost/add";

        axiosPostJsonBody(distUrl, cost_add_submit_data.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                cost_add_submit_data.value.visible = false;
                MessagePlugin.info({
                    content: response.data.data,
                    duration: 3000,
                    closeBtn: true,
                    placement: "center",
                    onClose: function () {}
                });
            }
        });
    } else {
        // console.log("Validate Errors: ", firstError, validateResult);
        MessagePlugin.error(firstError);
    }
};

onMounted(async () => {});
</script>
<template>
    <t-dialog
        id="cost_add_submit_data"
        v-model:visible="cost_add_submit_data.visible"
        width="50%"
        header="费用信息"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
    >
        <t-form
            :rules="cost_add_submit_data.rules"
            :data="cost_add_submit_data.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitCostData"
        >
            <t_form_item_house_center_list
                label="仓库中心"
                help="*必填"
                v-model="cost_add_submit_data.submitData.houseCenterId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                @change="cost_add_submit_data.submitData.houseId = null"
            />
            <t_form_item_wms_house_list
                label="直租仓库"
                help="*必填"
                v-model="cost_add_submit_data.submitData.houseId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :houseType="globalConstDef.wmsHouseType.MerchantPrivate.toString()"
                :centerId="cost_add_submit_data.submitData.houseCenterId"
            />
            <t_form_item_merchant
                label="内部商户"
                help="*必填"
                v-model="cost_add_submit_data.submitData.renterId"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <t_form_item_wms_cost_item
                label="费用科目"
                help="*必填"
                v-model="cost_add_submit_data.submitData.costItemId"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <t-form-item label="费用金额" name="费用金额" help="*必填">
                <t-input
                    label="￥"
                    suffix="元"
                    type="number"
                    placeholder="费用金额"
                    v-model="cost_add_submit_data.submitData.cost"
                />
            </t-form-item>
            <t-form-item label="费用起始" name="费用起始" help="">
                <t-date-picker
                    v-model="cost_add_submit_data.submitData.costBeginDate"
                    :presets="datePresets"
                />
            </t-form-item>
            <t-form-item label="费用截止" name="费用截止" help="">
                <t-date-picker
                    v-model="cost_add_submit_data.submitData.costEndDate"
                    :presets="datePresets"
                />
            </t-form-item>
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="cost_add_submit_data.submitData.remark" />
            </t-form-item>
            <t-form-item>
                <t-space size="small">
                    <t-button theme="default" variant="base" type="reset">重置</t-button>
                    <t-button theme="primary" type="submit">提交</t-button>
                </t-space>
            </t-form-item>
        </t-form>
    </t-dialog>
</template>

<style scoped></style>
