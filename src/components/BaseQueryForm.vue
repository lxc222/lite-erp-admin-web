<script setup>
/**
 * 基础查询表单组件
 * 统一封装查询表单布局和功能
 */
const props = defineProps({
    // 表单数据
    modelValue: {
        type: Object,
        required: true
    },
    // 标签宽度
    labelWidth: {
        type: String,
        default: '60px'
    },
    // 是否显示查询按钮
    showQueryBtn: {
        type: Boolean,
        default: true
    },
    // 查询按钮文字
    queryBtnText: {
        type: String,
        default: '开始查询'
    },
    // 是否显示重置按钮
    showResetBtn: {
        type: Boolean,
        default: false
    },
    // 重置按钮文字
    resetBtnText: {
        type: String,
        default: '重置'
    }
});

const emit = defineEmits(['query', 'reset', 'update:modelValue']);

// 提交查询
function onSubmit() {
    emit('query', true);
}

// 重置表单
function onReset() {
    emit('reset');
}
</script>

<template>
    <t-card :bordered="true" :style="{ margin: '5px' }">
        <div style="padding-top: 10px; padding-bottom: 10px">
            <t-form
                label-align="right"
                :labelWidth="labelWidth"
                :data="modelValue"
                layout="inline"
                scroll-to-first-error="smooth"
                @submit="onSubmit"
            >
                <!-- 表单内容插槽 -->
                <slot></slot>

                <!-- 操作按钮 -->
                <t-form-item>
                    <t-space>
                        <t-button v-if="showQueryBtn" theme="primary" type="submit">
                            {{ queryBtnText }}
                        </t-button>
                        <t-button v-if="showResetBtn" theme="default" variant="outline" @click="onReset">
                            {{ resetBtnText }}
                        </t-button>
                    </t-space>
                </t-form-item>
            </t-form>
        </div>
    </t-card>
</template>

<style scoped></style>
