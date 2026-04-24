<script setup lang="jsx">
import { onMounted, ref } from "vue";

const thisModel = defineModel();

import { MessagePlugin, LoadingPlugin, DialogPlugin } from "tdesign-vue-next";

import { AddIcon, CloseIcon, CheckIcon } from "tdesign-icons-vue-next";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";
import {
    ajaxPageDataParse,
    axiosPostJson,
    axiosPostJsonBody,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";
import { message_plugin_config } from "@/assets/asset_biz_base_20251024.js";

import form_enum_list from "@/components/form_enum_list.vue";
import t_form_item_house_center_list from "@/components/wms/t_form_item_house_center_list.vue";
import t_form_item_wms_house_list from "@/components/wms/t_form_item_wms_house_list.vue";
import t_form_item_wms_cost_item from "@/components/wms/t_form_item_wms_cost_item.vue";
import t_form_item_merchant from "@/components/md/t_form_item_merchant.vue";

import page_cost_add from "@/wms/house_cost/page_cost_add.vue";

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

const table_columns = [
    { colKey: "id", title: "#ID", width: 80 },
    { colKey: "houseTitle", title: "仓库" },
    { colKey: "renterTitle", title: "关联商户" },
    { colKey: "costItemTitle", title: "费用科目" },
    {
        colKey: "cost",
        title: "费用金额￥",
        width: 100,
        align: "right",
        cell: (h, { row }) => {
            return <span class="table_column_money">￥{row.cost}</span>;
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
    { colKey: "receiptNo", title: "单据号" },
    {
        colKey: "chargeCost",
        title: "实收金额￥",
        align: "right",
        width: 100,
        cell: (h, { row }) => {
            if (row.chargeCost) {
                return <span class="table_column_money">￥{row.chargeCost}</span>;
            } else {
                return <span></span>;
            }
        }
    },
    {
        colKey: "chargeAction",
        title: "收费操作",
        width: 120,
        cell: (h, { row }) => {
            if (row.chargeAction) {
                return (
                    <span style="font-style:italic;color:green;">
                        {row.chargeAction} / {row.chargeAtDt}
                    </span>
                );
            } else {
                return <span></span>;
            }
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
    { colKey: "remark", title: "备注" },
    { colKey: "createAction", title: "创建操作", width: 120 },
    { colKey: "updateAction", title: "最后修改", width: 120 },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

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
        menus.push({ content: "作废记录", value: row, divider: true });

        if (!row.chargeAccountId || row.chargeAccountId < 1) {
            menus.push({ content: "添加至代收费", value: row, divider: true });
        }
    }

    return menus;
}

const onTableLineMenuHandler = data => {
    if ("作废记录" === data.content) {
        onCostShowDeleteDlg(data.value.id);
    } else if ("添加至代收费" === data.content) {
        onCostAdd2ChargeList(data.value);
    }
};

const form_query_data = ref({
    houseCenterId: null,
    renterId: null,
    costItemId: null,
    houseId: null,
    deleteStatus: null,
    chargeStatus: null,
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
        "/api/biz/wms/houseCost/page",
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

const table_columns_charge = ref([
    { colKey: "id", title: "#ID", width: 80 },
    { colKey: "houseTitle", title: "仓库" },
    { colKey: "renterTitle", title: "内部商户" },
    { colKey: "costItemTitle", title: "费用科目" },
    {
        colKey: "cost",
        title: "费用金额￥",
        align: "right",
        width: 120,
        cell: (h, { row }) => {
            return <span class="table_column_money">￥{row.cost}</span>;
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
    { colKey: "createAction", title: "创建操作" },
    { colKey: "updateAction", title: "最后修改" },
    { colKey: "refOperation", title: "关联操作", width: 120 }
]);

const cost_data_charge_model = ref([]);

function onCostAdd2ChargeList(row) {
    if (row) {
        //便利cost_data_charge_model判断是否存在和row.id一致的
        let exist = false;
        for (let i = 0; i < cost_data_charge_model.value.length; i++) {
            if (cost_data_charge_model.value[i].id === row.id) {
                exist = true;
                break;
            }
        }

        if (!exist) {
            cost_data_charge_model.value.push(row);
        }
    }
}

function onCostRemoveFromChargeList(costId) {
    if (costId) {
        cost_data_charge_model.value = cost_data_charge_model.value.filter(
            item => item.id !== costId
        );
    }
}
const cost_delete_submit_data = ref({
    visible: false,
    costId: null,
    remark: ""
});

async function onCostShowDeleteDlg(editId) {
    cost_delete_submit_data.value = {
        visible: true,
        costId: editId
    };
}

async function onCostDelete() {
    axiosPostJson(
        "/api/biz/wms/houseCost/delById",
        {
            itemId: cost_delete_submit_data.value.costId,
            remark: cost_delete_submit_data.value.remark
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                cost_delete_submit_data.value.visible = false;
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

function onCostClean() {
    cost_data_charge_model.value = [];
}

function onCostCount() {
    let totalCostIds = [];
    for (let i = 0; i < cost_data_charge_model.value.length; i++) {
        totalCostIds.push(cost_data_charge_model.value[i].id);
    }

    axiosPostJsonBody(
        "/api/biz/wms/houseCost/countByIds",
        {
            costIds: totalCostIds
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                let totalFen = response.data.data.totalCostFen;
                let totalYuan = response.data.data.totalCost;
                const confirmDia = DialogPlugin.confirm({
                    header: "收费确认",
                    body: "总共需收费：￥" + totalYuan + "，确认无误点击确定收费",
                    closeBtn: false,
                    closeOnEscKeydown: false,
                    destroyOnClose: true,
                    closeOnOverlayClick: false,
                    confirmBtn: "确认",
                    cancelBtn: "关闭",
                    onConfirm: ({ e }) => {
                        confirmDia.hide();
                        onCostCharge(totalCostIds, totalFen);
                    },
                    onClose: ({ e, trigger }) => {
                        confirmDia.hide();
                    }
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

function onCostCharge(totalCostIds, totalFen) {
    axiosPostJsonBody(
        "/api/biz/wms/houseCost/chargeByIds",
        {
            costIds: totalCostIds,
            payFen: totalFen
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                cost_data_charge_model.value = [];
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
                <t_form_item_house_center_list
                    label="仓库中心"
                    v-model="form_query_data.houseCenterId"
                    :showFilter="true"
                    @change="form_query_data.houseId = null"
                />
                <t_form_item_wms_house_list
                    label="费用仓库"
                    v-model="form_query_data.houseId"
                    :showFilter="true"
                    :houseType="globalConstDef.wmsHouseType.MerchantPrivate.toString()"
                    :centerId="form_query_data.houseCenterId"
                />
                <t_form_item_wms_cost_item
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
                    label="收费完成"
                    v-model="form_query_data.chargeStatus"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.yesOrNo"
                    :widthPx="160"
                />
                <form_enum_list
                    label="是否删除"
                    v-model="form_query_data.deleteStatus"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.yesOrNo"
                    :widthPx="160"
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
    <t-card
        header-bordered
        :style="{ margin: '5px' }"
        id="charge_table_data"
        v-show="cost_data_charge_model.length > 0"
    >
        <template #actions>
            <div>
                <t-space>
                    <t-button theme="danger" variant="outline" @click="onCostClean">
                        <template #icon><CloseIcon /></template>
                        一键清空
                    </t-button>
                    <t-button theme="primary" variant="outline" @click="onCostCount">
                        <template #icon><CheckIcon /></template>
                        开始收费
                    </t-button>
                </t-space>
            </div>
        </template>
        <t-table
            row-key="index"
            :data="cost_data_charge_model"
            :columns="table_columns_charge"
            bordered="bordered"
            hover="hover"
            tableLayout="fixed"
            size="medium"
            resizable
            :showHeader="true"
            cell-empty-content="-"
        >
            <template #refOperation="{ row }">
                <t-button
                    theme="warning"
                    shape="round"
                    variant="base"
                    @click="onCostRemoveFromChargeList(row.id)"
                    >移出列表</t-button
                >
            </template>
        </t-table>
    </t-card>
    <t-dialog
        id="costDeleteDlg"
        v-model:visible="cost_delete_submit_data.visible"
        header="作废记录"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
    >
        <t-form :data="cost_delete_submit_data" requiredMarkPosition="right" @submit="onCostDelete">
            <t-form-item label="删除原因" name="删除原因">
                <t-input placeholder="请补充删除原因" v-model="cost_delete_submit_data.remark" />
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
