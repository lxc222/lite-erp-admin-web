<script setup>
import { ref, onMounted, useAttrs, watch } from "vue";

import { loadMdMaterialCatalogList } from "@/assets/asset_biz_md_20251024.js";

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

    let statusAttr = !attrs.status ? null : attrs.status;
    loadMdMaterialCatalogList(
        {
            status: statusAttr
        },
        function (response) {
            data_list.value = response.data;
        },
        function () {
            data_list.value = [];
        }
    );
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
                :label="item.titleAbs + '【' + item.statusTitle + '】'"
                :value="item.id"
            />
        </t-select>
    </t-form-item>
</template>

<style scoped></style>
