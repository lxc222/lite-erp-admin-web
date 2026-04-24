<script setup lang="jsx">
import { onMounted, ref } from "vue";

const thisModel = defineModel();

import { MessagePlugin, LoadingPlugin } from "tdesign-vue-next";

import {
    ajaxPageDataParse,
    axiosPostJsonBody,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";
import { message_plugin_config } from "@/assets/asset_biz_base_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

import sc_purchase_supplier_list from "@/components/scm/purchase_supplier_list.vue";

import enable_status_tag from "@/components/enable_status_tag.vue";

const table_columns = [
    { colKey: "materialTitle", title: "物料名称", width: 250 },
    {
        colKey: "supplySpecDetailStr",
        title: "物料规格"
    },
    {
        colKey: "supplyPrice",
        title: "￥销售单价",
        width: 220,
        align: "right",
        cell: (h, { row }) => {
            return (
                <span class="table_column_money">
                    ￥{row.supplyPrice} / {row.supplyUnit}
                </span>
            );
        }
    },
    { colKey: "supplyCode", title: "供货编码", width: 200 },
    {
        colKey: "minUnitNumTitle",
        title: "供货数量限制",
        children: [
            { colKey: "minUnitNumTitle", title: "单次最小", width: 120 },
            { colKey: "maxUnitNumTitle", title: "单次最大", width: 120 }
        ]
    },
    {
        colKey: "minPrepareDayTitle",
        title: "备货周期",
        width: 115
    },
    {
        colKey: "status",
        title: "供货状态",
        width: 115,
        cell: (h, { row }) => {
            return <enable_status_tag status={row.status} />;
        }
    },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const onTableLineMenuHandler = data => {
    if ("供货信息" === data.content) {
        // showSupplierEdit(data.value);
    }
};

const form_query_data = ref({
    supplierId: null,
    page: {
        pageNo: 1,
        pageSize: 10,
        totalNum: 0,
        totalPage: 0
    },
    pageData: []
});

function onQueryFormData(resetPage) {
    if (resetPage) {
        form_query_data.value.page.pageNo = 1;
    }

    LoadingPlugin(true);
    axiosPostJsonBody(
        "/api/biz/scm/supplier/pageSupplierMaterial",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            supplierId: form_query_data.value.supplierId
        },
        function (response) {
            LoadingPlugin(false);
            if (isAjaxRspSucc(response)) {
                ajaxPageDataParse(response.data.data, form_query_data);

                MessagePlugin.success({
                    ...message_plugin_config,
                    content: "数据加载完成"
                });
            } else {
                MessagePlugin.info({
                    content: response.data.tipMsg,
                    duration: 2000,
                    closeBtn: true,
                    placement: "center",
                    onClose: function () {}
                });
            }
        }
    );

    return false;
}

onMounted(async () => {});
</script>
<template>
    <t-card :bordered="true" :style="{ margin: '5px' }" id="query_form">
        <div style="padding-top: 10px; padding-bottom: 10px">
            <t-form
                label-align="right"
                labelWidth="100px"
                :data="form_query_data"
                layout="inline"
                scroll-to-first-error="smooth"
                @submit="onQueryFormData(true)"
            >
                <sc_purchase_supplier_list
                    label="平台内供应商"
                    v-model="form_query_data.supplierId"
                    :supplierType="globalConstDef.scPurchaseSupplierType.Inner.toString()"
                    :status="globalConstDef.scPurchaseSupplierStatus.Corporate.toString()"
                    :widthPx="550"
                />
                <t-button theme="primary" type="submit">开始查询</t-button>
            </t-form>
        </div></t-card
    >
    <t-card header-bordered :style="{ margin: '5px' }" id="data_table"
        ><template #header>
            <div>物料信息（供应商配置供货）</div>
        </template>
        <t-table
            row-key="index"
            :data="form_query_data.pageData"
            :columns="table_columns"
            bordered="bordered"
            hover="hover"
            tableLayout="fixed"
            size="medium"
            resizable
            :showHeader="true"
            cell-empty-content="-"
        >
            <template #refOperation="{ row }">
                <t-dropdown
                    :options="[{ content: '供货信息', value: row.id, divider: true }]"
                    @click="onTableLineMenuHandler"
                >
                    <t-button theme="success" shape="round">
                        更多&nbsp;
                        <span><i class="icon-chevron-down"></i></span>
                    </t-button>
                </t-dropdown>
            </template>
        </t-table>
        <template #footer>
            <t-pagination
                :total="form_query_data.page.totalNum"
                v-model:current="form_query_data.page.pageNo"
                v-model:pageSize="form_query_data.page.pageSize"
                showFirstAndLastPageBtn
                @onChange="onQueryFormData(false)"
                @current-change="onQueryFormData(false)"
                @page-size-change="onQueryFormData(false)"
        /></template>
    </t-card>
</template>

<style scoped></style>
