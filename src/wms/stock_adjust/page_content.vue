<script setup lang="jsx">
import { onMounted, ref } from "vue";

const thisModel = defineModel();

import { MessagePlugin, LoadingPlugin, DialogPlugin } from "tdesign-vue-next";
import { ArrowRightIcon, CheckIcon, CloseIcon, QrcodeIcon } from "tdesign-icons-vue-next";

import {
    ajaxPageDataParse,
    axiosPostJson,
    axiosPostJsonBody,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";
import { message_plugin_config } from "@/assets/asset_biz_base_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

import form_enum_list from "@/components/form_enum_list.vue";
import dialog_barcode_128 from "@/components/dialog_barcode_128.vue";
import t_form_item_merchant from "@/components/md/t_form_item_merchant.vue";
import form_stock_unit_ratio from "@/components/wms/form_stock_unit_ratio.vue";
import t_form_item_house_center_list from "@/components/wms/t_form_item_house_center_list.vue";
import t_form_item_wms_house_cascader from "@/components/wms/t_form_item_wms_house_cascader.vue";

import page_deposit_exec from "@/wms/stock_adjust/page_deposit_exec.vue";
import page_deduct_exec from "@/wms/stock_adjust/page_deduct_exec.vue";

const doRenderOrderStatus = row => {
    if (row.orderStatus == globalConstDef.wmsStockAdjustOrderStatus.CloseComplete) {
        return (
            <span class="">
                <t-tag theme="success" shape="round" size="medium" variant="light-outline">
                    <CheckIcon />
                    {row.orderStatusTitle}
                </t-tag>
                &nbsp; &nbsp;
                <span style="color:#5164d3;" onClick={() => onShowQrCodeDlg(row.orderNo)}>
                    <QrcodeIcon size="1.5em" />
                </span>
            </span>
        );
    } else if (row.orderStatus == globalConstDef.wmsStockAdjustOrderStatus.CloseCancel) {
        return (
            <span class="">
                <t-tag theme="danger" shape="round" size="medium" variant="light-outline">
                    <CloseIcon />
                    {row.orderStatusTitle}
                </t-tag>
                &nbsp; &nbsp;
                <span style="color:#5164d3;" onClick={() => onShowQrCodeDlg(row.orderNo)}>
                    <QrcodeIcon size="1.5em" />
                </span>
            </span>
        );
    } else {
        return (
            <span class="">
                <t-tag theme="primary" shape="round" size="medium" variant="light-outline">
                    <ArrowRightIcon />
                    {row.orderStatusTitle}
                </t-tag>
                &nbsp; &nbsp;
                <span style="color:#5164d3;" onClick={() => onShowQrCodeDlg(row.orderNo)}>
                    <QrcodeIcon size="1.5em" />
                </span>
            </span>
        );
    }
};

const table_line_expanded_row_keys = ref([""]);

const onTableLineExpandChange = (value, params) => {
    table_line_expanded_row_keys.value = value;
    // console.log("onTableLineExpandChange", value, params);
};

const onTableLineExpandedViewTpl = (h, { row }) => (
    <div>
        <div class="more-detail">
            <p class="content">
                <b>【规格详情】</b>
                {row.specValueTitle}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
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
        colKey: "orderStatusTitle",
        title: "库调单",
        width: 250,
        align: "left",
        cell: (h, { row }) => {
            let jsx = [];
            jsx.push(<span>【单号】{row.orderNo}</span>);
            jsx.push(<p class="my_p_divider" />);
            jsx.push(doRenderOrderStatus(row));
            jsx.push(<p class="my_p_divider" />);
            jsx.push(<span>【日期】{row.adjustDateTitle}</span>);
            jsx.push(<p class="my_p_divider" />);
            jsx.push(<span>【时段】{row.adjustTimeRangeTitle}</span>);
            jsx.push(<p class="my_p_divider" />);
            jsx.push(<span>【人员】{row.bizEmployeeTitle}</span>);
            return jsx;
        }
    },
    {
        colKey: "centerId",
        title: "仓库信息",
        align: "left",
        cell: (h, { row }) => {
            let jsx = [];

            if (row.stockAction == globalConstDef.wmsStockAdjustAction.Deposit) {
                jsx.push(<span>【入库中心】{row.centerTitle}</span>);

                if (row.regionTitle) {
                    jsx.push(<p class="my_p_divider" />);
                    jsx.push(<span>【申请库区】{row.regionTitle}</span>);
                }
            } else {
                jsx.push(<span>【出库中心】{row.centerTitle}</span>);

                if (row.stockRegionTitles) {
                    row.stockRegionTitles.forEach(title => {
                        jsx.push(<p class="my_p_divider" />);
                        jsx.push(<span>【库存库区】{title}</span>);
                    });
                }

                if (row.stockHouseTitles) {
                    row.stockHouseTitles.forEach(title => {
                        jsx.push(<p class="my_p_divider" />);
                        jsx.push(<span>【库存仓库】{title}</span>);
                    });
                }
            }

            if (row.houseTitle) {
                jsx.push(<p class="my_p_divider" />);
                jsx.push(<span>【仓库】{row.houseTitle}</span>);
            }

            return jsx;
        }
    },
    {
        colKey: "batchId",
        title: "商户批次",
        align: "left",
        width: 250,
        cell: (h, { row }) => {
            return (
                <span>
                    【批次】<span style="font-weight:bold;">{row.batchId}</span>
                    <p class="my_p_divider" />
                    【商户】{row.merchant}
                </span>
            );
        }
    },
    {
        colKey: "specMaterialId",
        title: "库调物料",
        align: "left",
        cell: (h, { row }) => {
            return (
                <span>
                    【规格编码】<span style="font-weight:bold;">{row.specMaterialCode}</span>
                    <p class="my_p_divider" />
                    【物料名称】{row.materialTitle}
                    <p class="my_p_divider" />
                    【库调数量】{row.stockActionStr} {row.stockNum}
                    <p class="my_p_divider" />
                    【库存单位】{row.stockUnitRatioTitle}
                </span>
            );
        }
    },
    {
        colKey: "refKey1",
        title: "关联场景",
        align: "left",
        width: 120,
        cell: (h, { row }) => {
            return (
                <span>
                    {row.orderSceneStr}
                    <p class="my_p_divider" />
                    {row.refKey1} {row.refKey2} {row.refKey3}
                </span>
            );
        }
    },
    { colKey: "remark", align: "left", title: "备注", width: 120 },
    { colKey: "updateAction", align: "left", title: "最后修改", width: 120 },
    { colKey: "refOperation", align: "left", title: "关联操作", width: 120 }
];

