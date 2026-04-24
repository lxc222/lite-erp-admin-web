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

const model = defineModel();
const emit = defineEmits(["change"]);

const attrs = useAttrs();

const data_list = ref([]);

async function onLoadData() {
    data_list.value = [];

    let showFilterAttr = !attrs.showFilter ? false : attrs.showFilter;
    let statusAttr = !attrs.status ? null : attrs.status;
    let materialPackTypeAttr = !attrs.materialPackType ? null : attrs.materialPackType;
    let materialProduceTypeAttr = !attrs.materialProduceType ? null : attrs.materialProduceType;

    if (showFilterAttr) {
        let distUrl = "/api/biz/md/material/listThin";
        axiosPostJsonBody(
            distUrl,
            {
                status: innerStatusFilter.value,
                materialPackType: materialPackTypeAttr,
                materialProduceType: materialProduceTypeAttr
            },
            function (response) {
                if (isAjaxRspSucc(response)) {
                    data_list.value = response.data.data;
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
        let distUrl = "/api/biz/md/material/listThin";
        axiosPostJsonBody(
            distUrl,
            {
                status: statusAttr,
                materialPackType: materialPackTypeAttr,
                materialProduceType: materialProduceTypeAttr
            },
            function (response) {
                if (isAjaxRspSucc(response)) {
                    data_list.value = response.data.data;
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
        let specTypeIdsForce = [];
        let specTypeIdsOptional = [];

        if (model.value) {
            for (var i = 0; i < data_list.value.length; i++) {
                if (data_list.value[i].id == model.value) {
                    specTypeIdsForce = data_list.value[i].specTypeIdsForce;
                    specTypeIdsOptional = data_list.value[i].specTypeIdsOptional;

                    // console.log(data_list.value[i]);
                    break;
                }
            }
        }

        // console.log(specTypeIdsForce);
        // console.log(specTypeIdsOptional);
        emit("change", specTypeIdsForce, specTypeIdsOptional);
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
                    v-for="item in data_list"
                    :key="item.id"
                    :label="
                        item.title +
                        ' / ' +
                        item.code +
                        ' / ' +
                        item.unitName +
                        ' / ' +
                        item.materialPackTypeStr +
                        ' / ' +
                        item.materialProduceTypeStr
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
                v-for="item in data_list"
                :key="item.id"
                :label="
                    item.title +
                    ' / ' +
                    item.code +
                    ' / ' +
                    item.unitName +
                    ' / ' +
                    item.materialPackTypeStr +
                    ' / ' +
                    item.materialProduceTypeStr
                "
                :value="item.id"
            />
        </t-select>
    </t-form-item>
</template>

<style scoped></style>
