<script setup lang="jsx">
import { ref, watch, onMounted } from "vue";

const thisModel = defineModel();

import { MessagePlugin } from "tdesign-vue-next";
import { axiosPostJsonBody, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

import { getOneWmsHouseRack } from "@/assets/asset_biz_wms_20251024.js";

import form_enum_radio_group from "@/components/form_enum_radio_group.vue";
import t_form_item_house_center_list from "@/components/wms/t_form_item_house_center_list.vue";
import t_form_item_wms_house_list from "@/components/wms/t_form_item_wms_house_list.vue";

const rack_submit_model = ref({
    visible: false,
    addMode: false,
    submitData: {
        id: null,
        title: null,
        centerId: null,
        houseId: null,
        status: null,
        remark: null
    },
    rules: {}
});

watch(thisModel, (newVal, oldVal) => {
    const visible = newVal.visible;
    const addMode = newVal.addMode;
    rack_submit_model.value.addMode = addMode;
    // console.log("visible", newVal);
    if (visible) {
        if (addMode) {
            rack_submit_model.value.submitData = {};
            rack_submit_model.value.visible = true;
        } else {
            rack_submit_model.value.submitData = {};
            getOneWmsHouseRack(
                newVal.rackId,
                function (response) {
                    rack_submit_model.value.submitData = response.data;
                    // rack_submit_model.value.submitData.houseId = response.data.houseId.toString();
                    rack_submit_model.value.visible = true;
                },
                function () {
                    MessagePlugin.error({
                        content: response.data.tipMsg,
                        duration: 3000,
                        closeBtn: true,
                        placement: "center",
                        onClose: function () {}
                    });
                }
            );
        }
    }
});

const onSubmitRentData = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/wms/houseRack/add";
        if (rack_submit_model.value.submitData.id > 0) {
            distUrl = "/api/biz/wms/houseRack/change";
        }

        axiosPostJsonBody(distUrl, rack_submit_model.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                rack_submit_model.value.visible = false;
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
        id="rack_submit_model"
        v-model:visible="rack_submit_model.visible"
        header="租赁信息"
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
            :rules="rack_submit_model.rules"
            :data="rack_submit_model.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitRentData"
        >
            <t_form_item_house_center_list
                label="仓库中心"
                help="*必填"
                v-model="rack_submit_model.submitData.centerId"
                @change="rack_submit_model.submitData.houseId = null"
                :disabled="!rack_submit_model.addMode"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <t_form_item_wms_house_list
                label="归属仓库"
                help="*必填"
                v-model="rack_submit_model.submitData.houseId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :centerId="rack_submit_model.submitData.centerId"
                :houseType="globalConstDef.wmsHouseType.MerchantPublic.toString()"
            />
            <t-form-item label="库位编号" name="库位编号">
                <t-input placeholder="库位编号" v-model="rack_submit_model.submitData.title" />
            </t-form-item>
            <form_enum_radio_group
                label="是否启用"
                v-model="rack_submit_model.submitData.status"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="rack_submit_model.submitData.remark" />
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
