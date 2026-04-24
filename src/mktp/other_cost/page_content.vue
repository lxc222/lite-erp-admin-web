<script setup lang="jsx">
import { onMounted, ref } from "vue";

const thisModel = defineModel();

import { MessagePlugin, LoadingPlugin } from "tdesign-vue-next";
import { AddIcon } from "tdesign-icons-vue-next";

import {
    ajaxPageDataParse,
    axiosPostJson,
    axiosPostJsonBody,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";
import { message_plugin_config } from "@/assets/asset_biz_base_20251024.js";

import form_enum_list from "@/components/form_enum_list.vue";
import t_form_item_merchant from "@/components/md/t_form_item_merchant.vue";
import t_form_item_mkp_cost_item from "@/components/mktp/t_form_item_mkp_cost_item.vue";
import t_form_item_mkp_store_center from "@/components/mktp/t_form_item_mkp_store_center.vue";
import t_form_item_mkp_store_cascader from "@/components/mktp/t_form_item_mkp_store_cascader.vue";

import page_cost_add from "@/mktp/other_cost/page_cost_add.vue";

const cost_add_model = ref({
    view: false
});

async function showCostAddDlg() {
    cost_add_model.value = {
        visible: true
    };
}

const datePresets = ref({
    昨天: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    今天: dayjs().format("YYYY-MM-DD")
});
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
                {row.createAction}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【备注信息】&nbsp;</b>
                {row.remark}
            </p>
        </div>
    </div>
);

const table_columns = [
    {
        colKey: "id",
        title: "#ID",
        width: 100
    },
    {
        colKey: "receiptNo",
        title: "单据编号"
    },
    {
        colKey: "centerTitle",
        title: "商铺中心",
        width: 120
    },
    {
        colKey: "houseTitle",
        title: "商铺位置"
    },
    {
        colKey: "merchantTitle",
        title: "商户"
    },
    {
        colKey: "costItemTitle",
        title: "￥科目金额",
        width: 180,
        cell: (h, { row }) => {
            let jsx = [];
            jsx.push(<span>【科目】{row.costItemTitle}</span>);
            jsx.push(<p class="my_p_divider" />);
            jsx.push(
                <span>
                    【金额】<span class="table_column_money">￥{row.cost}</span>
                </span>
            );
            return jsx;
        }
    },
    {
        colKey: "costBeginDate",
        title: "费用时段",
        cell: (h, { row }) => {
            return (
                <span style="font-style:italic;">
                    {row.costBeginDate} - {row.costEndDate}
                </span>
            );
        }
    },
    {
        colKey: "deleteAction",
        title: "删除操作",
        width: 120,
        cell: (h, { row }) => {
            if (row.deleteAction) {
                return (
                    <span style="font-style:italic;color:red;">
                        {row.deleteAction} / {row.deleteRemark}
                    </span>
                );
            } else {
                return <span></span>;
            }
        }
    },
    { colKey: "createAction", title: "收费操作", width: 120 },
    { colKey: "updateAction", title: "最后修改", width: 120 },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const delete_submit = ref({
    visible: false,
    costId: null,
    remark: ""
});

async function onCostDeleteShowDlg(editId) {
    delete_submit.value = {
        visible: true,
        costId: editId
    };
}

async function onCostDelete() {
    axiosPostJson(
        "/api/biz/mktp/otherCost/delById",
        {
            itemId: delete_submit.value.costId,
            remark: delete_submit.value.remark
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                delete_submit.value.visible = false;
                MessagePlugin.success({
                    content: response.data.data,
                    duration: 2000,
                    closeBtn: true,
                    placement: "center",
                    onClose: function () {}
                });
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

const onPrintCost = costId => {
    let distUrl = "/api/biz/mktp/otherCost/printById";

    axiosPostJson(distUrl, { itemId: costId }, function (response) {
        if (!isAjaxRspSucc(response)) {
            MessagePlugin.error({
                content: response.data.tipMsg,
                duration: 3000,
                closeBtn: true,
                placement: "center",
                onClose: function () {}
            });
        } else {
            window.open("/web/open/erp/printPdfL190W93?reqId=" + response.data.data);
        }
    });
};

function onShowTableLineMenu(row) {
    if (!row.deleteAccountId || row.deleteAccountId < 1) {
        return true;
    } else {
        return false;
    }
}

function onBuildTableLineMenu(row) {
    let menus = [];

    if (!row.deleteAccountId || row.deleteAccountId < 1) {
        menus.push({ content: "打印单据", value: row, divider: true });
        menus.push({ content: "作废记录", value: row, divider: true });
    }

    return menus;
}

const onTableLineMenuHandler = data => {
    if ("作废记录" === data.content) {
        onCostDeleteShowDlg(data.value.id);
    } else if ("打印单据" === data.content) {
        onPrintCost(data.value.id);
    }
};

const form_query_data = ref({
    houseCenterId: null,
    renterId: null,
    costItemId: null,
    houseId: null,
    deleteStatus: null,
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
        "/api/biz/mktp/otherCost/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            chargeStatus: form_query_data.value.chargeStatus,
            deleteStatus: form_query_data.value.deleteStatus,
            houseCenterId: form_query_data.value.houseCenterId,
            houseId: form_query_data.value.houseId,
            renterId: form_query_data.value.renterId,
            costItemId: form_query_data.value.costItemId
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
                <t_form_item_mkp_store_center
                    label="商铺中心"
                    v-model="form_query_data.houseCenterId"
                    @change="form_query_data.houseId = null"
                    :showFilter="true"
                />
                <t_form_item_mkp_store_cascader
                    label="租赁商铺"
                    v-model="form_query_data.houseId"
                    :centerId="form_query_data.houseCenterId"
                    :checkStrictly="true"
                    :showFilter="true"
                />
                <t_form_item_mkp_cost_item
                    label="费用科目"
                    v-model="form_query_data.costItemId"
                    :showFilter="true"
                />
                <t_form_item_merchant
                    label="关联商户"
                    v-model="form_query_data.renterId"
                    :showFilter="true"
                />
                <form_enum_list
                    label="是否删除"
                    v-model="form_query_data.deleteStatus"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.yesOrNo"
                    widthPx="160"
                />
                <t-button theme="primary" type="submit">开始查询</t-button>
            </t-form>
        </div></t-card
    >
    <t-card header-bordered :style="{ margin: '5px' }" id="query_table_data">
        <template #header>
            <div>
                <t-button theme="primary" variant="outline" @click="showCostAddDlg">
                    <template #icon><AddIcon /></template>
                    新增费用
                </t-button>
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
                @onChange="onQueryFormData(false)"
                @current-change="onQueryFormData(false)"
                @page-size-change="onQueryFormData(false)"
                showFirstAndLastPageBtn
            />
        </template>
    </t-card>
    <t-dialog
        id="costDeleteDlg"
        v-model:visible="delete_submit.visible"
        header="作废记录"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
    >
        <t-form :data="delete_submit" requiredMarkPosition="right" @submit="onCostDelete">
            <t-form-item label="删除原因" name="删除原因">
                <t-input placeholder="请补充删除原因" v-model="delete_submit.remark" />
            </t-form-item>
            <t-form-item>
                <t-space size="small">
                    <t-button theme="primary" type="submit">提交</t-button>
                </t-space>
            </t-form-item>
        </t-form>
    </t-dialog>
    <page_cost_add v-model="cost_add_model" />
</template>

<style scoped></style>
