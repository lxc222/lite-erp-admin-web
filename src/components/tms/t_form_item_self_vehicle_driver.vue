<script setup>
import { ref, onMounted, useAttrs } from "vue";

import { MessagePlugin } from "tdesign-vue-next";

import { axiosPostJsonBody, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

defineProps({
    label: {
        type: String,
        required: false
    }
});

const selectVehicleId = defineModel("selectVehicleId");
const selectDriverId = defineModel("selectDriverId");

const emit = defineEmits(["change"]);

const attrs = useAttrs();

const vehicle_list = ref([]);
const driver_list = ref([]);

async function onLoadVehicleData() {
    vehicle_list.value = [];
    driver_list.value = [];

    let showFilterAttr = !attrs.showFilter ? false : attrs.showFilter;
    let statusAttr = !attrs.status ? null : attrs.status;

    if (showFilterAttr) {
        let distUrl = "/api/biz/tms/selfVehicleDriver/list";
        axiosPostJsonBody(
            distUrl,
            {
                status: innerStatusFilter.value
            },
            function (response) {
                if (isAjaxRspSucc(response)) {
                    vehicle_list.value = response.data.data;
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
    } else {
        let distUrl = "/api/biz/tms/selfVehicleDriver/list";
        axiosPostJsonBody(
            distUrl,
            {
                status: statusAttr
            },
            function (response) {
                if (isAjaxRspSucc(response)) {
                    vehicle_list.value = response.data.data;
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

function onLoadDriverData() {
    driver_list.value = [];

    let showFilterAttr = !attrs.showFilter ? false : attrs.showFilter;
    let statusAttr = !attrs.status ? null : attrs.status;

    if (showFilterAttr) {
        let distUrl = "/api/biz/tms/selfVehicleDriver/list";
        axiosPostJsonBody(
            distUrl,
            {
                status: innerStatusFilter.value,
                vehicleId: selectVehicleId.value
            },
            function (response) {
                if (isAjaxRspSucc(response)) {
                    driver_list.value = response.data.data;
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
    } else {
        let distUrl = "/api/biz/tms/selfVehicleDriver/list";
        axiosPostJsonBody(
            distUrl,
            {
                status: statusAttr,
                vehicleId: selectVehicleId.value
            },
            function (response) {
                if (isAjaxRspSucc(response)) {
                    driver_list.value = response.data.data;
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

const innerStatusFilter = ref("");

function onFilterStatusChange() {
    selectVehicleId.value = null;
    selectDriverId.value = null;
    onLoadVehicleData();
}

function onVehicleSelectChange() {
    setTimeout(() => {
        selectDriverId.value = null;
        onLoadDriverData();
    }, 0);
}

function onSelectChange() {
    setTimeout(() => {
        emit("change");
    }, 0);
}

onMounted(() => {
    onLoadVehicleData();
});
</script>

<template>
    <t-form-item :label="label" :name="label" :help="attrs.help">
        <t-input-adornment v-if="attrs.showFilter">
            <template #prepend>
                <t-select
                    v-model="innerStatusFilter"
                    @change="onFilterStatusChange"
                    style="width: 85px"
                >
                    <t-option key="所有" label="所有" value="" />
                    <t-option
                        key="仅启用"
                        label="仅启用"
                        :value="globalConstDef.enableModel.Enabled"
                    />
                    <t-option
                        key="未启用"
                        label="未启用"
                        :value="globalConstDef.enableModel.Disabled"
                    />
                </t-select>
            </template>
            <t-select
                v-model="selectVehicleId"
                @change="onVehicleSelectChange"
                :clearable="true"
                :filterable="true"
                :disabled="attrs.disabled"
            >
                <t-option
                    v-for="item in vehicle_list"
                    :key="item.vehicleId"
                    :label="item.vehicleTitle + '【' + item.statusTitle + '】'"
                    :value="item.vehicleId"
                />
            </t-select>
            <t-select
                v-model="selectDriverId"
                @change="onSelectChange"
                :clearable="true"
                :filterable="true"
                :disabled="attrs.disabled"
            >
                <t-option
                    v-for="item in driver_list"
                    :key="item.driverId"
                    :label="item.title + ' / ' + item.license + '【' + item.statusTitle + '】'"
                    :value="item.driverId"
                />
            </t-select>
        </t-input-adornment>
        <t-select
            v-else
            v-model="selectVehicleId"
            @change="onVehicleSelectChange"
            :clearable="true"
            :filterable="true"
            :disabled="attrs.disabled"
        >
            <t-option
                v-for="item in vehicle_list"
                :key="item.vehicleId"
                :label="item.vehicleTitle + '【' + item.statusTitle + '】'"
                :value="item.vehicleId"
            />
        </t-select>
        <t-select
            v-model="selectDriverId"
            @change="onSelectChange"
            :clearable="true"
            :filterable="true"
            :disabled="attrs.disabled"
        >
            <t-option
                v-for="item in driver_list"
                :key="item.driverId"
                :label="item.driverTitle + '【' + item.statusTitle + '】'"
                :value="item.driverId"
            />
        </t-select>
    </t-form-item>
</template>

<style scoped></style>
