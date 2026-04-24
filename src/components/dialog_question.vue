<script setup lang="jsx">
import { ref, onMounted, useAttrs, watch } from "vue";

defineProps({
    title: {
        type: String,
        required: false,
        default: "请输入"
    },
    label: {
        type: String,
        required: false,
        default: ""
    },
    help: {
        type: String,
        required: false,
        default: ""
    }
});

const form_submit_data = ref({
    input: null,
    remark: null,
    extDatamap: {}
});

const model = defineModel();
const emit = defineEmits(["change"]);
const attrs = useAttrs();

function _dlg_confirm_click_() {
    model.visible = false;
}

function _submit_form_() {
    if (attrs.withRemark) {
        emit("change", form_submit_data.value.input, form_submit_data.value.remark);
    } else {
        emit("change", form_submit_data.value.input);
    }
}

watch(
    () => model,
    (newVal, oldVal) => {
        // console.log("c_dialog_question model.visible:", newVal);
        form_submit_data.value = {};
    },
    { immediate: true, deep: true }
);

onMounted(async () => {});
</script>

<template>
    <t-dialog
        id="c_dialog_question"
        v-model:visible="model.visible"
        width="attrs.width"
        :header="title"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
        :onClose="_dlg_confirm_click_"
    >
        <t-form
            label-align="right"
            :data="form_submit_data"
            requiredMarkPosition="right"
            @submit="_submit_form_"
        >
            <template v-if="$slots.extFormItem">
                <slot name="extFormItem" />
            </template>
            <t-form-item :label="label" :name="label" :help="help">
                <t-input
                    v-model="form_submit_data.input"
                    :label="attrs.inputLabel"
                    :suffix="attrs.inputSuffix"
                    :type="attrs.inputType"
                />
            </t-form-item>
            <t-form-item label="备注信息" name="备注信息" help="选填" v-show="attrs.withRemark">
                <t-input v-model="form_submit_data.remark" />
            </t-form-item>
            <t-form-item>
                <t-space size="small">
                    <t-button theme="primary" type="submit">提交</t-button>
                </t-space>
            </t-form-item>
        </t-form>
    </t-dialog>
</template>

<style scoped></style>
