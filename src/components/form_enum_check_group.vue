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
        // console.log(model.value);
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
        <t-checkbox-group
            v-model="model"
            @change="onSelectChange"
            :disabled="attrs.disabled ? true : false"
        >
            <t-space direction="vertical" v-if="attrs.direction == 'vertical'">
                <t-checkbox
                    v-if="globalLoginData.commonData"
                    v-for="item in attrs.options"
                    :key="item.code"
                    :label="item.remark"
                    :value="item.code"
                />
            </t-space>
            <t-checkbox
                v-else
                v-if="globalLoginData.commonData"
                v-for="item in attrs.options"
                :key="item.code"
                :label="item.remark"
                :value="item.code"
            />
        </t-checkbox-group>
    </t-form-item>
</template>

<style scoped></style>