function onShowTableLineMenu(row) {
    return true;
    // return row.operateFlag.anyOperateTrue;
}

function onBuildTableLineMenu(row) {
    let menus = [];

    if (row.operateFlag.prove) {
        menus.push({ content: "审核订单", value: row, divider: true });
    }

    if (row.operateFlag.complete) {
        menus.push({ content: "执行订单", value: row, divider: true });
    }

    if (row.operateFlag.cancel) {
        menus.push({ content: "取消订单", value: row, divider: true });
    }

    menus.push({ content: "重新同步状态", value: row, divider: true });

    return menus;
}

const onTableLineMenuHandler = data => {
    if ("执行订单" === data.content) {
        onExecOrder(data.value);
    } else if ("取消订单" === data.content) {
        onCancelOrder(data.value);
    } else if ("审核订单" === data.content) {
        onApproveOrder(data.value);
    } else if ("重新同步状态" === data.content) {
        onNoticeOrder(data.value);
    }
};

async function onNoticeOrder(row) {
    const confirmDia = DialogPlugin.confirm({
        header: "确认",
        body: "重新同步状态不影响状态，辅助下游调整流程",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();
            axiosPostJson(
                "/api/biz/wms/stockAdjust/noticeById",
                {
                    orderId: row.id
                },
                function (response) {
                    if (!isAjaxRspSucc(response)) {
                        MessagePlugin.error({
                            content: response.data.tipMsg,
                            duration: 3000,
                            closeBtn: true,
                            placement: "center",
                            onClose: function () {}
                        });
                    } else {
                        MessagePlugin.info({
                            content: response.data.data,
                            duration: 3000,
                            closeBtn: true,
                            placement: "center",
                            onClose: function () {}
                        });
                    }
                }
            );
        },
        onClose: ({ e, trigger }) => {
            confirmDia.hide();
        }
    });
}

const deposit_exec_model = ref({
    visible: false,
    adjustOrderId: null,
    stockNum: null,
    centerId: null,
    regionId: null
});

const deduct_exec_model = ref({
    visible: false,
    adjustOrderId: null,
    stockNum: null,
    centerId: null
});

async function onExecOrder(row) {
    if (row.stockAction == globalConstDef.wmsStockAdjustAction.Deduct) {
        deduct_exec_model.value = {
            adjustOrderId: row.id,
            stockNum: row.stockNum,
            centerId: row.centerId,
            visible: true
        };
    } else {
        deposit_exec_model.value = {
            adjustOrderId: row.id,
            stockNum: row.stockNum,
            centerId: row.centerId,
            regionId: row.regionId,
            visible: true
        };
    }
}

async function onCancelOrder(row) {
    const confirmDia = DialogPlugin.confirm({
        header: "确认",
        body: "取消库调单？",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();
            axiosPostJson(
                "/api/biz/wms/stockAdjust/cancelById",
                {
                    orderId: row.id,
                    centerId: row.centerId
                },
                function (response) {
                    if (!isAjaxRspSucc(response)) {
                        MessagePlugin.error({
                            content: response.data.tipMsg,
                            duration: 3000,
                            closeBtn: true,
                            placement: "center",
                            onClose: function () {}
                        });
                    } else {
                        MessagePlugin.info({
                            content: response.data.data,
                            duration: 3000,
                            closeBtn: true,
                            placement: "center",
                            onClose: function () {}
                        });
                    }
                }
            );
        },
        onClose: ({ e, trigger }) => {
            confirmDia.hide();
        }
    });
}

