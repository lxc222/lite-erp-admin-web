<script setup lang="jsx">
import { onMounted, ref } from "vue";

const thisModel = defineModel();

import { MessagePlugin, LoadingPlugin, DialogPlugin } from "tdesign-vue-next";
import { AddIcon, ArrowRightIcon, VehicleIcon, QrcodeIcon } from "tdesign-icons-vue-next";

import { parseIntFromStr } from "@/assets/asset_utils_base_20251024.js";
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
import form_enum_radio_group from "@/components/form_enum_radio_group.vue";
import dialog_question from "@/components/dialog_question.vue";
import dialog_barcode_128 from "@/components/dialog_barcode_128.vue";
import t_form_item_employee from "@/components/md/t_form_item_employee.vue";
import t_form_item_stock_adjust_time_range from "@/components/wms/t_form_item_stock_adjust_time_range.vue";

import material_deposit from "@/wms/stock_center/material_deposit.vue";
import material_deduct from "@/wms/stock_center/material_deduct.vue";
import material_transfer from "@/wms/stock_center/material_transfer.vue";

const datePresets = ref({
    今天: dayjs().format("YYYY-MM-DD"),
    明天: dayjs().add(1, "day").format("YYYY-MM-DD"),
    后天: dayjs().add(2, "day").format("YYYY-MM-DD")
});
const doRenderOrderStatus = row => {
    if (row.orderStatus == globalConstDef.wmsTransferOrderStatus.CloseTransferOK) {
        return (
            <span class="table_column_italic">
                <t-tag theme="primary" shape="round" size="medium" variant="light-outline">
                    {row.orderStatusTitle}
                </t-tag>
                &nbsp; &nbsp;
                <span style="color:#5164d3;" onClick={() => onShowQrCodeDlg(row.orderNo)}>
                    <QrcodeIcon size="1.5em" />
                </span>
            </span>
        );
    } else if (row.orderStatus == globalConstDef.wmsTransferOrderStatus.CloseTransferNo) {
        return (
            <span class="table_column_italic">
                <t-tag theme="success" shape="round" size="medium" variant="light-outline">
                    {row.orderStatusTitle}
                </t-tag>
                &nbsp; &nbsp;
                <span style="color:#5164d3;" onClick={() => onShowQrCodeDlg(row.orderNo)}>
                    <QrcodeIcon size="1.5em" />
                </span>
            </span>
        );
    } else if (row.orderStatus == globalConstDef.wmsTransferOrderStatus.CloseTransferPart) {
        return (
            <span class="table_column_italic">
                <t-tag theme="warning" shape="round" size="medium" variant="light-outline">
                    {row.orderStatusTitle}
                </t-tag>
                &nbsp; &nbsp;
                <span style="color:#5164d3;" onClick={() => onShowQrCodeDlg(row.orderNo)}>
                    <QrcodeIcon size="1.5em" />
                </span>
            </span>
        );
    } else if (row.orderStatus == globalConstDef.wmsTransferOrderStatus.CloseStockExp) {
        return (
            <span class="table_column_italic">
                <t-tag theme="danger" shape="round" size="medium" variant="light-outline">
                    {row.orderStatusTitle}
                </t-tag>
                &nbsp; &nbsp;
                <span style="color:#5164d3;" onClick={() => onShowQrCodeDlg(row.orderNo)}>
                    <QrcodeIcon size="1.5em" />
                </span>
            </span>
        );
    } else if (row.orderStatus == globalConstDef.wmsTransferOrderStatus.CloseConsignFail) {
        return (
            <span class="table_column_italic">
                <t-tag theme="danger" shape="round" size="medium" variant="light-outline">
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
            <span class="table_column_italic">
                <t-tag theme="primary" shape="round" size="medium" variant="light-outline">
                    <ArrowRightIcon />
                    {row.orderStatusTitle}
                </t-tag>
                &nbsp; &nbsp;
                <span style="color:#5164d3;" onClick={() => onShowQrCodeDlg(row.orderNo)}>
                    <QrcodeIcon size="1.6em" />
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
                <b>【运输】</b>
                {row.needDeliveryTitle}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【装车】</b>
                {row.needManualLoadTitle}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【卸车】</b>
                {row.needManualUnLoadTitle}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【车辆数量】</b>
                {row.deliveryVehicleNum}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【运输车型】</b>
                {row.deliveryVehicleTypeId}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【运输规格】</b>
                {row.deliveryVehicleSpecId}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【运输时段】</b>
                {row.deliveryVehicleTimeRangeId}
            </p>
        </div>
        <div class="more-detail">
            <p class="content">
                <b>【物料规格】</b>
                {row.materialSpecTitle}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【物料编码】</b>
                {row.materialCode}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【调出人员】</b>
                {row.srcBizEmployeeTitle}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【调入人员】</b>
                {row.dstBizEmployeeTitle}&nbsp;&nbsp;
            </p>
        </div>
        <div class="more-detail">
            <p class="content">
                <b>【ID】</b>
                {row.id}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【运输】</b>
                {row.needDeliveryTitle}&nbsp;&nbsp;{row.deliveryConsignNo}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【创建操作】</b>
                {row.createAction}
            </p>
        </div>
    </div>
);

const table_columns = [
    {
        colKey: "orderNo",
        title: "跨仓调拨",
        width: 250,
        align: "left",
        cell: (h, { row }) => {
            let jsx = [];
            jsx.push(<span>【单号】{row.orderNo}</span>);
            jsx.push(doRenderOrderStatus(row));

            if (row.needDelivery == globalConstDef.yesOrNo.Yes) {
                jsx.push(<p class="my_p_divider" />);
                jsx.push(
                    <span style="color:#5164d3;margin-top:5px;">
                        <VehicleIcon size="2em" />
                    </span>
                );
            }

            return jsx;
        }
    },
    {
        colKey: "srcCenterId",
        title: "调出信息",
        cell: (h, { row }) => {
            return (
                <span>
                    【中心】{row.srcCenter}
                    <p class="my_p_divider" />
                    【仓库】{row.srcHouse}
                    <p class="my_p_divider" />
                    【商户】{row.srcMerchant}
                    <p class="my_p_divider" />
                    【批次】<span style="font-weight:bold;">{row.srcBatchId}</span>
                </span>
            );
        }
    },
    {
        colKey: "dstCenterId",
        title: "调入信息",
        cell: (h, { row }) => {
            return (
                <span>
                    【中心】 {row.dstCenter}
                    <p class="my_p_divider" />
                    【库区】{row.dstRegion}
                    <p class="my_p_divider" />
                    【商户】{row.dstMerchant}
                </span>
            );
        }
    },
    {
        colKey: "specMaterialId",
        title: "物料规格",
        children: [
            {
                colKey: "specMaterialId",
                title: "物料信息",
                cell: (h, { row }) => {
                    return (
                        <span>
                            【物料名称】{row.materialTitle}
                            <p class="my_p_divider" />
                            【规格编码】
                            <span style="font-weight:bold;">{row.specMaterialCode}</span>
                        </span>
                    );
                }
            },
            {
                colKey: "deductStockNumDone",
                title: "调拨数量",
                width: 180,
                cell: (h, { row }) => {
                    let jsx = [];
                    jsx.push(<span>【计划数量】{row.stockNum}</span>);
                    jsx.push(<p class="my_p_divider" />);
                    jsx.push(<span>【出库数量】{row.deductStockNumDoneTotal}</span>);
                    jsx.push(<p class="my_p_divider" />);
                    jsx.push(<span>【调入数量】{row.depositStockNumDone}</span>);
                    jsx.push(<p class="my_p_divider" />);
                    jsx.push(<span>【退库数量】{row.backStockNumDone}</span>);
                    jsx.push(<p class="my_p_divider" />);
                    jsx.push(<span>【库存单位】{row.stockUnitRatioTitle}</span>);

                    return jsx;
                }
            }
        ]
    },
    { colKey: "remark", title: "备注", width: 120 },
    { colKey: "updateAction", title: "最后修改", width: 120 },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

function onShowTableLineMenu(row) {
    return row.operateFlag.anyOperateTrue;
}

function onBuildTableLineMenu(row) {
    let menus = [];
    if (!row.operateFlag) {
        return menus;
    }

    if (row.operateFlag.deductStock) {
        menus.push({ content: "创建出库单", value: row, divider: true });
    }

    if (row.operateFlag.depositStock) {
        menus.push({ content: "创建入库单", value: row, divider: true });
    }

    if (row.operateFlag.backStock) {
        menus.push({ content: "创建退库单", value: row, divider: true });
    }

    if (row.operateFlag.close) {
        menus.push({ content: "关闭订单", value: row.id, divider: true });
    }

    if (row.operateFlag.cancel) {
        menus.push({ content: "取消订单", value: row.id, divider: true });
    }

    return menus;
}

const onTableLineMenuHandler = data => {
    if ("关闭订单" === data.content) {
        onCloseOrder(data.value);
    } else if ("取消订单" === data.content) {
        onCancelOrder(data.value);
    } else if ("创建出库单" === data.content) {
        onShowDeduct(data.value.srcBatchId, data.value.srcBizEmployeeId, data.value.orderNo);
    } else if ("创建入库单" === data.content) {
        // onShowDepositStock(
        //     data.value.id,
        //     data.value.dstBizEmployeeId,
        //     data.value.stockUnitRatioTitle
        // );
        onShowDeposit(
            data.value.srcBatchId,
            data.value.dstCenterId,
            data.value.dstRegionId,
            data.value.dstBizEmployeeId,
            data.value.orderNo
        );
    } else if ("创建退库单" === data.content) {
        onShowBack(
            data.value.srcBatchId,
            data.value.srcCenterId,
            data.value.srcRegionId,
            data.value.srcBizEmployeeId,
            data.value.orderNo
        );
    }
};

async function onCloseOrder(editId) {
    const confirmDia = DialogPlugin.confirm({
        header: "关闭订单",
        body: "如已发货请及时追回货品",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();
            axiosPostJson(
                "/api/biz/wms/stockTransfer/closeById",
                {
                    orderId: editId
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

async function onCancelOrder(editId) {
    const confirmDia = DialogPlugin.confirm({
        header: "取消订单",
        body: "如已发货请及时追回货品",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();
            axiosPostJson(
                "/api/biz/wms/stockTransfer/cancelById",
                {
                    orderId: editId
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

function onShowDeduct(batchId, bizEmployeeId, refBizOrderNo) {
    if (!batchId) {
        MessagePlugin.error({
            ...message_plugin_config,
            content: "请求失败: 参数不能为空"
        });

        deduct_model.value = {
            batchId: null,
            visible: false,
            bizEmployeeId: bizEmployeeId,
            refBizOrderNo: refBizOrderNo
        };
    } else {
        deduct_model.value = {
            batchId: batchId,
            visible: true,
            bizEmployeeId: bizEmployeeId,
            refBizOrderNo: refBizOrderNo
        };
    }
}

const deduct_model = ref({
    visible: false,
    batchId: null,
    bizEmployeeId: null,
    refBizOrderNo: null
});

const deduct_stock_model = ref({
    visible: false,
    editId: null,
    stockTitle: null,
    adjustDate: null,
    adjustTimeRangeId: null,
    bizEmployeeId: null
});

function onSubmitDeductStock(input, remark) {
    // console.log("onSubmitDeductStock: " + input + ", " + remark);
    let realNum = parseIntFromStr(input, 0);
    if (realNum <= 0) {
        MessagePlugin.success({
            content: "请输入正确的数量",
            duration: 2000,
            closeBtn: true,
            placement: "center",
            onClose: function () {}
        });
        return;
    }

    axiosPostJsonBody(
        "/api/biz/wms/stockTransfer/deductStock",
        {
            orderId: deduct_stock_model.value.editId,
            stockNum: realNum,
            timeRangeId: deduct_stock_model.value.timeRangeId,
            bizEmployeeId: deduct_stock_model.value.bizEmployeeId,
            remark: remark
        },
        function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                deduct_stock_model.value.visible = false;
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
}

async function onShowDeductStock(editId, bizEmployeeId, stockTitle) {
    deduct_stock_model.value = {};
    deduct_stock_model.value.editId = editId;
    deduct_stock_model.value.stockTitle = stockTitle;
    deduct_stock_model.value.bizEmployeeId = bizEmployeeId;
    deduct_stock_model.value.visible = true;
}

function onShowDeposit(batchId, centerId, regionId, bizEmployeeId, refBizOrderNo) {
    if (!batchId) {
        deposit_model.value = {
            batchId: null,
            visible: true,
            centerId: centerId,
            regionId: regionId,
            bizEmployeeId: bizEmployeeId,
            refBizOrderNo: refBizOrderNo
        };
    } else {
        deposit_model.value = {
            batchId: batchId,
            visible: true,
            centerId: centerId,
            regionId: regionId,
            bizEmployeeId: bizEmployeeId,
            refBizOrderNo: refBizOrderNo
        };
    }
}

const deposit_model = ref({
    visible: false,
    batchId: null,
    centerId: null,
    regionId: null,
    bizEmployeeId: null,
    refBizOrderNo: null
});

function onShowBack(batchId, centerId, regionId, bizEmployeeId, refBizOrderNo) {
    if (!batchId) {
        back_model.value = {
            batchId: null,
            visible: true,
            centerId: centerId,
            regionId: regionId,
            bizEmployeeId: bizEmployeeId,
            refBizOrderNo: refBizOrderNo
        };
    } else {
        back_model.value = {
            batchId: batchId,
            visible: true,
            centerId: centerId,
            regionId: regionId,
            bizEmployeeId: bizEmployeeId,
            refBizOrderNo: refBizOrderNo
        };
    }
}

const back_model = ref({
    visible: false,
    batchId: null,
    regionId: null,
    bizEmployeeId: null,
    refBizOrderNo: null
});

const deposit_stock_model = ref({
    visible: false,
    editId: null,
    stockTitle: null,
    adjustDate: null,
    adjustTimeRangeId: null,
    bizEmployeeId: null,
    deductNeedAuth: null,
    deductForDepartment: null,
    deductForOtherDepartment: null
});

function onSubmitDepositStock(input, remark) {
    // console.log("onSubmitDepositStock: " + input);
    let realNum = parseIntFromStr(input, 0);
    if (realNum <= 0) {
        MessagePlugin.success({
            content: "请输入正确的数量",
            duration: 2000,
            closeBtn: true,
            placement: "center",
            onClose: function () {}
        });
        return;
    }

    axiosPostJsonBody(
        "/api/biz/wms/stockTransfer/depositStock",
        {
            orderId: deposit_stock_model.value.editId,
            stockNum: realNum,
            timeRangeId: deposit_stock_model.value.timeRangeId,
            bizEmployeeId: deposit_stock_model.value.bizEmployeeId,
            deductNeedAuth: deposit_stock_model.value.deductNeedAuth,
            deductForDepartment: deposit_stock_model.value.deductForDepartment,
            deductForOtherDepartment: deposit_stock_model.value.deductForOtherDepartment,
            remark: remark
        },
        function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                deposit_stock_model.value.visible = false;
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
}

async function onShowDepositStock(editId, bizEmployeeId, stockTitle) {
    deposit_stock_model.value = {};
    deposit_stock_model.value.editId = editId;
    deposit_stock_model.value.stockTitle = stockTitle;
    deposit_stock_model.value.bizEmployeeId = bizEmployeeId;
    deposit_stock_model.value.visible = true;
}

const back_stock_model = ref({
    visible: false,
    editId: null,
    stockTitle: null,
    adjustDate: null,
    adjustTimeRangeId: null,
    bizEmployeeId: null,
    deductNeedAuth: null,
    deductForDepartment: null,
    deductForOtherDepartment: null
});

function onSubmitBackStock(input, remark) {
    // console.log("onSubmitBackStock: " + input);
    let realNum = parseIntFromStr(input, 0);
    if (realNum <= 0) {
        MessagePlugin.success({
            content: "请输入正确的数量",
            duration: 2000,
            closeBtn: true,
            placement: "center",
            onClose: function () {}
        });
        return;
    }

    axiosPostJsonBody(
        "/api/biz/wms/stockTransfer/backById",
        {
            orderId: back_stock_model.value.editId,
            stockNum: realNum,
            timeRangeId: back_stock_model.value.timeRangeId,
            bizEmployeeId: back_stock_model.value.bizEmployeeId,
            deductNeedAuth: back_stock_model.value.deductNeedAuth,
            deductForDepartment: back_stock_model.value.deductForDepartment,
            deductForOtherDepartment: back_stock_model.value.deductForOtherDepartment,
            remark: remark
        },
        function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                back_stock_model.value.visible = false;
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
}

async function onShowBackStock(editId, bizEmployeeId, stockTitle) {
    back_stock_model.value = {};
    back_stock_model.value.editId = editId;
    back_stock_model.value.stockTitle = stockTitle;
    back_stock_model.value.bizEmployeeId = bizEmployeeId;
    back_stock_model.value.visible = true;
}

const transfer_model = ref({
    visible: false,
    row: {}
});

async function doShowMaterialTransfer(rowV) {
    if (!rowV) {
        transfer_model.value = {
            row: rowV,
            visible: true
        };
    } else {
        transfer_model.value = {
            row: rowV,
            visible: true
        };
    }
}

const form_query_data = ref({
    orderNo: null,
    orderStatus: null,
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
        "/api/biz/wms/stockTransfer/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            orderStatus: form_query_data.value.orderStatus,
            deductStockOrderNo: form_query_data.value.deductStockOrderNo,
            depositStockOrderNo: form_query_data.value.depositStockOrderNo,
            backStockOrderNo: form_query_data.value.backStockOrderNo
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
    code: ""
});

function onShowQrCodeDlg(code) {
    console.log("onShowQrCodeDlg", code);
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
                <t-form-item label="调拨单号" name="调拨单号">
                    <t-input v-model="form_query_data.orderNo"></t-input>
                </t-form-item>
                <form_enum_list
                    label="订单状态"
                    v-model="form_query_data.orderStatus"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.wmsStockTransferOrderStatus"
                    :widthPx="160"
                />
                <t-button theme="primary" type="submit">开始查询</t-button>
            </t-form>
        </div></t-card
    >
    <t-card header-bordered :style="{ margin: '5px' }" id="data_table">
        <template #header>
            <div>
                <t-button theme="primary" variant="outline" @click="doShowMaterialTransfer()">
                    <template #icon><AddIcon /></template>
                    调拨单
                </t-button>
                <span>
                    【订单流转】
                    <span style="font-style: italic">
                        创单完成 <ArrowRightIcon /> 待运输确认 <ArrowRightIcon /> 调拨中
                        <ArrowRightIcon />关单（部分调拨 | 全量调拨 | 未调拨 | 库存异常 |
                        运输委托失败）
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
    <material_transfer v-model="transfer_model"></material_transfer>

    <material_deduct
        id="deduct_model"
        v-model="deduct_model"
        dstUrl="/api/biz/wms/stockTransfer/deductStock"
        :bizEmployeeId="deduct_model.bizEmployeeId"
        :refBizOrderNo="deduct_model.refBizOrderNo"
    />
    <material_deposit
        id="deposit_model"
        v-model="deposit_model"
        dstUrl="/api/biz/wms/stockTransfer/depositStock"
        :centerId="deposit_model.centerId"
        :regionId="deposit_model.regionId"
        :bizEmployeeId="deposit_model.bizEmployeeId"
        :refBizOrderNo="deposit_model.refBizOrderNo"
    />
    <material_deposit
        id="back_model"
        v-model="back_model"
        dstUrl="/api/biz/wms/stockTransfer/backStock"
        :centerId="back_model.centerId"
        :regionId="back_model.regionId"
        :bizEmployeeId="back_model.bizEmployeeId"
        :refBizOrderNo="back_model.refBizOrderNo"
    />
    <dialog_question
        id="deduct_stock_model"
        title="调出操作"
        label="出库数量"
        help="*必填"
        width="40%"
        v-model="deduct_stock_model"
        :withRemark="true"
        :inputSuffix="deduct_stock_model.stockTitle"
        inputType="number"
        @change="onSubmitDeductStock"
    >
        <template #extFormItem>
            <t-form-item label="调出日期" name="调出日期" help="*必填">
                <t-date-picker
                    v-model="deduct_stock_model.adjustDate"
                    :presets="datePresets"
                    :clearable="true"
                    :allowInput="false"
                    :enableTimePicker="false"
                    format="YYYY-MM-DD"
                />
            </t-form-item>
            <t_form_item_stock_adjust_time_range
                label="调出时段"
                help="*必填"
                v-model="deduct_stock_model.adjustTimeRangeId"
            />
            <t_form_item_employee
                label="调出人员"
                help="选填, 仅展示拥有账号的人员，不填则默认当前操作人"
                v-model="deduct_stock_model.bizEmployeeId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :hasAccount="globalConstDef.yesOrNo.Yes.toString()"
            />
        </template>
    </dialog_question>
    <dialog_question
        id="deposit_stock_model"
        title="调入操作"
        label="入库数量"
        help="*必填"
        width="40%"
        :withRemark="true"
        :inputSuffix="deposit_stock_model.stockTitle"
        inputType="number"
        v-model="deposit_stock_model"
        @change="onSubmitDepositStock"
    >
        <template #extFormItem>
            <t-form-item label="调入日期" name="调入日期" help="*必填">
                <t-date-picker
                    v-model="deposit_stock_model.adjustDate"
                    :presets="datePresets"
                    :clearable="true"
                    :allowInput="false"
                    :enableTimePicker="false"
                    format="YYYY-MM-DD"
                />
            </t-form-item>
            <t_form_item_stock_adjust_time_range
                label="调入时段"
                help="*必填"
                v-model="deposit_stock_model.adjustTimeRangeId"
            />
            <t_form_item_employee
                label="调入人员"
                help="选填, 仅展示拥有账号的人员，不填则默认当前操作人"
                v-model="deposit_stock_model.bizEmployeeId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :hasAccount="globalConstDef.yesOrNo.Yes.toString()"
            />
            <form_enum_radio_group
                label="出库权限"
                help="必填, 默认只有调入人员能出库"
                v-show="deposit_stock_model.bizEmployeeId"
                v-model="deposit_stock_model.deductNeedAuth"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.yesOrNo"
            />
            <form_enum_radio_group
                label="同部门出库"
                help="必填，授权调入人员相同部门人员出库"
                v-show="deposit_stock_model.bizEmployeeId"
                v-model="deposit_stock_model.deductForDepartment"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.yesOrNo"
            />
            <form_enum_radio_group
                label="部门主管出库"
                help="必填，限定调入人员所在部门各级Leader出库"
                v-show="deposit_stock_model.bizEmployeeId"
                v-model="deposit_stock_model.deductForOtherDepartment"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.yesOrNo"
            />
        </template>
    </dialog_question>
    <dialog_question
        id="back_stock_model"
        title="退库操作"
        label="退库数量"
        help="*必填"
        width="40%"
        :withRemark="true"
        :inputSuffix="back_stock_model.stockTitle"
        inputType="number"
        v-model="back_stock_model"
        @change="onSubmitBackStock"
    >
        <template #extFormItem>
            <t-form-item label="退库日期" name="退库日期" help="*必填">
                <t-date-picker
                    v-model="back_stock_model.adjustDate"
                    :presets="datePresets"
                    :clearable="true"
                    :allowInput="false"
                    :enableTimePicker="false"
                    format="YYYY-MM-DD"
                />
            </t-form-item>
            <t_form_item_stock_adjust_time_range
                label="退库时段"
                help="*必填"
                v-model="back_stock_model.adjustTimeRangeId"
            />
            <t_form_item_employee
                label="调入人员"
                help="选填, 仅展示拥有账号的人员，不填则默认当前操作人"
                v-model="back_stock_model.bizEmployeeId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :hasAccount="globalConstDef.yesOrNo.Yes.toString()"
            />
            <form_enum_radio_group
                label="出库预审"
                help="*必填, 如选中则出库首先需要入库人员或者该人员直接主管审批"
                v-show="back_stock_model.bizEmployeeId"
                v-model="back_stock_model.deductNeedAuth"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.yesOrNo"
            />
            <form_enum_radio_group
                label="同部门可出库"
                help="*必填，如选中则入库人员同部门人员亦可提交库调申请"
                v-show="back_stock_model.bizEmployeeId"
                v-model="back_stock_model.deductForDepartment"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.yesOrNo"
            />
            <form_enum_radio_group
                label="其他部门可出库"
                help="*必填，如选中则非入库人员部门人员亦可出库"
                v-show="back_stock_model.bizEmployeeId"
                v-model="back_stock_model.deductForOtherDepartment"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.yesOrNo"
            />
        </template>
    </dialog_question>
    <dialog_barcode_128
        header="跨仓调拨单号"
        :visible="qrcode_show_model.visiable"
        :barcode="qrcode_show_model.code"
        @close="qrcode_show_model.visiable = false"
    />
</template>

<style scoped></style>
