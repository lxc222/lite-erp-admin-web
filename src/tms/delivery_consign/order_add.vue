<script setup lang="jsx">
import { ref, watch, onMounted } from "vue";

import { MessagePlugin } from "tdesign-vue-next";

import { axiosPostJsonBody, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

const thisModel = defineModel();

import form_enum_list from "@/components/form_enum_list.vue";
import t_form_item_delivery_time_range from "@/components/tms/t_form_item_delivery_time_range.vue";
import t_form_item_delivery_vehicle_type from "@/components/tms/t_form_item_delivery_vehicle_type.vue";
import t_form_item_delivery_vehicle_spec from "@/components/tms/t_form_item_delivery_vehicle_spec.vue";

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
        consignBizType: null,
        consignBizOrderNo: null,
        needManualLoad: null,
        needManualUnLoad: null,
        deliveryTimeRangeId: null,
        deliveryVehicleTypeId: null,
        deliveryVehicleSpecId: null,
        deliveryVehicleNum: 1,
        deliveryRemark: null,
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
            order_submit.value.submitData = {
                deliveryVehicleNum: 1
            };
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
                consignBizType: newVal.row.consignBizType,
                consignBizOrderNo: newVal.row.consignBizOrderNo,
                needManualLoad: newVal.row.needManualLoad,
                needManualUnLoad: newVal.row.needManualUnLoad,
                deliveryTimeRangeId: newVal.row.deliveryTimeRangeId,
                deliveryVehicleTypeId: newVal.row.deliveryVehicleTypeId,
                deliveryVehicleSpecId: newVal.row.deliveryVehicleSpecId,
                deliveryVehicleNum: 1,
                remark: newVal.row.remark
            };
        }
    }
});

const doSubmitOrder = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/tms/deliveryConsign/add";
        if (!order_submit.value.addMode) {
            distUrl = "/api/biz/tms/deliveryConsign/change";
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
        header="承运单"
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
            <form_enum_list
                label="委托业务"
                help="*必填"
                v-model="order_submit.submitData.consignBizType"
                :disabled="!order_submit.addMode"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.tmsDeliveryConsignBizType"
            />
            <t-form-item label="业务单号" name="业务单号" help="选填，委托业务对应的单号">
                <t-input
                    placeholder="业务单号"
                    v-model="order_submit.submitData.consignBizOrderNo"
                    :disabled="!order_submit.addMode"
                />
            </t-form-item>
            <t-form-item
                label="需要装车"
                name="需要装车"
                help="*必填，运输公司提供装车人力服务"
                v-show="order_submit.addMode"
            >
                <t-radio-group
                    v-model="order_submit.submitData.needManualLoad"
                    :disabled="!order_submit.addMode"
                >
                    <t-radio
                        v-if="globalLoginData.commonData"
                        v-for="item in globalLoginData.commonData.yesOrNo"
                        :value="item.code"
                        >{{ item.remark }}
                    </t-radio>
                </t-radio-group>
            </t-form-item>
            <t-form-item
                label="需要卸货"
                name="需要卸货"
                help="*必填，运输公司提供卸货人力服务"
                v-show="order_submit.addMode"
            >
                <t-radio-group
                    v-model="order_submit.submitData.needManualUnLoad"
                    :disabled="!order_submit.addMode"
                >
                    <t-radio
                        v-if="globalLoginData.commonData"
                        v-for="item in globalLoginData.commonData.yesOrNo"
                        :value="item.code"
                        >{{ item.remark }}</t-radio
                    >
                </t-radio-group>
            </t-form-item>
            <t_form_item_delivery_time_range
                v-show="order_submit.addMode"
                label="运输时段"
                help="*必填"
                v-model="order_submit.submitData.deliveryTimeRangeId"
                :disabled="!order_submit.addMode"
            />
            <t_form_item_delivery_vehicle_type
                v-show="order_submit.addMode"
                label="运输车型"
                help="*必填"
                v-model="order_submit.submitData.deliveryVehicleTypeId"
                :disabled="!order_submit.addMode"
            />
            <t_form_item_delivery_vehicle_spec
                v-show="order_submit.addMode"
                label="车型载重"
                help="*必填"
                v-model="order_submit.submitData.deliveryVehicleSpecId"
                :disabled="!order_submit.addMode"
            />
            <t-form-item label="车辆数量" name="车辆数量" v-show="order_submit.addMode">
                <t-input v-model="order_submit.submitData.deliveryVehicleNum" />
            </t-form-item>
            <t-form-item label="运输备注" name="运输备注">
                <t-input
                    placeholder="如：保护措施，防水等"
                    v-model="order_submit.submitData.deliveryRemark"
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
