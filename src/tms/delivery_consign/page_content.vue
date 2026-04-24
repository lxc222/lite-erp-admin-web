<script setup lang="jsx">
import { onMounted, ref } from "vue";

const thisModel = defineModel();

import { MessagePlugin, LoadingPlugin, DialogPlugin } from "tdesign-vue-next";
import { AddIcon, ArrowRightIcon, CheckIcon, CloseIcon } from "tdesign-icons-vue-next";

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

import order_add from "@/tms/delivery_consign/order_add.vue";

const doRenderOrderStatus = row => {
    if (row.orderStatus == globalConstDef.tmsDeliveryConsignStatus.CloseComplete) {
        return (
            <span class="table_column_italic">
                <t-tag theme="success" shape="round" size="medium" variant="light-outline">
                    <CheckIcon />
                    {row.orderStatusTitle}
                </t-tag>
            </span>
        );
    } else if (row.orderStatus == globalConstDef.tmsDeliveryConsignStatus.CloseManualCancel) {
        return (
            <span class="table_column_italic">
                <t-tag theme="warning" shape="round" size="medium" variant="light-outline">
                    <CloseIcon />
                    {row.orderStatusTitle}
                </t-tag>
            </span>
        );
    } else if (row.orderStatus == globalConstDef.tmsDeliveryConsignStatus.CloseBizCancel) {
        return (
            <span class="table_column_italic">
                <t-tag theme="warning" shape="round" size="medium" variant="light-outline">
                    <CloseIcon />
                    {row.orderStatusTitle}
                </t-tag>
            </span>
        );
    } else if (row.orderStatus == globalConstDef.tmsDeliveryConsignStatus.CloseBizClose) {
        return (
            <span class="table_column_italic">
                <t-tag theme="warning" shape="round" size="medium" variant="light-outline">
                    <CloseIcon />
                    {row.orderStatusTitle}
                </t-tag>
            </span>
        );
    } else {
        return (
            <span class="table_column_italic">
                <t-tag theme="primary" shape="round" size="medium" variant="light-outline">
                    <ArrowRightIcon />
                    {row.orderStatusTitle}
                </t-tag>
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
        {row.items.map((field, index) => (
            <div class="more-detail" key={index}>
                <p class="content">
                    <b>【车辆-{index + 1}】</b>
                    [运单]{field.deliveryOrderNo}&nbsp;&nbsp;|{field.timeRangeTitle}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{field.vehicleTypeTitle}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {field.vehicelSpecTitle}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 装车：
                    {field.needManualLoadTitle}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;卸车：
                    {field.needManualUnLoadTitle}
                </p>
            </div>
        ))}
        <div class="more-detail">
            <p class="content">
                <b>【ID】&nbsp;</b>
                {row.id}&nbsp;&nbsp;
                <b>【创建操作】&nbsp;</b>
                {row.createAction}
                &nbsp;&nbsp;
                <b>【委托业务】&nbsp;</b>
                {row.consignBizTypeTitle}
                &nbsp;&nbsp;
                <b>【委托业务单】&nbsp;</b>
                {row.consignBizOrderNo}
            </p>
        </div>
    </div>
);

const table_columns = [
    {
        colKey: "orderNo",
        title: "委托单",
        width: 220,
        cell: (h, { row }) => {
            let jsx = [];
            jsx.push(<span>{row.consignNo}</span>);
            jsx.push(<p class="my_p_divider" />);
            jsx.push(doRenderOrderStatus(row));
            return jsx;
        }
    },
    {
        colKey: "shipPerson",
        title: "发货信息",
        cell: (h, { row }) => {
            return (
                <span style="">
                    【发货】{row.shipPerson}
                    <p class="my_p_divider" />
                    【电话】{row.shipPhone}
                    <p class="my_p_divider" />
                    【地址】{row.shipAddr}
                </span>
            );
        }
    },
    {
        colKey: "receivePerson",
        title: "收货信息",
        cell: (h, { row }) => {
            return (
                <span style="">
                    【收货】{row.receivePerson}
                    <p class="my_p_divider" />
                    【电话】{row.receivePhone}
                    <p class="my_p_divider" />
                    【地址】{row.receiveAddr}
                </span>
            );
        }
    },
    {
        colKey: "items",
        title: "车辆数量",
        width: 180,
        cell: (h, { row }) => {
            return <span style="color:green;">{row.items.length}</span>;
        }
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

    if (row.operateFlag.collect) {
        menus.push({ content: "确认收单", action: "receive", value: row, divider: true });
    }

    if (row.operateFlag.change) {
        menus.push({ content: "修改订单", action: "edit", value: row, divider: true });
    }

    if (row.operateFlag.cancel) {
        menus.push({ content: "取消订单", action: "cancel", value: row, divider: true });
    }

    return menus;
}

const onTableLineMenuHandler = data => {
    if ("receive" === data.action) {
        onShowOrderReceive(data.value.id, data.value.consignNo);
    } else if ("cancel" === data.action) {
        onCancelOrder(data.value.id, data.value.consignNo);
    } else if ("edit" === data.action) {
        onShowOrderEdit(data.value);
    }
};

function onShowOrderReceive(orderIdd, consignNo) {
    const confirmDia = DialogPlugin.confirm({
        header: "确认收单",
        body: "收单后请及时在 “运输订单” 安排车辆",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();
            axiosPostJson(
                "/api/biz/tms/deliveryConsign/receiveById",
                {
                    orderId: orderIdd,
                    orderNo: consignNo
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

function onCancelOrder(orderIdd, orderNoo) {
    const confirmDia = DialogPlugin.confirm({
        header: "取消订单",
        body: "确定取消承运单？",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();
            axiosPostJson(
                "/api/biz/tms/deliveryConsign/cancelById",
                {
                    orderId: orderIdd,
                    orderNo: orderNoo
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

const order_add_model = ref({
    visible: false,
    row: {}
});

function onShowOrderEdit(rowV) {
    if (!rowV) {
        order_add_model.value = {
            row: rowV,
            visible: true
        };
    } else {
        order_add_model.value = {
            row: rowV,
            visible: true
        };
    }
}

const form_query_data = ref({
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
        "/api/biz/tms/deliveryConsign/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            orderStatus: form_query_data.value.orderStatus
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
                <form_enum_list
                    label="订单状态"
                    v-model="form_query_data.orderStatus"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.tmsDeliveryConsignStatus"
                    :widthPx="180"
                />
                <t-button theme="primary" type="submit">开始查询</t-button>
            </t-form>
        </div></t-card
    >
    <t-card header-bordered :style="{ margin: '5px' }" id="data_table">
        <template #header>
            <div>
                <t-button theme="primary" variant="outline" @click="onShowOrderEdit(null)">
                    <template #icon><AddIcon />承运单</template>
                </t-button>
                <span>
                    【订单流转】
                    <span style="font-style: italic">
                        待委托收单 <ArrowRightIcon /> 待承运商派代 <ArrowRightIcon /> 承运商已确认
                        <ArrowRightIcon /> 关单【运输完成 | 人工取消 | 业务取消 | 业务关单】
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
    <order_add v-model="order_add_model" />
</template>

<style scoped></style>
