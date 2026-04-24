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

const corpId = defineModel("corpId");
const corpType = defineModel("corpType");

const emit = defineEmits(["change"]);

const attrs = useAttrs();

// watch(
//     () => attrs.corpType,
//     (newVal, oldVal) => {
//         console.log("corpType changed:", newVal);
//         model.value = null;
//         onLoadData();
//     },
// );

const data_list = ref([]);
const data_map = ref({});
async function onLoadData() {
    data_list.value = [];
    data_map.value = {};
    let showFilterAttr = !attrs.showFilter ? false : attrs.showFilter;
    let statusAttr = !attrs.status ? null : attrs.status;

    if (showFilterAttr) {
        let distUrl = "/api/biz/tms/deliveryCorp/list";
        axiosPostJsonBody(
            distUrl,
            {
                status: innerStatusFilter.value
            },
            function (response) {
                if (isAjaxRspSucc(response)) {
                    data_list.value = response.data.data;
                    data_list.value.forEach(element => {
                        data_map.value[element.id] = element.corpType;
                    });
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
        let distUrl = "/api/biz/tms/deliveryCorp/list";
        axiosPostJsonBody(
            distUrl,
            {
                status: statusAttr
            },
            function (response) {
                if (isAjaxRspSucc(response)) {
                    data_list.value = response.data.data;
                    data_list.value.forEach(element => {
                        data_map.value[element.id] = element.corpType;
                    });
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
    corpId.value = null;
    corpType.value = null;
    onLoadData();
}

function onSelectChange() {
    setTimeout(() => {
        corpType.value = data_map.value[corpId.value];
        // console.log("corpType:", corpType.value);
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
                v-model="corpId"
                @change="onSelectChange"
                :clearable="true"
                :filterable="true"
                :disabled="attrs.disabled"
            >
                <t-option
                    v-for="item in data_list"
                    :key="item.id"
                    :label="
                        item.title +
                        ' / ' +
                        item.contactPersonName +
                        ' / ' +
                        item.contactPersonPhone +
                        '【' +
                        item.statusTitle +
                        '】'
                    "
                    :value="item.id"
                />
            </t-select>
        </t-input-adornment>
        <t-select
            v-else
            v-model="corpId"
            @change="onSelectChange"
            :clearable="true"
            :filterable="true"
            :disabled="attrs.disabled"
        >
            <t-option
                v-for="item in data_list"
                :key="item.id"
                :label="
                    item.title +
                    ' / ' +
                    item.contactPersonName +
                    ' / ' +
                    item.contactPersonPhone +
                    '【' +
                    item.statusTitle +
                    '】'
                "
                :value="item.id"
            />
        </t-select>
    </t-form-item>
</template>

<style scoped></style>
