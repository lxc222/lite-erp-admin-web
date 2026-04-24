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

const data_list = ref([]);

watch(
    () => attrs.materialUnitId,
    async (newVal, oldVal) => {
        onLoadData();
    },
    { immediate: true, deep: true }
);

function onLoadData() {
    data_list.value = [];

    let showFilterAttr = !attrs.showFilter ? false : attrs.showFilter;
    let statusAttr = !attrs.status ? null : attrs.status;
    let materialUnitIdAttr = !attrs.materialUnitId ? null : attrs.materialUnitId;
    if (showFilterAttr) {
        statusAttr = innerStatusFilter.value;
    }

    let distUrl = "/api/biz/wms/stockUnitRatio/list";
    axiosPostJsonBody(
        distUrl,
        {
            status: statusAttr,
            materialUnitId: materialUnitIdAttr
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
                :disabled="attrs.disabled"
            >
                <t-option
                    v-for="item in data_list"
                    :key="item.id"
                    :label="item.title + '【' + item.statusTitle + '】'"
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
            :disabled="attrs.disabled"
        >
            <t-option
                v-for="item in data_list"
                :key="item.id"
                :label="item.title + '【' + item.statusTitle + '】'"
                :value="item.id"
            />
        </t-select>
    </t-form-item>
</template>

<style scoped></style>
