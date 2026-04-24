<script setup lang="jsx">
import { ref, watch, onMounted } from "vue";

import { MessagePlugin } from "tdesign-vue-next";

import { axiosPostJsonBody, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";

const thisModel = defineModel();

const order_submit = ref({
    visible: false,
    addMode: false,
    submitData: {
        id: null,
        shipPerson: null,
        shipPhone: null,
        shipAddr: null,
        receivePerson: null,
        receivePhone: null,
        receiveAddr: null,
        deliveryType: null,
        bizOrderType: null,
        bizOrderNo: null,
        backOrderNo: null,
        remark: null
    },
    rules: {}
});

watch(thisModel, (newVal, oldVal) => {
    const visible = newVal.visible;
    order_submit.value.visible = visible;
    if (visible) {
        if (!newVal.row) {
            order_submit.value.addMode = true;
            order_submit.value.submitData = {};
        } else {
            order_submit.value.addMode = false;
            order_submit.value.submitData = {
                id: newVal.row.id,
                shipPerson: newVal.row.shipPerson,
                shipPhone: newVal.row.shipPhone,
                shipAddr: newVal.row.shipAddr,
                receivePerson: newVal.row.receivePerson,
                receivePhone: newVal.row.receivePhone,
                receiveAddr: newVal.row.receiveAddr,
                deliveryType: newVal.row.deliveryType,
                bizOrderType: newVal.row.bizOrderType,
                bizOrderNo: newVal.row.bizOrderNo,
                backOrderNo: newVal.row.backOrderNo,
                remark: newVal.row.remark
            };
        }
    }
});

const doSubmitOrder = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/tms/deliveryOrder/add";
        if (!order_submit.value.addMode) {
            distUrl = "/api/biz/tms/deliveryOrder/change";
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
        header="运输单"
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
            <t-form-item label="发货人" name="发货人" help="*必填">
                <t-input
                    placeholder="发货人名"
                    v-model="order_submit.submitData.shipPerson"
                    :disabled="!order_submit.addMode"
                />
            </t-form-item>
            <t-form-item label="发货电话" name="发货电话" help="*必填">
                <t-input
                    placeholder="发货电话"
                    v-model="order_submit.submitData.shipPhone"
                    :disabled="!order_submit.addMode"
                />
            </t-form-item>
            <t-form-item label="发货地址" name="发货地址" help="*必填">
                <t-input
                    placeholder="发货地址"
                    v-model="order_submit.submitData.shipAddr"
                    :disabled="!order_submit.addMode"
                />
            </t-form-item>
            <t-form-item label="收货人" name="收货人" help="*必填">
                <t-input
                    placeholder="收货人"
                    v-model="order_submit.submitData.receivePerson"
                    :disabled="!order_submit.addMode"
                />
            </t-form-item>
            <t-form-item label="收货电话" name="收货电话" help="*必填">
                <t-input
                    placeholder="收货电话"
                    v-model="order_submit.submitData.receivePhone"
                    :disabled="!order_submit.addMode"
                />
            </t-form-item>
            <t-form-item label="收货地址" name="收货地址" help="*必填">
                <t-input
                    placeholder="收货地址"
                    v-model="order_submit.submitData.receiveAddr"
                    :disabled="!order_submit.addMode"
                />
            </t-form-item>
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
