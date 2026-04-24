<script setup>
import { ref, onMounted, useAttrs, watch } from "vue";

import { loadWmsBatchGroupList } from "@/assets/asset_biz_wms_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

defineProps({
    label: {
        type: String,
        required: false,
        defaultValue: ""
    }
});

const model = defineModel();
const emit = defineEmits(["change", "valueChange"]);

const attrs = useAttrs();

watch(
    () => attrs.centerId,
    (newVal, oldVal) => {
        console.log("form_stock_group_list watch:", newVal);
        model.value = null;
        onLoadData();
    }
);

const data_list = ref([]);
function onLoadData() {
    data_list.value = [];
    // if (!attrs.centerId) {
    //     return;
    // }

    let showFilterAttr = !attrs.showFilter ? false : attrs.showFilter;
    let statusAttr = !attrs.status ? null : attrs.status;
    let centerId = !attrs.centerId ? null : attrs.centerId;

    if (showFilterAttr) {
        statusAttr = innerStatusFilter.value;
    }

    loadWmsBatchGroupList(
        {
            centerId: centerId,
            status: statusAttr
        },
        response => {
            data_list.value = response.data;
        },
        response => {
            data_list.value = [];
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
        emit("valueChange", getOneById(model.value));
    }, 0);
}

function getOneById(id) {
    if (!id) {
        return null;
    }

    let rst = null;
    for (let i = 0; i < data_list.value.length; i++) {
        if (data_list.value[i].id == id) {
            rst = data_list.value[i];
            break;
        }
    }

    return rst;
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
                    v-if="attrs.externalOption"
                    v-for="item in attrs.externalOption"
                    :key="item.id"
                    :label="item.title"
                    :value="item.id"
                />
                <t-option
                    v-for="item in data_list"
                    :key="item.id"
                    :label="
                        item.title +
                        '  |  二次出库审核：' +
                        item.dudectDualAuthEmployeeTitle +
                        '【' +
                        item.statusTitle +
                        '】'
                    "
                    :value="item.id"
                />
            </t-select>
        </t-input-adornment>
        <template v-else>
            <t-select
                v-model="model"
                @change="onSelectChange"
                :clearable="true"
                :filterable="true"
                :disabled="attrs.disabled ? true : false"
            >
                <t-option
                    v-if="attrs.externalOption"
                    v-for="item in attrs.externalOption"
                    :key="item.id"
                    :label="item.title"
                    :value="item.id"
                />
                <t-option
                    v-for="item in data_list"
                    :key="item.id"
                    :label="
                        item.title +
                        '  |  二次出库审核：' +
                        item.dudectDualAuthEmployeeTitle +
                        '【' +
                        item.statusTitle +
                        '】'
                    "
                    :value="item.id"
                />
            </t-select>
        </template>
    </t-form-item>
</template>

<style scoped></style>
