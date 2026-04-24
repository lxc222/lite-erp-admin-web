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
import t_form_item_house_center_list from "@/components/wms/t_form_item_house_center_list.vue";
import t_form_item_house_region_cascader from "@/components/wms/t_form_item_house_region_cascader.vue";
import t_form_item_employee from "@/components/md/t_form_item_employee.vue";

const house_tag_list = ref([]);

async function onLoadHouseTag() {
    house_tag_list.value = [];

    axiosPostJsonBody(
        "/api/biz/wms/houseTag/list",
        {
            status: globalConstDef.enableModel.Enabled
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                house_tag_list.value = response.data.data;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

const house_submit_data = ref({
    visible: false,
    addMode: false,
    storeRegionList: [],
    submitData: {
        title: null,
        storeCenterId: null,
        storeRegionId: null,
        squareSize: null,
        houseType: null,
        temperatureType: null,
        temperatureLow: null,
        temperatureHigh: null,
        manageEmployeeId1: null,
        manageEmployeeId2: null,
        manageEmployeeId3: null,
        orderWeight: null,
        houseTags: null,
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

function onLoadHouseRegion(cleanRegionId) {
    house_submit_data.value.storeRegionList = [];
    if (cleanRegionId) {
        house_submit_data.value.submitData.storeRegionId = null;
    }

    if (!house_submit_data.value.submitData.storeCenterId) {
        return;
    }

    axiosPostJsonBody(
        "/api/biz/wms/houseRegion/listForCascader",
        {
            storeCenterId: house_submit_data.value.submitData.storeCenterId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                house_submit_data.value.storeRegionList = response.data.data;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

watch(
    thisModel,
    (newVal, oldVal) => {
        const visible = newVal.visible;
        const addMode = newVal.addMode;
        house_submit_data.value.addMode = addMode;
        // console.log("visible", newVal);
        if (visible) {
            if (addMode) {
                house_submit_data.value.submitData = {
                    status: globalConstDef.enableModel.Enabled,
                    houseTags: []
                };

                house_submit_data.value.submitData.storeCenterId = newVal.storeCenterId;
                house_submit_data.value.submitData.storeRegionId = newVal.storeRegionId;

                onLoadHouseRegion(false);
                house_submit_data.value.visible = true;
            } else {
                house_submit_data.value.submitData = { storeCenterId: newVal.storeCenterId };
                onLoadHouseRegion(false);

                axiosPostJson(
                    "/api/biz/wms/house/oneById",
                    {
                        itemId: newVal.houseId
                    },
                    function (response) {
                        if (isAjaxRspSucc(response)) {
                            house_submit_data.value.submitData = response.data.data;

                            onLoadHouseRegion(false);
                            house_submit_data.value.submitData.storeRegionId =
                                response.data.data.storeRegionId.toString();
                            house_submit_data.value.visible = true;
                        } else {
                            onLoadHouseRegion(false);
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
    },
    { immediate: true, deep: true }
);

const doSubmitHouseData = () => {
    let distUrl = "/api/biz/wms/house/add";
    if (house_submit_data.value.submitData.id > 0) {
        distUrl = "/api/biz/wms/house/change";
    }

    axiosPostJsonBody(distUrl, house_submit_data.value.submitData, function (response) {
        if (!isAjaxRspSucc(response)) {
            MessagePlugin.error({
                content: response.data.tipMsg,
                duration: 3000,
                closeBtn: true,
                placement: "center",
                onClose: function () {}
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
};

onMounted(async () => {
    onLoadHouseTag();
});
</script>
<template>
    <t-drawer
        id="house_submit_data"
        v-model:visible="house_submit_data.visible"
        @confirm="doSubmitHouseData"
        size="40%"
        placement="right"
        :closeBtn="true"
        :cancelBtn="null"
        confirmBtn="提交"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
    >
        <template #header>仓库信息</template>
        <t-form
            :rules="house_submit_data.rules"
            :data="house_submit_data.submitData"
            requiredMarkPosition="right"
            @submit="doSubmitHouseData"
        >
            <t_form_item_house_center_list
                label="仓库中心"
                help="*必填"
                v-model="house_submit_data.submitData.storeCenterId"
                :disabled="!house_submit_data.addMode"
                :status="globalConstDef.enableModel.Enabled.toString()"
                @change="house_submit_data.submitData.storeRegionId = null"
            />
            <t_form_item_house_region_cascader
                label="仓库区域"
                help="*必填"
                v-model="house_submit_data.submitData.storeRegionId"
                :centerId="house_submit_data.submitData.storeCenterId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :checkStrictly="true"
            />
            <t-form-item label="名称/编号" name="名称/编号" help="*必填">
                <t-input placeholder="名称/编号" v-model="house_submit_data.submitData.title" />
            </t-form-item>
            <form_enum_radio_group
                label="仓库类型"
                help="*必填"
                v-model="house_submit_data.submitData.houseType"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.wmsHouseType"
            />
            <t-form-item label="平方面积" name="平方面积" help="*必填">
                <t-input
                    placeholder="单位平方米"
                    v-model="house_submit_data.submitData.squareSize"
                    suffix="平方米"
                    type="number"
                />
            </t-form-item>
            <form_enum_radio_group
                label="温控类型"
                help="*必填"
                v-model="house_submit_data.submitData.temperatureType"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.wmsHouseTemperatureType"
            />
            <t-form-item
                label="温控范围"
                name="温控范围"
                help="*必填"
                v-show="
                    house_submit_data.submitData.temperatureType ==
                    globalConstDef.wmsHouseTemperatureType.Special
                "
            >
                <t-space>
                    <t-input
                        placeholder="零下请填写负数"
                        v-model="house_submit_data.submitData.temperatureLow"
                        suffix="℃"
                        type="number"
                    />
                    &nbsp;~&nbsp;
                    <t-input
                        placeholder="零下请填写负数"
                        v-model="house_submit_data.submitData.temperatureHigh"
                        suffix="℃"
                        type="number"
                    />
                </t-space>
            </t-form-item>
            <t_form_item_employee
                label="第一负责人"
                help="选填,但是必须至少有一个负责人员"
                v-model="house_submit_data.submitData.manageEmployeeId1"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :externalOption="[{ title: '### 无负责人员 ###', id: -1 }]"
            />
            <t_form_item_employee
                label="第二负责人"
                help="选填,但是必须至少有一个负责人员"
                v-model="house_submit_data.submitData.manageEmployeeId2"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :externalOption="[{ title: '### 无负责人员 ###', id: -1 }]"
            />
            <t_form_item_employee
                label="第三负责人"
                help="选填,但是必须至少有一个负责人员"
                v-model="house_submit_data.submitData.manageEmployeeId3"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :externalOption="[{ title: '### 无负责人员 ###', id: -1 }]"
            />
            <t-form-item label="展示权重" name="展示权重" help="不填写则默认现有数据最低权重">
                <t-input
                    placeholder="展示权重"
                    v-model="house_submit_data.submitData.orderWeight"
                />
            </t-form-item>
            <t-form-item label="仓库标签" name="仓库标签" help="选填">
                <t-checkbox-group v-model="house_submit_data.submitData.houseTags">
                    <t-checkbox
                        v-for="item in house_tag_list"
                        :key="item.id"
                        :label="item.title"
                        :value="item.id"
                    />
                </t-checkbox-group>
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
        </t-form>
    </t-drawer>
</template>

<style scoped></style>
