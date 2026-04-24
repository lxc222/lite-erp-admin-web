<script setup>
import { ref, onMounted, useAttrs, watch } from "vue";

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

const model = defineModel();
const emit = defineEmits(["change"]);

const attrs = useAttrs();

watch(
    () => attrs.centerId,
    (newVal, oldVal) => {
        // console.log("centerId changed:", newVal);
        onLoadData();
    }
);

const house_list = ref([]);

async function onLoadData() {
    house_list.value = [];
    if (!attrs.centerId) {
        return;
    }

    let showFilterAttr = !attrs.showFilter ? false : attrs.showFilter;
    let centerId = !attrs.centerId ? null : attrs.centerId;
    let houseType = !attrs.houseType ? null : attrs.houseType;
    let statusAttr = !attrs.status ? null : attrs.status;

    if (showFilterAttr) {
        let distUrl = "/api/biz/wms/house/list";
        axiosPostJsonBody(
            distUrl,
            {
                storeCenterId: centerId,
                houseType: houseType,
                status: innerStatusFilter.value
            },
            function (response) {
                if (isAjaxRspSucc(response)) {
                    house_list.value = response.data.data;
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
        let distUrl = "/api/biz/wms/house/list";
        axiosPostJsonBody(
            distUrl,
            {
                storeCenterId: centerId,
                houseType: houseType,
                status: statusAttr
            },
            function (response) {
                if (isAjaxRspSucc(response)) {
                    house_list.value = response.data.data;
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
    model.value = null;
    onLoadData();
}

function onSelectChange() {
    setTimeout(() => {
        emit("change");
    }, 0);
}

onMounted(() => {
    onLoadData();
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
                v-model="model"
                @change="onSelectChange"
                :clearable="true"
                :filterable="true"
                :disabled="attrs.disabled ? true : false"
            >
                <t-option
                    v-for="item in house_list"
                    :key="item.id"
                    :label="
                        item.storeRegionNameAbs + '/' + item.title + '【' + item.statusTitle + '】'
                    "
                    :value="item.id"
                />
            </t-select>
        </t-input-adornment>
        <t-select
            v-else
            v-model="model"
            @change="onSelectChange"
            :clearable="true"
            :filterable="true"
            :disabled="attrs.disabled ? true : false"
        >
            <t-option
                v-for="item in house_list"
                :key="item.id"
                :label="
                    item.storeRegionNameAbs +
                    '/' +
                    item.title +
                    ' | ' +
                    item.squareSize +
                    '平方米【' +
                    item.statusTitle +
                    '】'
                "
                :value="item.id"
            />
        </t-select>
    </t-form-item>
</template>

<style scoped></style>
