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
    setTimeout(() => {
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
});
</script>

<template>
    <t-form-item :label="label" :name="label" :help="attrs.help" :style="styleStr">
        <t-radio-group
            v-model="model"
            @change="onSelectChange"
            :disabled="attrs.disabled ? true : false"
        >
            <t-radio
                v-if="globalLoginData.commonData"
                v-for="item in attrs.options"
                :value="item.code"
            >
                {{ item.remark }}
            </t-radio>
        </t-radio-group>
    </t-form-item>
</template>

<style scoped></style>
