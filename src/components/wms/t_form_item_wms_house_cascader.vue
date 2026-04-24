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
        model.value = null;
        onLoadData();
    }
);

const data_list = ref([]);

async function onLoadData() {
    data_list.value = [];
    if (!attrs.centerId) {
        return;
    }

    let showFilterAttr = !attrs.showFilter ? false : attrs.showFilter;
    let centerId = !attrs.centerId ? null : attrs.centerId;
    let houseType = !attrs.houseType ? null : attrs.houseType;
    let statusAttr = !attrs.status ? null : attrs.status;
    if (showFilterAttr) {
        let distUrl = "/api/biz/wms/house/listForCascader";
        axiosPostJsonBody(
            distUrl,
            {
                storeCenterId: centerId,
                type: houseType,
                status: innerStatusFilter.value
            },
            function (response) {
                if (isAjaxRspSucc(response)) {
                    data_list.value = response.data.data;
                } else {
                    data_list.value = [];
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
        let distUrl = "/api/biz/wms/house/listForCascader";
        axiosPostJsonBody(
            distUrl,
            {
                storeCenterId: centerId,
                type: houseType,
                status: statusAttr
            },
            function (response) {
                if (isAjaxRspSucc(response)) {
                    data_list.value = response.data.data;
                } else {
                    data_list.value = [];
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
    emit("change");
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
            <t-cascader
                v-model="model"
                @change="onSelectChange"
                :options="data_list"
                :checkStrictly="!attrs.checkStrictly ? false : true"
                :clearable="true"
                :filterable="true"
                :disabled="attrs.disabled ? true : false"
            />
        </t-input-adornment>
        <t-cascader
            v-else
            v-model="model"
            @change="onSelectChange"
            :options="data_list"
            :checkStrictly="!attrs.checkStrictly ? false : true"
            :clearable="true"
            :filterable="true"
            :disabled="attrs.disabled ? true : false"
        />
    </t-form-item>
</template>

<style scoped></style>
