<script setup lang="jsx">
import { ref, watch, onMounted } from "vue";

const thisModel = defineModel();

import { MessagePlugin } from "tdesign-vue-next";

import {
    axiosPostJson,
    axiosPostJsonBody,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

import form_enum_radio_group from "@/components/form_enum_radio_group.vue";
import t_form_item_mkp_store_center from "@/components/mktp/t_form_item_mkp_store_center.vue";
import t_form_item_mkp_store_region_list from "@/components/mktp/t_form_item_mkp_store_region_list.vue";

const house_submit_data = ref({
    visible: false,
    addMode: false,
    storeRegionList: [],
    submitData: {
        title: null,
        storeCenterId: null,
        storeRegionId: null,
        squareSize: null,
        orderWeight: null,
        status: null,
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
    const addMode = newVal.addMode;
    house_submit_data.value.addMode = addMode;
    // console.log("visible", newVal);
    if (visible) {
        if (addMode) {
            house_submit_data.value.submitData = { status: globalConstDef.enableModel.Enabled };
            if (newVal.storeCenterId) {
                house_submit_data.value.submitData.storeCenterId = newVal.storeCenterId;
            }

            if (newVal.storeRegionId) {
                house_submit_data.value.submitData.storeRegionId = newVal.storeRegionId;
            }

            house_submit_data.value.visible = true;
        } else {
            house_submit_data.value.submitData = {};

            if (newVal.storeCenterId) {
                house_submit_data.value.submitData.storeCenterId = newVal.storeCenterId;
            }

            if (newVal.storeRegionId) {
                house_submit_data.value.submitData.storeRegionId = newVal.storeRegionId;
            }

            axiosPostJson(
                "/api/biz/mktp/store/oneById",
                {
                    itemId: newVal.houseId
                },
                function (response) {
                    if (isAjaxRspSucc(response)) {
                        house_submit_data.value.submitData = response.data.data;
                        house_submit_data.value.visible = true;
                    } else {
                        MessagePlugin.error({
                            content: response.data.tipMsg,
                            duration: 3000,
                            closeBtn: true,
                            placement: "center",
                            onClose: function () {}
                        });
                    }
                }
            );
        }
    }
});

const onSubmitHouse = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/mktp/store/add";
        if (house_submit_data.value.submitData.id > 0) {
            distUrl = "/api/biz/mktp/store/change";
        }

        axiosPostJsonBody(distUrl, house_submit_data.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                house_submit_data.value.visible = false;
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
        v-model:visible="house_submit_data.visible"
        header="商铺"
        id="house_submit_data"
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
            :rules="house_submit_data.rules"
            :data="house_submit_data.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitHouse"
        >
            <t_form_item_mkp_store_center
                label="商铺中心"
                help="*必填"
                v-model="house_submit_data.submitData.storeCenterId"
                :disabled="!house_submit_data.addMode"
                @change="house_submit_data.submitData.storeRegionId = null"
            />
            <t_form_item_mkp_store_region_list
                label="商铺区域"
                help="*必填"
                v-model="house_submit_data.submitData.storeRegionId"
                :centerId="house_submit_data.submitData.storeCenterId"
            />
            <t-form-item label="名称/编号" name="名称/编号" help="*必填">
                <t-input placeholder="名称/编号" v-model="house_submit_data.submitData.title" />
            </t-form-item>
            <t-form-item label="平方面积" name="平方面积" help="*必填">
                <t-input
                    placeholder="单位平方米"
                    v-model="house_submit_data.submitData.squareSize"
                    suffix="平方米"
                    type="number"
                />
            </t-form-item>
            <t-form-item label="展示权重" name="展示权重" help="不填写则默认现有数据最低权重">
                <t-input
                    placeholder="展示权重"
                    v-model="house_submit_data.submitData.orderWeight"
                />
            </t-form-item>
            <form_enum_radio_group
                label="是否启用"
                help="*必填"
                v-model="house_submit_data.submitData.status"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="house_submit_data.submitData.remark" />
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
