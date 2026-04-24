<script setup lang="jsx">
import { onMounted, ref } from "vue";

const thisModel = defineModel();

import { HistoryIcon } from "tdesign-icons-vue-next";
import { LoadingPlugin, MessagePlugin } from "tdesign-vue-next";

import {
    ajaxPageDataParse,
    axiosPostJsonBody,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";
import { message_plugin_config } from "@/assets/asset_biz_base_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

import form_enum_list from "@/components/form_enum_list.vue";
import form_stock_unit_ratio from "@/components/wms/form_stock_unit_ratio.vue";
import t_form_item_house_center_list from "@/components/wms/t_form_item_house_center_list.vue";
import t_form_item_wms_house_cascader from "@/components/wms/t_form_item_wms_house_cascader.vue";

const table_line_expanded_row_keys = ref([""]);

const onTableLineExpandChange = (value, params) => {
    table_line_expanded_row_keys.value = value;
    // console.log("onTableLineExpandChange", value, params);
};

const onTableLineExpandedViewTpl = (h, { row }) => (
    <div>
        <div class="more-detail">
            <p class="content">
                <b>【物料规格】</b>
                {row.materialSpecValueTitle}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【物料编码】</b>
                {row.materialCode}
            </p>
        </div>
        <div class="more-detail">
            <p class="content">
                <b>【ID】</b>
                {row.id}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【创建操作】</b>
                {row.createAction}
            </p>
        </div>
    </div>
);

const table_columns = [
    {
        colKey: "operateNum",
        title: "库调操作",
        align: "left",
        width: "250px",
        cell: (h, { row }) => {
            let jsx = [];
            jsx.push(<span>【库单】{row.operateOrderNo}</span>);
            jsx.push(<p class="my_p_divider" />);

            if (row.stockAction == globalConstDef.wmsStockAdjustAction.Deduct) {
                jsx.push(
                    <span style="color:#0052d9;">
                        【{row.stockActionStr}】{row.stockNum} {row.stockUnitRatioTitle}
                    </span>
                );
            } else {
                jsx.push(
                    <span style="color:#2ba471;">
                        【{row.stockActionStr}】{row.stockNum} {row.stockUnitRatioTitle}
                    </span>
                );
            }

            jsx.push(<p class="my_p_divider" />);
            jsx.push(
                <span>
                    【变动】
                    <t-tag theme="primary" variant="outline">
                        {row.stockBefore} &gt; {row.stockAfter}
                    </t-tag>
                </span>
            );

            return jsx;
        }
    },
    {
        colKey: "houseTitle",
        title: "库存仓库",
        align: "left",
        cell: (h, { row }) => {
            return (
                <span>
                    【中心】{row.centerTitle}
                    <p class="my_p_divider" />
                    【仓库】{row.houseTitle}
                    <p class="my_p_divider" />
                    【库位】{row.rackTitle}
                </span>
            );
        }
    },
    {
        colKey: "merchantTitle",
        title: "商户批次",
        align: "left",
        width: "250px",
        cell: (h, { row }) => {
            return (
                <span>
                    【批次】<span style="font-weight:bold;">{row.batchId}</span>
                    <p class="my_p_divider" />
                    【商户】{row.merchantTitle}
                </span>
            );
        }
    },
    {
        colKey: "materialId",
        title: "物料信息",
        align: "left",
        cell: (h, { row }) => {
            return (
                <span>
                    【物料名称】{row.materialTitle}
                    <p class="my_p_divider" />
                    【规格编码】<span style="font-weight:bold;">{row.specMaterialCode}</span>
                </span>
            );
        }
    },
    { colKey: "stockActionSourceStr", align: "left", title: "流水来源", width: "100" },
    {
        colKey: "bizEmployeeTitle",
        title: "经办人员",
        align: "left",
        width: "120px"
    },
    { colKey: "remark", align: "left", title: "备注信息", ellipsis: true, width: "150px" },
    { colKey: "createAction", align: "left", title: "创建操作", width: "120" }
];

const queryDateRangePresets = ref({
    最近7天: [dayjs().subtract(6, "day").toDate(), dayjs().toDate()],
    最近3天: [dayjs().subtract(2, "day").toDate(), dayjs().toDate()],
    最近1天: [dayjs().subtract(1, "day").toDate(), dayjs().toDate()]
});

const form_query_data = ref({
    storeCenterId: null,
    storeHouseId: null,
    materialCode: null,
    batchId: null,
    operateOrderNo: null,
    stockUnitRatioId: null,
    assetAction: null,
    assetActionSource: null,
    operateDate: [],
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
        "/api/biz/wms/stockHistory/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            materialCode: form_query_data.value.materialCode,
            storeCenterId: form_query_data.value.storeCenterId,
            storeHouseId: form_query_data.value.storeHouseId,
            batchId: form_query_data.value.batchId,
            operateOrderNo: form_query_data.value.operateOrderNo,
            stockUnitRatioId: form_query_data.value.stockUnitRatioId,
            assetAction: form_query_data.value.assetAction,
            assetActionSource: form_query_data.value.assetActionSource,
            operateDateBegin: form_query_data.value.operateDate[0],
            operateDateEnd: form_query_data.value.operateDate[1]
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
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );

    return false;
}

onMounted(async () => {});
</script>
<template>
    <t-card :bordered="true" :style="{ margin: '5px' }" id="form_data">
        <div style="padding-top: 10px; padding-bottom: 10px">
            <t-form
                labelWidth="60px"
                label-align="right"
                :data="form_query_data"
                layout="inline"
                scroll-to-first-error="smooth"
                @submit="onQueryFormData(true)"
            >
                <t-form-item label="物料编码" name="物料编码">
                    <t-input v-model="form_query_data.materialCode"></t-input>
                </t-form-item>
                <t_form_item_house_center_list
                    label="仓库中心"
                    v-model="form_query_data.storeCenterId"
                    @change="form_query_data.storeHouseId = null"
                />
                <t_form_item_wms_house_cascader
                    label="存储仓库"
                    v-model="form_query_data.storeHouseId"
                    :checkStrictly="true"
                    :houseType="globalConstDef.wmsHouseType.MerchantPublic.toString()"
                    :centerId="form_query_data.storeCenterId"
                />
                <form_stock_unit_ratio
                    label="库存单位"
                    v-model="form_query_data.stockUnitRatioId"
                />
                <t-form-item label="批次号" name="批次号">
                    <t-input v-model="form_query_data.batchId"></t-input>
                </t-form-item>
                <t-form-item label="库调单号" name="库调单号">
                    <t-input v-model="form_query_data.operateOrderNo"></t-input>
                </t-form-item>
                <form_enum_list
                    label="操作类型"
                    v-model="form_query_data.assetAction"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.wmsStockAdjustAction"
                />
                <form_enum_list
                    label="操作来源"
                    v-model="form_query_data.assetActionSource"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.sysOrManual"
                />
                <t-form-item label="操作范围" name="操作范围">
                    <t-date-range-picker
                        v-model="form_query_data.operateDate"
                        :presets="queryDateRangePresets"
                        enable-time-picker
                        clearable
                        format="YYYY-MM-DD HH:mm:ss"
                    />
                </t-form-item>
                <t-button theme="primary" type="submit">开始查询</t-button>
            </t-form>
        </div>
    </t-card>
    <t-card header-bordered :style="{ margin: '5px' }" id="table_data">
        <template #header>
            <div>
                <span><HistoryIcon /></span><span>出入库凭证记录</span>
            </div>
        </template>
        <t-table
            row-key="id"
            :data="form_query_data.pageData"
            :columns="table_columns"
            :expandedRow="onTableLineExpandedViewTpl"
            :expandedRowKeys="table_line_expanded_row_keys"
            :expandOnRowClick="false"
            @expandChange="onTableLineExpandChange"
            bordered="bordered"
            hover="hover"
            tableLayout="fixed"
            size="medium"
            resizable
            :showHeader="true"
            cell-empty-content="-"
        >
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
