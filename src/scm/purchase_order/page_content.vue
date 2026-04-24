<script setup lang="jsx">
import { ref, onMounted } from "vue";

const thisModel = defineModel();

import { MessagePlugin, LoadingPlugin, DialogPlugin } from "tdesign-vue-next";
import { AddIcon, ArrowRightIcon } from "tdesign-icons-vue-next";

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
import t_form_item_employee from "@/components/md/t_form_item_employee.vue";
import sc_purchase_supplier_list from "@/components/scm/purchase_supplier_list.vue";
import t_form_item_purchase_relation from "@/components/scm/t_form_item_purchase_relation.vue";
import order_detail from "@/scm/purchase_order/order_detail.vue";

const deliveryDateRangePresets = ref({
    最近7天: [dayjs().subtract(6, "day").toDate(), dayjs().toDate()],
    最近3天: [dayjs().subtract(2, "day").toDate(), dayjs().toDate()],
    最近1天: [dayjs().subtract(1, "day").toDate(), dayjs().toDate()]
});

const table_columns = [
    {
        colKey: "supplierName",
        title: "供应商",
        cell: (h, { row }) => {
            return (
                <span>
                    {row.supplierName} / {row.supplierTypeStr}
                </span>
            );
        }
    },
    { colKey: "orderNo", title: "订单号" },
    {
        colKey: "price",
        title: "订单总额",
        align: "right",
        width: "120px",
        cell: (h, { row }) => {
            return <span class="table_column_money">￥{row.price}</span>;
        }
    },
    {
        colKey: "orderItems",
        title: "采购信息",
        cell: (h, { row }) => {
            if (!row.orderItems) {
                return <span>无</span>;
            } else {
                let jsx = [];
                for (let i = 0; i < row.orderItems.length; i++) {
                    let item = row.orderItems[i];
                    jsx.push(
                        <span>
                            {item.materialTitle} x {item.purchaseNum} {item.purchaseUnitTitle}
                        </span>
                    );
                    jsx.push(<br />);
                    jsx.push(<span style="margin-left:25px;">已入库：{item.stockNumDone}</span>);
                    jsx.push(<br />);
                    jsx.push(<span style="margin-left:25px;">入库中：{item.stockNumDoing}</span>);

                    if (i < row.orderItems.length - 1) {
                        jsx.push(<br />);
                    }
                }

                return jsx;
            }
        }
    },
    {
        colKey: "deliveryDateBegin",
        title: "收货时间",
        cell: (h, { row }) => {
            let jsx = [];
            jsx.push(
                <span>
                    【日期】{row.deliveryDateBegin} ~ {row.deliveryDateEnd}
                </span>
            );
            jsx.push(<br />);
            jsx.push(
                <span>
                    【时段】{row.deliveryTimeBegin} ~ {row.deliveryTimeEnd}
                </span>
            );

            return jsx;
        }
    },
    {
        colKey: "orderStatusTitle",
        title: "当前状态",
        width: "120",
        cell: (h, { row }) => {
            return <span style="color:#954500;font-style:italic;">{row.orderStatusTitle}</span>;
        }
    },
    { colKey: "remark", title: "备注", width: "120" },
    { colKey: "updateAction", title: "最后修改", width: 120 },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const table_line_expanded_row_keys = ref([""]);

const onTableLineExpandChange = (value, params) => {
    table_line_expanded_row_keys.value = value;
    // console.log("onTableLineExpandChange", value, params);
};

const onTableLineExpandedViewTpl = (h, { row }) => {
    var jsx = [];

    for (let i = 0; i < row.orderItems.length; i++) {
        let item = row.orderItems[i];
        jsx.push(
            <p class="content">
                <b>【{i + 1}】</b>
                <b>【供货编码】</b> {item.supplyCode}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【规格编码】</b> {item.specMaterialCode}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【已入库】</b> {item.stockNumDone}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【入库中】</b> {item.stockNumDoing}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【物料总价】</b> {item.materialTitle}/{item.materialSpecValueTxt}/￥
                {item.purchasePrice} x {item.purchaseNum}
                {item.purchaseUnitTitle} = ￥{item.price}
            </p>
        );
    }

    jsx.push(<p class="my_p_divider" />);
    jsx.push(
        <p class="content">
            <b>【变更通知】</b> {row.statusChangeNoticeTitle}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <b>【滞留通知】</b> {row.detentionNoticeTitle}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <b>【滞留天数】</b> {row.detentionDays}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <b>【滞留额外告警人】</b> {row.detentionNoticeEmployeeNos}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </p>
    );
    jsx.push(<p class="my_p_divider" />);
    jsx.push(
        <p class="content">
            <b>【ID】</b> {row.id}
            <b>【创建操作】</b> {row.createAction}
        </p>
    );

    return jsx;
};

async function onCancelOrder(orderNoo) {
    const confirmDia = DialogPlugin.confirm({
        header: "取消订单",
        body: "取消订单后及时追回货品及发票",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();
            axiosPostJson(
                "/api/biz/scm/purchaseOrder/cancelById",
                {
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

async function onNextStepOrder(orderNoo, orderStatus) {
    axiosPostJson(
        "/api/biz/scm/purchaseOrder/nextStepTip",
        {
            orderNo: orderNoo,
            orderStatus: orderStatus
        },
        function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                const confirmDia = DialogPlugin.confirm({
                    header: "采购单",
                    body: response.data.data.nextStepTip,
                    closeBtn: false,
                    closeOnEscKeydown: false,
                    destroyOnClose: true,
                    closeOnOverlayClick: false,
                    confirmBtn: "确认",
                    cancelBtn: "关闭",
                    onConfirm: ({ e }) => {
                        confirmDia.hide();
                        axiosPostJson(
                            "/api/biz/scm/purchaseOrder/nextStep",
                            {
                                orderNo: orderNoo,
                                orderStatus: orderStatus
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
        }
    );
}

function onBuildTableLineMenu(row) {
    let menus = [];

    menus.push({ content: "订单跟踪", action: "orderTrace", value: row.id, divider: true });
    menus.push({ content: "订单详情", action: "orderDetail", value: row.id, divider: true });

    if (row.operateFlag.change) {
        menus.push({ content: "修改订单", action: "editOrder", value: row.id, divider: true });
    }

    if (row.operateFlag.cancel) {
        menus.push({
            content: "取消订单",
            action: "cancelOrder",
            value: row.orderNo,
            divider: true
        });
    }

    if (row.operateFlag.depositStock || row.operateFlag.checkWare) {
        menus.push({
            content: "收货/入库",
            action: "orderOperateExt",
            value: row.id,
            divider: true
        });
    }

    if (row.operateFlag.nextStep) {
        menus.push({
            content: row.nextStepBtn,
            action: "stepOrder",
            value: row.orderNo,
            orderStatus: row.orderStatus,
            divider: true
        });
    }

    return menus;
}

const onTableLineMenuHandler = data => {
    if ("orderDetail" === data.action || "orderOperateExt" === data.action) {
        onShowOrderDetail(data.value);
    } else if ("editOrder" === data.action) {
        onShowOrderEdit(data.value);
    } else if ("cancelOrder" === data.action) {
        onCancelOrder(data.value);
    } else if ("stepOrder" === data.action) {
        onNextStepOrder(data.value, data.orderStatus);
    } else {
    }
};

const order_detail_model = ref({
    visible: false,
    orderId: null
});

async function onShowOrderDetail(orderId) {
    order_detail_model.value = { visible: true, orderId: orderId };
}

const order_submit_model = ref({
    visible: false,
    addMode: true,
    relationId: null,
    submitData: {
        id: null,
        supplierId: null,
        orderStatus: null,
        bizEmployeeId: null,
        statusChangeNotice: null,
        detentionNotice: null,
        detentionDays: null,
        detentionNoticeEmployeeNos: null,
        deliveryDateRange: [],
        deliveryTimeRange: ["00:00:00", "23:59:59"],
        deliveryDateBegin: null,
        deliveryDateEnd: null,
        deliveryTimeBegin: null,
        deliveryTimeEnd: null,
        remark: null,
        orderItems: [],
        orderItemMap: {}
    },
    disableMaterialChange: function () {
        if (order_submit_model.value.addMode) {
            return false;
        }

        if (!order_submit_model.value.submitData.operateFlag) {
            return false;
        }

        return !order_submit_model.value.submitData.operateFlag.beforeApprove;
    },
    rules: {
        supplierId: [
            { required: true, message: "供应商*必填", type: "error", trigger: "blur" },
            {
                required: true,
                message: "供应商*必填",
                type: "error",
                trigger: "change"
            }
        ]
    }
});

async function onShowOrderAdd() {
    order_submit_model.value.submitData = {
        deliveryDateRange: [],
        deliveryTimeRange: ["00:00:00", "23:59:59"]
    };
    order_submit_model.value.visible = true;
    order_submit_model.value.addMode = true;
}

async function onShowOrderEdit(editId) {
    order_submit_model.value.addMode = false;
    order_submit_model.value.visible = true;
    axiosPostJson(
        "/api/biz/scm/purchaseOrder/oneById",
        {
            itemId: editId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                order_submit_model.value.submitData = response.data.data;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

function onAddMaterialToOrder() {
    if (!order_submit_model.value.submitData.orderItems) {
        order_submit_model.value.submitData.orderItems = [];
        order_submit_model.value.submitData.orderItemMap = {};
    }

    axiosPostJson(
        "/api/biz/scm/purchaseRelation/oneById",
        {
            itemId: order_submit_model.value.relationId
        },
        function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                order_submit_model.value.relationId = null;

                let relation = response.data.data;
                if (!order_submit_model.value.submitData.orderItemMap[relation.id]) {
                    order_submit_model.value.submitData.orderItems.push({
                        showTitle:
                            relation.materialTitle +
                            " / " +
                            relation.materialCode +
                            " / " +
                            relation.materialSpecValueTxt +
                            " / ￥" +
                            relation.purchasePrice +
                            "/" +
                            relation.purchaseUnitTitle,
                        relationId: relation.id
                    });

                    order_submit_model.value.submitData.orderItemMap[relation.id] = 1;
                } else {
                    order_submit_model.value.submitData.orderItemMap[relation.id] =
                        order_submit_model.value.submitData.orderItemMap[relation.id] + 1;
                }
            }
        }
    );
}

function onRemoveMaterialFromOrder(relationId) {
    //alert(code);
    delete order_submit_model.value.submitData.orderItemMap[relationId];
    order_submit_model.value.submitData.orderItems =
        order_submit_model.value.submitData.orderItems.filter(
            item => item.relationId !== relationId
        );
}

function onSyncDeliveryDateTime() {
    if (order_submit_model.value.submitData.deliveryDateRange.length >= 2) {
        order_submit_model.value.submitData.deliveryDateBegin =
            order_submit_model.value.submitData.deliveryDateRange[0];
        order_submit_model.value.submitData.deliveryDateEnd =
            order_submit_model.value.submitData.deliveryDateRange[1];

        console.log(order_submit_model.value.submitData.deliveryDateBegin);
        console.log(order_submit_model.value.submitData.deliveryDateEnd);
    }

    if (order_submit_model.value.submitData.deliveryTimeRange.length >= 2) {
        order_submit_model.value.submitData.deliveryTimeBegin =
            order_submit_model.value.submitData.deliveryTimeRange[0];
        order_submit_model.value.submitData.deliveryTimeEnd =
            order_submit_model.value.submitData.deliveryTimeRange[1];

        console.log(order_submit_model.value.submitData.deliveryTimeBegin);
        console.log(order_submit_model.value.submitData.deliveryTimeEnd);
    }
}

const onSubmitOrder = () => {
    onSyncDeliveryDateTime();

    if (order_submit_model.value.submitData.orderItems) {
        for (let i = 0; i < order_submit_model.value.submitData.orderItems.length; i++) {
            let relationId = order_submit_model.value.submitData.orderItems[i]["relationId"];
            order_submit_model.value.submitData.orderItems[i]["purchaseNum"] =
                order_submit_model.value.submitData.orderItemMap[relationId];
        }
    }

    let distUrl = "/api/biz/scm/purchaseOrder/add";
    if (order_submit_model.value.submitData.id && order_submit_model.value.submitData.id > 0) {
        distUrl = "/api/biz/scm/purchaseOrder/change";
    }

    axiosPostJsonBody(distUrl, order_submit_model.value.submitData, function (response) {
        if (!isAjaxRspSucc(response)) {
            MessagePlugin.error({
                ...message_plugin_config,
                content: response.data.tipMsg
            });
        } else {
            order_submit_model.value.visible = false;
            MessagePlugin.info({
                content: response.data.data,
                duration: 3000,
                closeBtn: true,
                placement: "center",
                onClose: function () {}
            });
        }
    });
};

const form_query_data = ref({
    supplierId: null,
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
        "/api/biz/scm/purchaseOrder/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            supplierId: form_query_data.value.supplierId,
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
    <t-card :bordered="true" :style="{ margin: '5px' }" id="form_data">
        <div style="padding-top: 10px; padding-bottom: 10px">
            <t-form
                label-align="right"
                labelWidth="60px"
                :data="form_query_data"
                layout="inline"
                scroll-to-first-error="smooth"
                @submit="onQueryFormData(true)"
            >
                <sc_purchase_supplier_list label="供应商" v-model="form_query_data.supplierId" />
                <form_enum_list
                    label="订单状态"
                    v-model="form_query_data.orderStatus"
                    v-if="globalLoginData.commonData"
                    :options="globalLoginData.commonData.scPurchaseOrderStatus"
                    :widthPx="165"
                />
                <t-button theme="primary" type="submit">开始查询</t-button>
            </t-form>
        </div></t-card
    >
    <t-card header-bordered :style="{ margin: '5px' }" id="data_table">
        <template #header>
            <div>
                <t-button theme="primary" variant="outline" @click="onShowOrderAdd()">
                    <template #icon><AddIcon /></template>
                    采购单
                </t-button>
                <span>
                    【订单流转】
                    <span style="font-style: italic">
                        待提交 <ArrowRightIcon /> 待审核 <ArrowRightIcon /> 待收货
                        <ArrowRightIcon />待入库 <ArrowRightIcon /> 待开票 <ArrowRightIcon /> 待付款
                        <ArrowRightIcon /> 已结单(取消) <ArrowRightIcon /> 已结单(付款)
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
                    :minColumnWidth="150"
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
    <t-drawer
        id="order_submit_model"
        size="70%"
        placement="right"
        :closeBtn="true"
        :cancelBtn="null"
        confirmBtn="提交"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        v-model:visible="order_submit_model.visible"
        @confirm="onSubmitOrder"
    >
        <template #header>订单信息</template>
        <t-form
            :rules="order_submit_model.rules"
            :data="order_submit_model.submitData"
            requiredMarkPosition="right"
        >
            <sc_purchase_supplier_list
                label="供应商"
                v-model="order_submit_model.submitData.supplierId"
                :disabled="!order_submit_model.addMode"
            />
            <t-form-item label="送货日期" name="送货日期" help="*必填">
                <t-date-range-picker
                    v-model="order_submit_model.submitData.deliveryDateRange"
                    :presets="deliveryDateRangePresets"
                    clearable
                    format="YYYY-MM-DD"
                    :disabled="order_submit_model.disableMaterialChange()"
                />
            </t-form-item>
            <t-form-item label="送货时间" name="送货时间" help="*必填">
                <t-time-range-picker
                    v-model="order_submit_model.submitData.deliveryTimeRange"
                    clearable
                    format="HH:mm:ss"
                    allow-input
                    :disabled="order_submit_model.disableMaterialChange()"
                />
            </t-form-item>
            <t_form_item_purchase_relation
                label="采购物料"
                v-model="order_submit_model.relationId"
                v-show="!order_submit_model.disableMaterialChange()"
                :supplierId="order_submit_model.submitData.supplierId"
                :status="globalConstDef.enableModel.Enabled.toString()"
            >
                <template #actionIcon>
                    <t-button
                        variant="dashed"
                        @click="onAddMaterialToOrder"
                        :disabled="
                            order_submit_model.submitData.orderStatus >
                            globalConstDef.scPurchaseOrderStatus.Draft
                        "
                    >
                        <t-icon name="add" />
                    </t-button>
                </template>
            </t_form_item_purchase_relation>
            <t-form-item label="已选定物料" name="已选定物料" help="*必填">
                <table>
                    <tr
                        v-if="order_submit_model.submitData"
                        v-for="mi in order_submit_model.submitData.orderItems"
                    >
                        <td>
                            <span>{{ mi.showTitle }} / {{ mi.relationId }}</span>
                        </td>
                        <td>
                            <t-input-number
                                :autoWidth="true"
                                :allowInputOverLimit="false"
                                :decimalPlaces="0"
                                style="margin-left: 16px"
                                v-model="order_submit_model.submitData.orderItemMap[mi.relationId]"
                                size="small"
                                :max="100"
                                :min="1"
                                :disabled="order_submit_model.disableMaterialChange()"
                            />
                        </td>
                        <td>
                            <t-link
                                v-show="!order_submit_model.disableMaterialChange()"
                                theme="primary"
                                hover="color"
                                style="margin-left: 16px"
                                @click="onRemoveMaterialFromOrder(mi.relationId)"
                                :disabled="order_submit_model.disableMaterialChange()"
                            >
                                <i class="icon-remove"></i>
                            </t-link>
                        </td>
                    </tr>
                </table>
            </t-form-item>
            <t_form_item_employee
                label="跟单人员"
                help="*必填, 仅展示拥有账号的人员，区别于系统操作人，订单相关通知将发送给此人员"
                v-model="order_submit_model.submitData.bizEmployeeId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :hasAccount="globalConstDef.yesOrNo.Yes.toString()"
            />
            <form_enum_radio_group
                label="变更通知"
                help="*必填，订单变更会发送邮件通知创建者"
                v-model="order_submit_model.submitData.statusChangeNotice"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.yesOrNo"
            />
            <form_enum_radio_group
                label="滞留预警"
                help="*必填，在库滞留超过一定天数触发，系统会在前一日13:00～18:00间发送邮件提醒"
                v-model="order_submit_model.submitData.detentionNotice"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.detentionNoticeType"
            />
            <t-form-item
                label="滞留天数"
                name="滞留天数"
                help="*必填"
                v-show="
                    order_submit_model.submitData.detentionNotice &&
                    order_submit_model.submitData.detentionNotice !=
                        globalConstDef.detentionNoticeType.NoNotice
                "
            >
                <t-input
                    placeholder="订单滞留预警天数"
                    suffix="天"
                    v-model="order_submit_model.submitData.detentionDays"
                />
            </t-form-item>
            <t-form-item
                label="其他提醒人员"
                name="其他提醒人员"
                help="选填，除了跟单人之外的人员"
                v-show="
                    order_submit_model.submitData.detentionNotice &&
                    order_submit_model.submitData.detentionNotice !=
                        globalConstDef.detentionNoticeType.NoNotice
                "
            >
                <t-input
                    placeholder="请填写人员工号，多个人员使用英文逗号分隔"
                    v-model="order_submit_model.submitData.detentionNoticeEmployeeNos"
                />
            </t-form-item>
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="order_submit_model.submitData.remark" />
            </t-form-item>
        </t-form>
    </t-drawer>

    <order_detail v-model="order_detail_model" />
</template>

<style scoped></style>
