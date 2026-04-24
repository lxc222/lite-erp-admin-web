<script setup>
import { ref, onMounted, useAttrs, watch } from "vue";
import { loadWmsHouseRackList } from "@/assets/asset_biz_wms_20251024.js";
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
    let centerIdAttr = !attrs.centerId ? null : attrs.centerId;
    let regionIdAttr = !attrs.regionId ? null : attrs.regionId;
    let houseIdAttr = !attrs.houseId ? null : attrs.houseId;
    if (!centerIdAttr || centerIdAttr < 1) {
        return;
    }

    if (showFilterAttr) {
        loadWmsHouseRackList(
            {
                centerId: centerIdAttr,
                regionId: regionIdAttr,
                houseId: houseIdAttr,
                status: innerStatusFilter.value
            },
            response => {
                data_list.value = response.data;
            },
            () => {
                data_list.value = [];
            }
        );
    } else {
        let statusAttr = !attrs.status ? null : attrs.status;
        loadWmsHouseRackList(
            {
                centerId: centerIdAttr,
                regionId: regionIdAttr,
                houseId: houseIdAttr,
                status: statusAttr
            },
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
    }, 0);
}

watch(model, async (newVal, oldVal) => {
    onLoadData();
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
                    :label="
                        item.title +
                        '(架) | ' +
                        item.centerTitle +
                        '/' +
                        item.houseTitleWithRegion +
                        '(仓) |【' +
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
                    v-for="item in data_list"
                    :key="item.id"
                    :label="
                        item.title +
                        '(架) | ' +
                        item.centerTitle +
                        '/' +
                        item.houseTitleWithRegion +
                        '(仓) |【' +
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
