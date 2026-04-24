<script setup>
import { ref, onMounted, useAttrs, watch } from "vue";

import { MessagePlugin } from "tdesign-vue-next";

import { axiosPostJsonBody, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";
import { loadScmSaleRelationList } from "@/assets/asset_biz_scm_20251024.js";

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

    let customerIdAttr = !attrs.customerId ? null : attrs.customerId;
    if (!customerIdAttr) {
        return;
    }

    let statusAttr = !attrs.status ? null : attrs.status;
    loadScmSaleRelationList(
        {
            customerId: customerIdAttr,
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

watch(
    () => attrs.customerId,
    (newVal, oldVal) => {
        // console.log("supplierId changed:", newVal);
        model.value = null;
        onLoadData();
    }
);

function onSelectChange() {
    emit("change");
}

onMounted(() => {
    onLoadData();
});
</script>

<template>
    <t-form-item :label="label" :name="label" :help="attrs.help">
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
                    item.materialTitle +
                    ' ' +
                    item.specDetailTitle +
                    ' 销售单价￥' +
                    item.salePrice +
                    ' 供货编码：' +
                    item.saleCode
                "
                :value="item.id"
            />
        </t-select>
        <template #statusIcon v-if="$slots.actionIcon">
            <slot name="actionIcon" />
        </template>
    </t-form-item>
</template>

<style scoped></style>
