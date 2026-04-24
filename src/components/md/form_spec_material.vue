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
    let supplyOpenAttr = !attrs.supplyOpen ? null : attrs.supplyOpen;
    let materialPackTypeAttr = !attrs.materialPackType ? null : attrs.materialPackType;
    let materialProduceTypeAttr = !attrs.materialProduceType ? null : attrs.materialProduceType;

    if (showFilterAttr) {
        statusAttr = innerStatusFilter.value;
    }

    let distUrl = "/api/biz/md/specMaterial/listThin";
    axiosPostJsonBody(
        distUrl,
        {
            status: statusAttr,
            supplyOpen: supplyOpenAttr,
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

function buildLabelStr(item) {
    if (!attrs.labelType || attrs.labelType == 1) {
        return (
            item.materialTitle +
            " | " +
            item.specValueTitle +
            " | " +
            item.stockTypeTitle +
            " | " +
            item.code +
            " | " +
            item.materialPackTypeStr +
            " | " +
            item.unitName +
            " | " +
            item.materialProduceTypeStr +
            "【" +
            item.statusTitle +
            "】"
        );
    } else if (attrs.labelType == 2) {
        return (
            item.materialTitle +
            " | " +
            item.specValueTitle +
            " | 最低售价￥" +
            item.supplyPrice +
            "/" +
            item.unitName +
            " | " +
            item.code +
            " | " +
            item.materialPackTypeStr +
            " | " +
            item.materialProduceTypeStr +
            "【" +
            item.statusTitle +
            "】"
        );
    } else {
        return (
            item.materialTitle +
            " | " +
            item.specValueTitle +
            " | " +
            item.code +
            "【" +
            item.statusTitle +
            "】"
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
        let materialUnitId = null;
        if (model.value) {
            for (var i = 0; i < data_list.value.length; i++) {
                if (data_list.value[i].id == model.value) {
                    materialUnitId = data_list.value[i].unitId;
                    break;
                }
            }
        }

        emit("change", materialUnitId);
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
                    :label="buildLabelStr(item)"
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
                :label="buildLabelStr(item)"
                :value="item.id"
            />
        </t-select>
    </t-form-item>
</template>

<style scoped></style>
