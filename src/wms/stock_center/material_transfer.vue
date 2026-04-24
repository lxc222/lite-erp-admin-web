<script setup lang="jsx">
import { ref, watch, onMounted } from "vue";

const thisModel = defineModel();

import { MessagePlugin } from "tdesign-vue-next";

import { axiosPostJsonBody, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";
import { getOneWmsHouseCenter } from "@/assets/asset_biz_wms_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

import t_form_item_merchant from "@/components/md/t_form_item_merchant.vue";
import t_form_item_employee from "@/components/md/t_form_item_employee.vue";
import form_stock_unit_ratio from "@/components/wms/form_stock_unit_ratio.vue";
import form_spec_material from "@/components/md/form_spec_material.vue";
import t_form_item_house_center_list from "@/components/wms/t_form_item_house_center_list.vue";
import t_form_item_house_region_list from "@/components/wms/t_form_item_house_region_list.vue";
import t_form_item_wms_house_list from "@/components/wms/t_form_item_wms_house_list.vue";
import t_form_item_delivery_time_range from "@/components/tms/t_form_item_delivery_time_range.vue";
import t_form_item_delivery_vehicle_type from "@/components/tms/t_form_item_delivery_vehicle_type.vue";
import t_form_item_delivery_vehicle_spec from "@/components/tms/t_form_item_delivery_vehicle_spec.vue";

const transfer_submit_model = ref({
    visible: false,
    addMode: false,
    tabIndex: "1",
    regionExtOptions: [],
    submitData: {
        srcCenterTitle: null,
        srcCenterId: null,
        srcHouseId: null,
        srcHouseTitle: null,
        srcMerchantId: null,
        srcMerchantTitle: null,
        srcBatchId: null,
        srcBizEmployeeId: null,
        srcDeliveryAddr: null,
        dstCenterId: null,
        dstRegionId: null,
        dstMerchantId: null,
        dstBizEmployeeId: null,
        dstDeliveryAddr: null,
        specMaterialId: null,
        stockUnitRatioId: null,
        srcSpecDetailKey: null,
        stockNum: null,
        needDelivery: null,
        needManualLoad: null,
        needManualUnLoad: null,
        deliveryTimeRangeId: null,
        deliveryVehicleTypeId: null,
        deliveryVehicleSpecId: null,
        deliveryVehicleNum: 1,
        remark: null
    },
    rules: {}
});

function onCleanDeductHouseId() {
    transfer_submit_model.value.submitData.srcHouseId = null;
}

watch(
    thisModel,
    (newVal, oldVal) => {
        const visible = newVal.visible;
        transfer_submit_model.value.visible = visible;
        if (visible) {
            if (!newVal.row) {
                transfer_submit_model.value.addMode = true;
                transfer_submit_model.value.submitData = {};
            } else {
                transfer_submit_model.value.addMode = false;
                transfer_submit_model.value.submitData = {
                    srcCenterId: newVal.row.centerId,
                    srcCenterTitle: newVal.row.centerTitle,
                    srcHouseId: newVal.row.houseId,
                    srcHouseTitle: newVal.row.houseTitle,
                    srcMerchantId: newVal.row.merchantId,
                    srcMerchantTitle: newVal.row.merchantTitle,
                    srcBatchId: newVal.row.batchId,
                    specMaterialId: newVal.row.specMaterialId,
                    stockUnitRatioId: newVal.row.stockUnitRatioId
                };
            }
        }
    },
    { immediate: true, deep: true }
);

const doSubmitTransfer = () => {
    let distUrl = "/api/biz/wms/stockTransfer/add";
    axiosPostJsonBody(distUrl, transfer_submit_model.value.submitData, function (response) {
        if (!isAjaxRspSucc(response)) {
            MessagePlugin.error({
                content: response.data.tipMsg,
                duration: 3000,
                closeBtn: true,
                placement: "center",
                onClose: function () {}
            });
        } else {
            transfer_submit_model.value.visible = false;
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

function onHouseCenterChange() {
    transfer_submit_model.value.submitData.houseId = null;
    getOneWmsHouseCenter(
        transfer_submit_model.value.submitData.dstCenterId,
        function (response) {
            if (response.data.applyDepositFlag == globalConstDef.yesOrNo.Yes) {
                transfer_submit_model.value.regionExtOptions = [
                    { id: -1, title: "--- 使用仓库中心收单 ---" }
                ];
            } else {
                transfer_submit_model.value.regionExtOptions = [];
            }
        },
        function () {
            transfer_submit_model.value.regionExtOptions = [];
        }
    );
}

onMounted(async () => {});
</script>
<template>
    <t-drawer
        id="transfer_submit_model"
        v-model:visible="transfer_submit_model.visible"
        @confirm="doSubmitTransfer"
        size="100%"
        placement="right"
        :closeBtn="true"
        :cancelBtn="null"
        confirmBtn="提交"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
    >
        <template #header>该批次调出</template>
        <t-tabs
            :value="transfer_submit_model.tabIndex"
            size="medium"
            @change="newValue => (transfer_submit_model.tabIndex = newValue)"
        >
            <t-tab-panel id="deduct" value="1" label="调出信息">
                <p style="padding: 15px 0px">
                    <t-form
                        :rules="transfer_submit_model.rules"
                        :data="transfer_submit_model.submitData"
                        requiredMarkPosition="right"
                    >
                        <t_form_item_house_center_list
                            label="调出中心"
                            v-model="transfer_submit_model.submitData.srcCenterId"
                            @change="onCleanDeductHouseId"
                            :disabled="!transfer_submit_model.addMode"
                            help="*必填"
                            :status="globalConstDef.enableModel.Enabled.toString()"
                        />
                        <t_form_item_wms_house_list
                            label="调出仓库"
                            v-model="transfer_submit_model.submitData.srcHouseId"
                            :disabled="!transfer_submit_model.addMode"
                            help="*必填"
                            :status="globalConstDef.enableModel.Enabled.toString()"
                            :houseType="globalConstDef.wmsHouseType.MerchantPublic.toString()"
                            :centerId="transfer_submit_model.submitData.srcCenterId"
                        />
                        <t_form_item_merchant
                            label="调出商户"
                            v-model="transfer_submit_model.submitData.srcMerchantId"
                            :disabled="!transfer_submit_model.addMode"
                            help="*必填"
                            :status="globalConstDef.enableModel.Enabled.toString()"
                        />
                        <form_spec_material
                            label="调出物料"
                            v-model="transfer_submit_model.submitData.specMaterialId"
                            :disabled="!transfer_submit_model.addMode"
                            help="*必填"
                            :status="globalConstDef.enableModel.Enabled.toString()"
                        />
                        <form_stock_unit_ratio
                            label="调出单位"
                            v-model="transfer_submit_model.submitData.stockUnitRatioId"
                            :disabled="!transfer_submit_model.addMode"
                            help="*必填"
                            :status="globalConstDef.enableModel.Enabled.toString()"
                        />
                        <t-form-item label="调出批次" name="调出批次" help="*必填">
                            <t-input
                                placeholder="调出批次"
                                v-model="transfer_submit_model.submitData.srcBatchId"
                                :disabled="!transfer_submit_model.addMode"
                            />
                        </t-form-item>
                        <t_form_item_employee
                            label="调出业务人"
                            help="*必填, 仅展示拥有账号的人员"
                            v-model="transfer_submit_model.submitData.srcBizEmployeeId"
                            :status="globalConstDef.enableModel.Enabled.toString()"
                            :hasAccount="globalConstDef.yesOrNo.Yes.toString()"
                        />
                        <t-form-item
                            label="调出数量"
                            name="调出数量"
                            help="*必填, 输入整数，不支持小数"
                        >
                            <t-input
                                placeholder="调出数量"
                                v-model="transfer_submit_model.submitData.stockNum"
                                type="number"
                            />
                        </t-form-item>
                    </t-form>
                </p>
            </t-tab-panel>
            <t-tab-panel id="deposit" value="2" label="调入信息">
                <p style="padding: 15px 0px">
                    <t-form
                        :rules="transfer_submit_model.rules"
                        :data="transfer_submit_model.submitData"
                        requiredMarkPosition="right"
                    >
                        <t_form_item_house_center_list
                            label="调入中心"
                            v-model="transfer_submit_model.submitData.dstCenterId"
                            @change="onHouseCenterChange()"
                            help="*必填"
                            :status="globalConstDef.enableModel.Enabled.toString()"
                            showMode="stockOperate"
                        />
                        <t_form_item_house_region_list
                            label="入库库区"
                            help="*必填, 如仓库中心不支持收到需要选择区域"
                            v-model="transfer_submit_model.submitData.dstRegionId"
                            :status="globalConstDef.enableModel.Enabled.toString()"
                            :centerId="transfer_submit_model.submitData.dstCenterId"
                            :applyDepositFlag="globalConstDef.yesOrNo.Yes.toString()"
                            :externalOption="transfer_submit_model.regionExtOptions"
                            showMode="stockOperate"
                        />
                        <t_form_item_merchant
                            label="调入商户"
                            v-model="transfer_submit_model.submitData.dstMerchantId"
                            help="*必填"
                            :status="globalConstDef.enableModel.Enabled.toString()"
                        />
                        <t_form_item_employee
                            label="调入业务人"
                            help="*必填, 仅展示拥有账号的人员"
                            v-model="transfer_submit_model.submitData.dstBizEmployeeId"
                            :status="globalConstDef.enableModel.Enabled.toString()"
                            :hasAccount="globalConstDef.yesOrNo.Yes.toString()"
                        />
                    </t-form>
                </p>
            </t-tab-panel>
            <t-tab-panel id="delivery" value="3" label="运输信息">
                <p style="padding: 15px 0px">
                    <t-form
                        :rules="transfer_submit_model.rules"
                        :data="transfer_submit_model.submitData"
                        requiredMarkPosition="right"
                    >
                        <t-form-item
                            label="需要运输"
                            name="需要运输"
                            help="*必填，系统会根据状态创建委托运输单"
                        >
                            <t-radio-group v-model="transfer_submit_model.submitData.needDelivery">
                                <t-radio
                                    v-if="globalLoginData.commonData"
                                    v-for="item in globalLoginData.commonData.yesOrNo"
                                    :value="item.code"
                                    >{{ item.remark }}
                                </t-radio>
                            </t-radio-group>
                        </t-form-item>
                        <t-form-item
                            label="发货地址"
                            name="发货地址"
                            help="*必填，运输发货地址"
                            v-show="
                                transfer_submit_model.submitData.needDelivery ==
                                globalConstDef.yesOrNo.Yes
                            "
                        >
                            <t-input v-model="transfer_submit_model.submitData.srcDeliveryAddr" />
                        </t-form-item>
                        <t-form-item
                            label="收货地址"
                            name="收货地址"
                            help="*必填，运输收货地址"
                            v-show="
                                transfer_submit_model.submitData.needDelivery ==
                                globalConstDef.yesOrNo.Yes
                            "
                        >
                            <t-input v-model="transfer_submit_model.submitData.dstDeliveryAddr" />
                        </t-form-item>
                        <t-form-item
                            label="需要装车"
                            name="需要装车"
                            help="*必填，运输公司提供装车人力服务"
                            v-show="
                                transfer_submit_model.submitData.needDelivery ==
                                globalConstDef.yesOrNo.Yes
                            "
                        >
                            <t-radio-group
                                v-model="transfer_submit_model.submitData.needManualLoad"
                            >
                                <t-radio
                                    v-if="globalLoginData.commonData"
                                    v-for="item in globalLoginData.commonData.yesOrNo"
                                    :value="item.code"
                                    >{{ item.remark }}</t-radio
                                >
                            </t-radio-group>
                        </t-form-item>
                        <t-form-item
                            label="需要卸货"
                            name="需要卸货"
                            help="*必填，运输公司提供卸货人力服务"
                            v-show="
                                transfer_submit_model.submitData.needDelivery ==
                                globalConstDef.yesOrNo.Yes
                            "
                        >
                            <t-radio-group
                                v-model="transfer_submit_model.submitData.needManualUnLoad"
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
                            label="运输时段"
                            help="*必填"
                            v-show="
                                transfer_submit_model.submitData.needDelivery ==
                                globalConstDef.yesOrNo.Yes
                            "
                            v-model="transfer_submit_model.submitData.deliveryTimeRangeId"
                        />
                        <t_form_item_delivery_vehicle_type
                            label="运输车型"
                            help="*必填"
                            v-show="
                                transfer_submit_model.submitData.needDelivery ==
                                globalConstDef.yesOrNo.Yes
                            "
                            v-model="transfer_submit_model.submitData.deliveryVehicleTypeId"
                        />
                        <t_form_item_delivery_vehicle_spec
                            label="车型载重"
                            help="*必填"
                            v-show="
                                transfer_submit_model.submitData.needDelivery ==
                                globalConstDef.yesOrNo.Yes
                            "
                            v-model="transfer_submit_model.submitData.deliveryVehicleSpecId"
                        />
                        <t-form-item
                            label="车辆数量"
                            name="车辆数量"
                            v-show="
                                transfer_submit_model.submitData.needDelivery ==
                                globalConstDef.yesOrNo.Yes
                            "
                        >
                            <t-input
                                v-model="transfer_submit_model.submitData.deliveryVehicleNum"
                                type="number"
                            />
                        </t-form-item>
                        <t-form-item
                            label="运输备注"
                            name="运输备注"
                            help="选填"
                            v-show="
                                transfer_submit_model.submitData.needDelivery ==
                                globalConstDef.yesOrNo.Yes
                            "
                        >
                            <t-input
                                placeholder="如：保护措施，防水等"
                                v-model="transfer_submit_model.submitData.deliveryRemark"
                            />
                        </t-form-item>
                    </t-form>
                </p>
            </t-tab-panel>
            <t-tab-panel id="other" value="4" label="其他信息">
                <p style="padding: 15px 0px">
                    <t-form
                        :rules="transfer_submit_model.rules"
                        :data="transfer_submit_model.submitData"
                        requiredMarkPosition="right"
                    >
                        <t-form-item label="备注信息" name="备注信息">
                            <t-input
                                placeholder="备注信息"
                                v-model="transfer_submit_model.submitData.remark"
                            />
                        </t-form-item>
                    </t-form>
                </p>
            </t-tab-panel>
        </t-tabs>
    </t-drawer>
</template>

<style scoped></style>