async function onApproveOrder(row) {
    const confirmDia = DialogPlugin.confirm({
        header: "确认",
        body: "确认仓库条件、剩余空间等满足可出入库？",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();
            axiosPostJson(
                "/api/biz/wms/stockAdjust/approveById",
                {
                    orderId: row.id,
                    centerId: row.centerId
                },
                function (response) {
                    if (!isAjaxRspSucc(response)) {
                        MessagePlugin.error({
                            content: response.data.tipMsg,
                            duration: 3000,
                            closeBtn: true,
                            placement: "center",
                            onClose: function () {}
                        });
                    } else {
                        MessagePlugin.info({
                            content: response.data.data,
                            duration: 3000,
                            closeBtn: true,
                            placement: "center",
                            onClose: function () {}
                        });
                    }
                }
            );
        },
        onClose: ({ e, trigger }) => {
            confirmDia.hide();
        }
    });
}

const form_query_data = ref({
    storeCenterId: null,
    storeHouseId: null,
    materialCode: null,
    batchId: null,
    merchantId: null,
    stockUnitRatioId: null,
    orderStatus: null,
    stockAction: null,
    orderNo: null,
    refReceipt: null,
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
        "/api/biz/wms/stockAdjust/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            materialCode: form_query_data.value.materialCode,
            storeCenterId: form_query_data.value.storeCenterId,
            storeHouseId: form_query_data.value.storeHouseId,
            batchId: form_query_data.value.batchId,
            merchantId: form_query_data.value.merchantId,
            stockUnitRatioId: form_query_data.value.stockUnitRatioId,
            orderStatus: form_query_data.value.orderStatus,
            stockAction: form_query_data.value.stockAction,
            orderNo: form_query_data.value.orderNo,
            refReceipt: form_query_data.value.refReceipt
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

const qrcode_show_model = ref({
    visiable: false,
    code: "null"
});

function onShowQrCodeDlg(code) {
    // console.log("onShowQrCodeDlg", code);
    qrcode_show_model.value = {
        visiable: true,
        code: code
    };
}

onMounted(async () => {});
</script>
<template>
    <t-card :bordered="true" :style="{ margin: '5px' }" id="query_form">
        <div style="padding-top: 10px; padding-bottom: 10px">
            <t-form
                labelWidth="60px"
                label-align="right"
                :data="form_query_data"
                layout="inline"
                scroll-to-first-error="smooth"
                @submit="onQueryFormData(true)"
            >
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
                <t_form_item_merchant label="关联商户" v-model="form_query_data.merchantId" />
                <form_enum_list
                    label="操作类型"
                    v-model="form_query_data.stockAction"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.wmsStockAdjustAction"
                    :widthPx="160"
                />
                <form_enum_list
                    label="订单状态"
                    v-model="form_query_data.orderStatus"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.wmsStockAdjustOrderStatus"
                    :widthPx="160"
                />
                <t-form-item label="批次号" name="批次号">
                    <t-input v-model="form_query_data.batchId" :clearable="true"></t-input>
                </t-form-item>
                <t-form-item label="库调单号" name="库调单号">
                    <t-input v-model="form_query_data.orderNo" :clearable="true"></t-input>
                </t-form-item>
                <t-form-item label="物料编码" name="物料编码">
                    <t-input v-model="form_query_data.materialCode" :clearable="true"></t-input>
                </t-form-item>
                <t-form-item label="关联单据" name="关联单据">
                    <t-input v-model="form_query_data.refReceipt" :clearable="true"></t-input>
                </t-form-item>
                <t-button theme="primary" type="submit">开始查询</t-button>
            </t-form>
        </div>
    </t-card>
    <t-card header-bordered :style="{ margin: '5px' }" id="data_table">
        <template #header>
            <div>
                <span>库调单记录</span>
                <span>
                    【订单流转】
                    <span style="font-style: italic">
                        待库管审核 <ArrowRightIcon /> 待库管执行 <ArrowRightIcon />关单（已完成 |
                        已取消）
                    </span>
                </span>
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
            <template #refOperation="{ row }">
                <t-dropdown
                    :options="onBuildTableLineMenu(row)"
                    @click="onTableLineMenuHandler"
                    v-if="onShowTableLineMenu(row)"
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
    <page_deposit_exec v-model="deposit_exec_model" />
    <page_deduct_exec v-model="deduct_exec_model" />
    <dialog_barcode_128
        header="库调单号"
        :visible="qrcode_show_model.visiable"
        :barcode="qrcode_show_model.code"
        @close="qrcode_show_model.visiable = false"
    />
</template>

<style scoped></style>
