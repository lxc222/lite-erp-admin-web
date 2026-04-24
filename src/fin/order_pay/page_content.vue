<script setup lang="jsx">
import { onMounted, ref } from "vue";

const thisModel = defineModel();

import { MessagePlugin, LoadingPlugin, DialogPlugin } from "tdesign-vue-next";
import { AddIcon } from "tdesign-icons-vue-next";

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
import table_with_pagination from "@/components/table_with_pagination.vue";
import form_stock_unit_ratio from "@/components/wms/form_stock_unit_ratio.vue";
import sc_purchase_supplier_check_group from "@/components/scm/purchase_supplier_check_group.vue";

import enable_status_tag from "@/components/enable_status_tag.vue";

const table_line_expanded_row_keys = ref([""]);

const onTableLineExpandChange = (value, params) => {
    table_line_expanded_row_keys.value = value;
    // console.log("onTableLineExpandChange", value, params);
};

const onTableLineExpandedViewTpl = (h, { row }) => (
    <div>
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
        colKey: "receiverTitle",
        title: "收款人"
    },
    {
        colKey: "invoiceEmployeeId",
        title: "开票信息",
        align: "center",
        children: [
            { colKey: "invoiceEmployeeTitle", title: "开票人" },
            { colKey: "invoiceDt", title: "开票时间" }
        ]
    },
    {
        colKey: "payFenShould",
        title: "付款信息",
        align: "center",
        children: [
            {
                colKey: "payFenShould",
                title: "应付金额",
                align: "right",
                cell: (h, { row }) => {
                    return <span>￥{row.payFenShould}</span>;
                }
            },
            {
                colKey: "payFenHave",
                title: "实付金额",
                align: "right",
                cell: (h, { row }) => {
                    return <span>￥{row.payFenHave}</span>;
                }
            },
            { colKey: "payEmployeeTitle", title: "付款人" },
            { colKey: "payDt", title: "付款时间" }
        ]
    },
    {
        colKey: "payReceiptBizTypeTitle",
        title: "关联业务",
        cell: (h, { row }) => {
            let jsx = [];
            jsx.push(<span>【类型】{row.payReceiptBizTypeTitle}</span>);
            jsx.push(<p class="my_p_divider" />);
            jsx.push(<span>【单号】{row.payBizOrderNo}</span>);
            return jsx;
        }
    },
    {
        colKey: "statusTitle",
        title: "是否启用",
        width: 115,
        cell: (h, { row }) => {
            return <enable_status_tag status={row.status} />;
        }
    },
    { colKey: "remark", title: "备注" },
    { colKey: "updateAction", title: "最后修改" },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

async function onShowInvoiceDlg(editId) {
    const confirmDia = DialogPlugin.confirm({
        header: "确认开票",
        body: "请根据实际金额开票，开票后及时付款",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();
            axiosPostJsonBody(
                "/api/biz/finance/orderPay/invoice",
                {
                    id: editId
                },
                function (response) {
                    if (isAjaxRspSucc(response)) {
                        MessagePlugin.success({
                            ...message_plugin_config,
                            content: response.data.data
                        });
                    } else {
                        MessagePlugin.error({
                            ...message_plugin_config,
                            content: response.data.tipMsg
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

const pay_submit_model = ref({
    visible: false,
    submitData: {
        id: null,
        needMoney: null,
        payMoney: null,
        remark: null
    }
});

async function onShowPayDlg(editId) {
    pay_submit_model.value.submitData = {};
    pay_submit_model.value.addMode = false;
    axiosPostJson(
        "/api/biz/finance/orderPay/oneById",
        {
            itemId: editId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                pay_submit_model.value.submitData = {};
                pay_submit_model.value.submitData.id = response.data.data.id;
                pay_submit_model.value.submitData.needMoney = response.data.data.payFenShould;
                pay_submit_model.value.visible = true;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

function onSubmitPay() {
    let distUrl = "/api/biz/finance/orderPay/pay";
    axiosPostJsonBody(distUrl, pay_submit_model.value.submitData, function (response) {
        if (!isAjaxRspSucc(response)) {
            MessagePlugin.error({
                ...message_plugin_config,
                content: response.data.tipMsg
            });
        } else {
            pay_submit_model.value.visible = false;
            MessagePlugin.info({
                content: response.data.data,
                duration: 3000,
                closeBtn: true,
                placement: "center",
                onClose: function () {}
            });
        }
    });
}

function onShowTableLineMenu(row) {
    if (row.operateFlag.receipt || row.operateFlag.pay) {
        return true;
    } else {
        return false;
    }
}

function onBuildTableLineMenu(row) {
    let menus = [];

    if (row.operateFlag.receipt) {
        menus.push({ content: "开始开票", action: "invoice", value: row, divider: true });
    }

    if (row.operateFlag.pay) {
        menus.push({ content: "开始支付", action: "pay", value: row, divider: true });
    }

    return menus;
}

const onTableLineMenuHandler = data => {
    if ("pay" === data.action) {
        onShowPayDlg(data.value.id);
    } else if ("invoice" === data.action) {
        onShowInvoiceDlg(data.value.id);
    }
};

const form_query_data = ref({
    status: null,
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
        "/api/biz/finance/orderPay/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            status: form_query_data.value.status
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
                label-align="right"
                labelWidth="60px"
                :data="form_query_data"
                layout="inline"
                scroll-to-first-error="smooth"
                @submit="onQueryFormData(true)"
            >
                <form_enum_list
                    label="是否启用"
                    v-model="form_query_data.status"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.enableModel"
                    :widthPx="160"
                />
                <t-button theme="primary" type="submit">开始查询</t-button>
            </t-form>
        </div></t-card
    >
    <table_with_pagination
        :data="form_query_data.pageData"
        :columns="table_columns"
        :pagination="form_query_data.page"
        rowKey="id"
        :expandedRow="onTableLineExpandedViewTpl"
        :expandedRowKeys="table_line_expanded_row_keys"
        @expandChange="onTableLineExpandChange"
        @pageChange="onQueryFormData(false)"
        @pageSizeChange="onQueryFormData(false)"
    >
        <template #headerActions>
            <div>
                <t-button theme="primary" variant="outline" @click="onShowPayAddDlg()">
                    <template #icon><AddIcon /></template>
                    采购单位
                </t-button>
            </div>
        </template>
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
    </table_with_pagination>
    <t-dialog
        id="pay_submit_model"
        v-model:visible="pay_submit_model.visible"
        :header="'应付金额' + (pay_submit_model?.value?.submitData?.needMoney ?? '')"
        width="40%"
        :closeBtn="true"
        :cancelBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
        @confirm="onSubmitPay"
    >
        <t-form
            :rules="pay_submit_model.rules"
            :data="pay_submit_model.submitData"
            requiredMarkPosition="right"
        >
            <t-form-item label="实付金额" name="实付金额">
                <t-input
                    placeholder="实付金额"
                    label="￥"
                    suffix="元"
                    type="number"
                    v-model="pay_submit_model.submitData.payMoney"
                />
            </t-form-item>
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="pay_submit_model.submitData.remark" />
            </t-form-item>
        </t-form>
    </t-dialog>
</template>

<style scoped></style>
