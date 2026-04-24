<script setup>
import { ref, onMounted, useAttrs, watch } from "vue";

import { loadWmsHouseCenterList } from "@/assets/asset_biz_wms_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

defineProps({
    label: {
        type: String,
        required: false
    }
});

const model = defineModel();
const emit = defineEmits(["change", "valueChange"]);

const attrs = useAttrs();

const data_list = ref([]);

async function onLoadData() {
    data_list.value = [];

    let showFilterAttr = !attrs.showFilter ? false : attrs.showFilter;
    if (showFilterAttr) {
        loadWmsHouseCenterList(
            innerStatusFilter.value,
            response => {
                data_list.value = response.data;
            },
            () => {
                data_list.value = [];
            }
        );
    } else {
        let statusAttr = !attrs.status ? null : attrs.status;
        loadWmsHouseCenterList(
            statusAttr,
            response => {
                data_list.value = response.data;
            },
            () => {
                data_list.value = [];
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

watch(model, async (newVal, oldVal) => {
    // onLoadData();
});

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
                    :label="item.title + '【' + item.statusTitle + '】'"
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
                v-if="attrs.showMode == 'stockOperate'"
            >
                <t-option
                    v-for="item in data_list"
                    :key="item.id"
                    :label="
                        item.title +
                        ' | 入库收单：' +
                        item.applyDepositFlagTitle +
                        ' | 地址：' +
                        item.address +
                        '【' +
                        item.statusTitle +
                        '】'
                    "
                    :value="item.id"
                /> </t-select
            ><t-select
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
                    :label="item.title + '【' + item.statusTitle + '】'"
                    :value="item.id"
                />
            </t-select>
        </template>
    </t-form-item>
</template>

<style scoped></style>
