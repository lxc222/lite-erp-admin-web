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

import t_form_item_merchant from "@/components/md/t_form_item_merchant.vue";
import t_form_item_mkp_store_center from "@/components/mktp/t_form_item_mkp_store_center.vue";
import t_form_item_mkp_store_list from "@/components/mktp/t_form_item_mkp_store_list.vue";

const datePresets = ref({
    昨天: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    今天: dayjs().format("YYYY-MM-DD")
});

const queryStoreRegionList = ref([]);

async function doUpdateStoreRegion(cleanData) {
    if (cleanData) {
        rent_submit_data.value.submitData.regionId = null;
    }

    queryStoreRegionList.value = [];

    if (!rent_submit_data.value.submitData.centerId) {
        return;
    }

    axiosPostJson(
        "/api/biz/mktp/storeRegion/listForCascader",
        {
            storeCenterId: rent_submit_data.value.submitData.centerId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                queryStoreRegionList.value = response.data.data;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

const store_house_list = ref([]);

async function onUpdateStoreHouse(cleanData) {
    store_house_list.value = [];
    if (cleanData) {
        rent_submit_data.value.submitData.houseId = null;
    }

    if (
        !rent_submit_data.value.submitData.centerId ||
        !rent_submit_data.value.submitData.regionId
    ) {
        return;
    }

    axiosPostJsonBody(
        "/api/biz/mktp/store/list",
        {
            storeCenterId: rent_submit_data.value.submitData.centerId,
            storeRegionId: rent_submit_data.value.submitData.regionId,
            type: 200
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                store_house_list.value = response.data.data;
            }
        }
    );
}

const rent_submit_data = ref({
    visible: false,
    addMode: false,
    submitData: {
        id: null,
        centerId: null,
        regionId: null,
        houseId: null,
        renterId: null,
        rentBeginDate: null,
        rentEndDate: null,
        remark: null,
        contractNo: null
    },
    rules: {}
});

watch(thisModel, (newVal, oldVal) => {
    const visible = newVal.visible;
    const addMode = newVal.addMode;
    rent_submit_data.value.addMode = addMode;
    // console.log("visible", newVal);
    if (visible) {
        queryStoreRegionList.value = [];
        store_house_list.value = [];

        if (addMode) {
            rent_submit_data.value.submitData = {};
            rent_submit_data.value.visible = true;
        } else {
            rent_submit_data.value.submitData = {};
            axiosPostJson(
                "/api/biz/mktp/storeRent/oneById",
                {
                    itemId: newVal.rentId
                },
                function (response) {
                    if (isAjaxRspSucc(response)) {
                        rent_submit_data.value.submitData = response.data.data;
                        rent_submit_data.value.visible = true;

                        doUpdateStoreRegion(false);
                        onUpdateStoreHouse(false);
                    }
                }
            );
        }
    }
});

const onSubmitRentData = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/mktp/storeRent/add";
        if (rent_submit_data.value.submitData.id > 0) {
            distUrl = "/api/biz/mktp/storeRent/change";
        }

        axiosPostJsonBody(distUrl, rent_submit_data.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                rent_submit_data.value.visible = false;
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
        id="rent_submit_data"
        v-model:visible="rent_submit_data.visible"
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
            :rules="rent_submit_data.rules"
            :data="rent_submit_data.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitRentData"
        >
            <t_form_item_mkp_store_center
                label="商铺中心"
                help="*必填"
                v-model="rent_submit_data.submitData.centerId"
                @change="rent_submit_data.submitData.houseId = null"
                :disabled="!rent_submit_data.addMode"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <t_form_item_mkp_store_list
                label="租赁商铺"
                help="*必填"
                v-model="rent_submit_data.submitData.houseId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :centerId="rent_submit_data.submitData.centerId"
                :disabled="!rent_submit_data.addMode"
            />
            <t_form_item_merchant
                label="内部商户"
                help="*必填"
                v-model="rent_submit_data.submitData.renterId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :disabled="!rent_submit_data.addMode"
            />
            <t-form-item label="租赁开始" name="租赁开始" help="*必填">
                <t-date-picker
                    v-model="rent_submit_data.submitData.rentBeginDate"
                    :presets="datePresets"
                    :disabled="!rent_submit_data.addMode"
                />
            </t-form-item>
            <t-form-item label="租赁截止" name="租赁截止" help="*必填">
                <t-date-picker
                    v-model="rent_submit_data.submitData.rentEndDate"
                    :presets="datePresets"
                    :disabled="!rent_submit_data.addMode"
                />
            </t-form-item>
            <t-form-item label="合同号" name="合同号">
                <t-input placeholder="合同号" v-model="rent_submit_data.submitData.contractNo" />
            </t-form-item>
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="rent_submit_data.submitData.remark" />
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
