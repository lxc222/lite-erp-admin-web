<script setup>
import { ref, onMounted, useAttrs } from "vue";

import { MessagePlugin } from "tdesign-vue-next";

import { axiosPostJsonBody, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

defineProps({
    label: {
        type: String,
        required: true
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
    if (showFilterAttr) {
        axiosPostJsonBody(
            "/api/biz/md/position/list",
            {
                status: innerStatusFilter.value
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
        axiosPostJsonBody(
            "/api/biz/md/position/list",
            {
                status: statusAttr
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
        // console.log(model.value);
        emit("change");
    }, 0);
}

const styleStr = ref("");

onMounted(() => {
    if (attrs.widthPx) {
        styleStr.value =
            "min-width: " + attrs.widthPx + "px !important; width: " + attrs.widthPx + "px";
    } else {
        styleStr.value = "";
    }

    onLoadData();
});
</script>

<template>
    <t-form-item :label="label" :name="label" :help="attrs.help" :style="styleStr">
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
            <t-checkbox-group
                v-model="model"
                @change="onSelectChange"
                :disabled="attrs.disabled ? true : false"
            >
                <t-space direction="vertical" v-if="attrs.direction == 'vertical'">
                    <t-checkbox
                        v-for="item in data_list"
                        :key="item.id"
                        :label="item.title + '【' + item.statusTitle + '】'"
                        :value="item.id"
                    />
                </t-space>
                <t-checkbox
                    v-else
                    v-for="item in data_list"
                    :key="item.id"
                    :label="item.title + '【' + item.statusTitle + '】'"
                    :value="item.id"
                />
            </t-checkbox-group>
        </t-input-adornment>
        <t-checkbox-group
            v-else
            v-model="model"
            @change="onSelectChange"
            :disabled="attrs.disabled ? true : false"
        >
            <t-space direction="vertical" v-if="attrs.direction == 'vertical'">
                <t-checkbox
                    v-for="item in data_list"
                    :key="item.id"
                    :label="item.title + '【' + item.statusTitle + '】'"
                    :value="item.id"
                />
            </t-space>
            <t-checkbox
                v-else
                v-for="item in data_list"
                :key="item.id"
                :label="item.title + '【' + item.statusTitle + '】'"
                :value="item.id"
            />
        </t-checkbox-group>
    </t-form-item>
</template>

<style scoped></style>
