<script setup lang="jsx">
import { ref, watch, onMounted } from "vue";

import { MessagePlugin } from "tdesign-vue-next";

import { axiosPostJsonBody, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

const thisModel = defineModel();

import t_form_item_delivery_corp from "@/components/tms/t_form_item_delivery_corp.vue";
import t_form_item_self_vehicle_driver from "@/components/tms/t_form_item_self_vehicle_driver.vue";

const order_submit = ref({
    visible: false,
    addMode: false,
    dispatch: false,
    submitData: {
        orderId: null,
        deliveryCorpType: null,
        deliveryCorpId: null,
        deliveryVehicleId: null,
        deliveryDriverId: null,
        remark: null
    },
    rules: {}
});

watch(thisModel, (newVal, oldVal) => {
    const visible = newVal.visible;
    order_submit.value.visible = visible;
    if (visible) {
        order_submit.value.addMode = false;
        order_submit.value.dispatch = newVal.dispatch;
        order_submit.value.submitData = {
            orderId: newVal.row.id
        };
    }
});

function onDeliveryCorpChange() {
    order_submit.value.submitData.deliveryVehicleId = null;
    order_submit.value.submitData.deliveryDriverId = null;
}

const doSubmitOrder = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/tms/deliveryOrder/dispatch";
        if (!order_submit.value.dispatch) {
            distUrl = "/api/biz/tms/deliveryOrder/redispatch";
        }

        axiosPostJsonBody(distUrl, order_submit.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                order_submit.value.visible = false;
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
        id="order_submit"
        v-model:visible="order_submit.visible"
        header="承运派单"
        width="50%"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
    >
        <t-form
            :rules="order_submit.rules"
            :data="order_submit.submitData"
            requiredMarkPosition="right"
            @submit="doSubmitOrder"
        >
            <t_form_item_delivery_corp
                label="承运商"
                help="*必填"
                v-model:corpId="order_submit.submitData.deliveryCorpId"
                v-model:corpType="order_submit.submitData.deliveryCorpType"
                :status="globalConstDef.enableModel.Enabled.toString()"
                @change="onDeliveryCorpChange"
            />
            <t_form_item_self_vehicle_driver
                label="车辆&司机"
                help="*必填"
                v-model:selectVehicleId="order_submit.submitData.deliveryVehicleId"
                v-model:selectDriverId="order_submit.submitData.deliveryDriverId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                v-show="
                    order_submit.submitData.deliveryCorpType ==
                    globalConstDef.tmsDeliveryCorpType.Self
                "
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="order_submit.submitData.remark" />
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
