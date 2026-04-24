<script setup>
/**
 * 基础数据表格组件
 * 统一封装表格布局、分页和操作按钮
 */
const props = defineProps({
    // 表格数据
    data: {
        type: Array,
        default: () => []
    },
    // 列配置
    columns: {
        type: Array,
        required: true
    },
    // 分页数据
    pagination: {
        type: Object,
        default: () => ({
            pageNo: 1,
            pageSize: 10,
            totalNum: 0,
            totalPage: 0
        })
    },
    // 是否显示表头
    showHeader: {
        type: Boolean,
        default: true
    },
    // 是否显示分页
    showPagination: {
        type: Boolean,
        default: true
    },
    // 是否显示头部操作区
    showHeaderActions: {
        type: Boolean,
        default: true
    },
    // 加载状态
    loading: {
        type: Boolean,
        default: false
    },
    // 行唯一键
    rowKey: {
        type: String,
        default: "id"
    },
    expandedRowKeys: {
        type: Array,
        default: undefined,
        required: false
    },
    expandedRow: {
        type: Function,
        default: undefined,
        required: false
    }
});

const emit = defineEmits(["pageChange", "pageSizeChange", "expandChange"]);

// 页码变化
function onPageChange(page) {
    emit("pageChange", page);
}

// 每页条数变化
function onPageSizeChange(pageSize) {
    emit("pageSizeChange", pageSize);
}

function onTableLineExpandChange(value, params) {
    emit("expandChange", value, params);
}
</script>

<template>
    <t-card header-bordered :style="{ margin: '5px' }">
        <!-- 头部操作区 -->
        <template #header v-if="showHeaderActions">
            <div>
                <slot name="headerActions">
                    <!-- 默认头部操作插槽 -->
                </slot>
            </div>
        </template>

        <!-- 表格内容 -->
        <t-table
            :rowKey="rowKey"
            :data="data"
            :columns="columns"
            :expandedRow="expandedRow"
            :expandedRowKeys="expandedRowKeys"
            :expandOnRowClick="false"
            @expandChange="onTableLineExpandChange"
            :loading="loading"
            bordered="bordered"
            hover="hover"
            tableLayout="fixed"
            size="medium"
            resizable
            :showHeader="showHeader"
            cellEmptyContent="-"
        >
            <!-- 透传所有插槽 -->
            <template v-for="(_, name) in $slots" :key="name" #[name]="slotData">
                <slot :name="name" v-bind="slotData"></slot>
            </template>
        </t-table>

        <!-- 分页 -->
        <template #footer v-if="showPagination && pagination">
            <t-pagination
                :total="pagination.totalNum"
                v-model:current="pagination.pageNo"
                v-model:pageSize="pagination.pageSize"
                showFirstAndLastPageBtn
                @change="onPageChange"
                @pageSizeChange="onPageSizeChange"
            />
        </template>
    </t-card>
</template>

<style scoped></style>
