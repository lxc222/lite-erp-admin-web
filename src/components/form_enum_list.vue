<script setup>
import { onMounted, ref, useAttrs } from "vue";
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
function onSelectChange() {
    emit("change");
}

const styleStr = ref("");

onMounted(() => {
    if (attrs.widthPx) {
        styleStr.value =
            "min-width: " + attrs.widthPx + "px !important; width: " + attrs.widthPx + "px";
    } else {
        styleStr.value = "";
    }
});
</script>

<template>
    <t-form-item :label="label" :name="label" :help="attrs.help" :style="styleStr">
        <t-select
            v-model="model"
            @change="onSelectChange"
            :clearable="true"
            :filterable="true"
            :disabled="attrs.disabled ? true : false"
        >
            <t-option
                v-if="globalLoginData.commonData"
                v-for="item in attrs.options"
                :key="item.code"
                :label="item.remark"
                :value="item.code"
            />
        </t-select>
    </t-form-item>
</template>

<style scoped></style>
