<script setup lang="jsx">
import { onMounted, ref } from "vue";

const thisModel = defineModel();

import { MessagePlugin, LoadingPlugin, DialogPlugin } from "tdesign-vue-next";
import { ArrowRightIcon, CheckIcon, CloseIcon } from "tdesign-icons-vue-next";

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

import order_add from "@/tms/delivery_order/order_add.vue";
import order_dispatch from "@/tms/delivery_order/order_dispatch.vue";

const doRenderOrderStatus = row => {
    if (row.orderStatus == globalConstDef.tmsDeliveryOrderStatus.CorpAckFail) {
        return (
            <span class="table_column_italic">
                <t-tag theme="danger" shape="round" size="medium" variant="light-outline">
                    <CloseIcon />
                    {row.orderStatusTitle}
                </t-tag>
            </span>
        );
    } else if (row.orderStatus == globalConstDef.tmsDeliveryOrderStatus.CloseComplete) {
        return (
            <span class="table_column_italic">
                <t-tag theme="success" shape="round" size="medium" variant="light-outline">
                    <CheckIcon />
                    {row.orderStatusTitle}
                </t-tag>
            </span>
        );
    } else if (row.orderStatus == globalConstDef.tmsDeliveryOrderStatus.ClosePlanFail) {
        return (
            <span class="table_column_italic">
                <t-tag theme="warning" shape="round" size="medium" variant="light-outline">
                    <CloseIcon />
                    {row.orderStatusTitle}
                </t-tag>
            </span>
        );
    } else if (row.orderStatus == globalConstDef.tmsDeliveryOrderStatus.CloseBizCancel) {
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
        {/* {row.items.map((field, index) => (
            <div class="more-detail" key={index}>
                <p class="content">
                    <b>【子物料-{index + 1}】</b>
                    {field.materialSpecDetail} x {field.materialNum}&nbsp;{field.unit}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 物料编码：
                    {field.materialCode}
                </p>
            </div>
        ))} */}
        <div class="more-detail">
            <p class="content">
                <b>【ID】&nbsp;</b>
                {row.id}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【创建操作】&nbsp;</b>
                {row.createAction}
            </p>
        </div>
    </div>
);

const table_columns = [
    {
        colKey: "orderNo",
        title: "运单号",
        width: 180,
        cell: (h, { row }) => {
            let jsx = [];
            jsx.push(<span>{row.orderNo}</span>);
            jsx.push(<p class="my_p_divider" />);
            jsx.push(doRenderOrderStatus(row));
            return jsx;
        }
    },
    { colKey: "deliveryCorpTitle", title: "承运商" },
    { colKey: "deliveryTimeRangeTitle", title: "运输时段" },
    {
        colKey: "orderNo",
        title: "车辆信息",
        children: [
            { colKey: "deliveryVehicleTypeTitle", title: "车辆型号" },
            { colKey: "deliveryVehicleSpecTitle", title: "运输规格" },
            { colKey: "deliveryVehicleTitle", title: "车牌号码" },
            { colKey: "deliveryDriverTitle", title: "车辆司机" }
        ]
    },
    {
        colKey: "shipPerson",
        title: "发货信息",
        width: 170,
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
        width: 170,
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
    { colKey: "consignNo", title: "委托运单", width: 120 },
    { colKey: "remark", title: "备注", width: 120 },
    { colKey: "updateAction", title: "最后修改", width: 100 },
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

    if (row.operateFlag.dispatch) {
        menus.push({ content: "分派承运商", action: "dispatch", value: row, divider: true });
    }

    if (row.operateFlag.refuse) {
        menus.push({ content: "拒绝运输", action: "refuse", value: row, divider: true });
    }

    if (row.operateFlag.redispatch) {
        menus.push({
            content: "重派承运商",
            action: "redispatch",
            value: row,
            divider: true
        });
    }

    if (row.operateFlag.delivery) {
        menus.push({
            content: "开始运输",
            action: "delivery",
            value: row,
            divider: true
        });
    }

    if (row.operateFlag.complete) {
        menus.push({
            content: "运输完成",
            action: "complete",
            value: row,
            divider: true
        });
    }

    if (row.operateFlag.change) {
        menus.push({ content: "修改订单", action: "edit", value: row, divider: true });
    }

    return menus;
}

const onTableLineMenuHandler = data => {
    if ("dispatch" === data.action) {
        onShowOrderDispatch(data.value);
    } else if ("redispatch" === data.action) {
        onShowOrderRedispatch(data.value);
    } else if ("edit" === data.action) {
        onShowOrderEdit(data.value);
    } else if ("delivery" === data.action) {
        onShowOrderDelivery(data.value.id);
    } else if ("complete" === data.action) {
        onShowOrderComplete(data.value.id);
    } else if ("refuse" === data.action) {
        onShowOrderRefuse(data.value.id);
    }
};

function onShowOrderDelivery(orderIdd) {
    const confirmDia = DialogPlugin.confirm({
        header: "开始运输",
        body: "确定开始运输？",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();
            axiosPostJson(
                "/api/biz/tms/deliveryOrder/deliveryById",
                {
                    orderId: orderIdd
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

function onShowOrderComplete(orderIdd) {
    const confirmDia = DialogPlugin.confirm({
        header: "运输完成",
        body: "确定完成运输？",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();
            axiosPostJson(
                "/api/biz/tms/deliveryOrder/completeById",
                {
                    orderId: orderIdd
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

function onShowOrderRefuse(orderIdd) {
    const confirmDia = DialogPlugin.confirm({
        header: "运输拒绝",
        body: "确定拒绝运输？",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();
            axiosPostJson(
                "/api/biz/tms/deliveryOrder/refuseById",
                {
                    orderId: orderIdd
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

const order_dispatch_model = ref({
    dispatch: false,
    visible: false,
    row: {}
});

async function onShowOrderDispatch(rowV) {
    if (!rowV) {
        MessagePlugin.error({
            content: "无法确定运输单",
            duration: 3000,
            closeBtn: true,
            placement: "center",
            onClose: function () {}
        });
    } else {
        order_dispatch_model.value = {
            dispatch: true,
            row: rowV,
            visible: true
        };
    }
}

function onShowOrderRedispatch(rowV) {
    if (!rowV) {
        MessagePlugin.error({
            content: "无法确定运输单",
            duration: 3000,
            closeBtn: true,
            placement: "center",
            onClose: function () {}
        });
    } else {
        order_dispatch_model.value = {
            dispatch: false,
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
        "/api/biz/tms/deliveryOrder/page",
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
                    :options="thisModel.commonData.tmsDeliveryOrderStatus"
                    :widthPx="180"
                />
                <t-button theme="primary" type="submit">开始查询</t-button>
            </t-form>
        </div></t-card
    >
    <t-card header-bordered :style="{ margin: '5px' }" id="data_table">
        <template #header>
            <div>
                <span>
                    【订单流转】
                    <span style="font-style: italic">
                        待分派承运商 <ArrowRightIcon /> 待承运商响应 <ArrowRightIcon /> 承运商已确认
                        | 承运商已拒绝 <ArrowRightIcon /> 承运商运输中
                        <ArrowRightIcon /> 关单【运输完成 | 承运商拒绝 | 业务取消】
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
    <order_dispatch v-model="order_dispatch_model" />
</template>

<style scoped></style>
