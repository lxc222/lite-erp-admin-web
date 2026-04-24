<script setup lang="jsx">
import { onMounted, ref } from "vue";

const thisModel = defineModel();

import { MessagePlugin, DialogPlugin, LoadingPlugin } from "tdesign-vue-next";
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
import t_form_item_house_center_list from "@/components/wms/t_form_item_house_center_list.vue";
import t_form_item_wms_house_cascader from "@/components/wms/t_form_item_wms_house_cascader.vue";
import t_form_item_merchant from "@/components/md/t_form_item_merchant.vue";

import page_house_rent from "@/wms/house_rent/page_house_rent.vue";
import page_cost_rule from "@/wms/house_rent/page_cost_rule.vue";

const doRenderRentStatus = (h, { row }) => {
    if (row.rentStatus == globalConstDef.wmsHouseRentStatus.Normal) {
        return (
            <span class="table_column_italic">
                <t-tag theme="primary" shape="round" size="medium" variant="light-outline">
                    {row.rentStatusTitle}
                </t-tag>
            </span>
        );
    } else if (row.rentStatus == globalConstDef.wmsHouseRentStatus.DateExpire) {
        return (
            <span class="table_column_italic">
                <t-tag theme="danger" shape="round" size="medium" variant="light-outline">
                    {row.rentStatusTitle}
                </t-tag>
            </span>
        );
    } else if (row.rentStatus == globalConstDef.wmsHouseRentStatus.ManualStop) {
        return (
            <span class="table_column_italic">
                <t-tag theme="warning" shape="round" size="medium" variant="light-outline">
                    {row.rentStatusTitle}
                </t-tag>
            </span>
        );
    } else {
        return (
            <span class="table_column_italic">
                <t-tag theme="success" shape="round" size="medium" variant="light-outline">
                    {row.rentStatusTitle}
                </t-tag>
            </span>
        );
    }
};

const table_columns = [
    { colKey: "id", title: "#ID", width: "80" },
    { colKey: "centerName", title: "仓库中心" },
    { colKey: "houseName", title: "仓库" },
    {
        colKey: "renterName",
        title: "租赁商户"
    },
    {
        colKey: "rentBeginDate",
        title: "租赁时段",
        align: "right",
        cell: (h, { row }) => {
            return (
                <span style="font-style:italic;">
                    {row.rentBeginDate} - {row.rentEndDate}
                </span>
            );
        }
    },
    {
        colKey: "rentStatusTitle",
        title: "租赁状态",
        width: 90,
        cell: doRenderRentStatus
    },
    { colKey: "contractNo", title: "合同号" },
    { colKey: "remark", title: "备注" },
    { colKey: "createAction", title: "创建操作", width: 120 },
    { colKey: "updateAction", title: "最后修改", width: 120 },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const house_rent_model = ref({
    visible: false,
    addMode: false,
    rentId: null
});

async function onShowRentAdd() {
    house_rent_model.value = {
        addMode: true,
        visible: true,
        rentId: null
    };
}

async function onShowRentEdit(editId) {
    house_rent_model.value = {
        addMode: false,
        visible: true,
        rentId: editId
    };
}

async function onShowRentStop(row) {
    const confirmDia = DialogPlugin.confirm({
        header: "停止租赁",
        body: "停止租赁？停止后不可恢复,请及时处理关联费用",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            // console.log("onShowRentStop: ", e);
            confirmDia.hide();
            axiosPostJson(
                "/api/biz/wms/houseRent/stopById",
                {
                    itemId: row.id,
                    houseId: row.houseId
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

const cost_rule_drawer_model = ref({
    view: false,
    houseId: null
});

function onShowCostRuleDrawer(houseId) {
    if (houseId && houseId > 0) {
        cost_rule_drawer_model.value = {
            view: true,
            houseId: houseId
        };

        // console.log("onShowCostRuleDrawer: ", cost_rule_drawer_model.value);
    }
}

function onHideCostRuleDrawer() {
    cost_rule_drawer_model.value = {
        view: false,
        houseId: -1
    };

    // console.log("onHideCostRuleDrawer: ", cost_rule_drawer_model.value);
}

function onShowTableLineMenu(row) {
    return row.rentStatus == globalConstDef.wmsHouseRentStatus.Normal;
}

function onBuildTableLineMenu(row) {
    if (row.rentStatus == globalConstDef.wmsHouseRentStatus.Normal) {
        return [
            { content: "修改信息", value: row, divider: true },
            { content: "停止租赁", value: row, divider: true },
            { content: "计费规则", value: row.houseId, divider: true }
        ];
    } else {
        return [];
    }
}

const onTableLineMenuHandler = data => {
    if ("修改信息" === data.content) {
        onShowRentEdit(data.value.id);
    } else if ("停止租赁" === data.content) {
        onShowRentStop(data.value);
    } else if ("计费规则" === data.content) {
        onShowCostRuleDrawer(data.value);
    }
};

const form_query_data = ref({
    centerId: null,
    houseId: null,
    merchantId: null,
    rentStatus: null,
    contractNo: null,
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
        "/api/biz/wms/houseRent/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            centerId: form_query_data.value.centerId,
            houseId: form_query_data.value.houseId,
            merchantId: form_query_data.value.merchantId,
            rentStatus: form_query_data.value.rentStatus,
            contractNo: form_query_data.value.contractNo
        },
        function (response) {
            LoadingPlugin(false);
            if (isAjaxRspSucc(response)) {
                ajaxPageDataParse(response.data.data, form_query_data);

                MessagePlugin.success({
                    content: "数据加载完成",
                    duration: 2000,
                    closeBtn: true,
                    placement: "top-right",
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
                <t_form_item_house_center_list
                    label="仓库中心"
                    v-model="form_query_data.centerId"
                    @change="form_query_data.houseId = null"
                    :showFilter="true"
                />
                <t_form_item_wms_house_cascader
                    label="租赁仓库"
                    v-model="form_query_data.houseId"
                    :centerId="form_query_data.centerId"
                />
                <t_form_item_merchant label="内部商户" v-model="form_query_data.merchantId" />
                <t-form-item label="合同号" name="合同号">
                    <t-input
                        placeholder="合同号"
                        v-model="form_query_data.contractNo"
                        :clearable="true"
                    />
                </t-form-item>
                <form_enum_list
                    label="租赁状态"
                    v-model="form_query_data.rentStatus"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.wmsHouseRentStatus"
                    :widthPx="160"
                />
                <t-button theme="primary" type="submit">开始查询</t-button>
            </t-form>
        </div></t-card
    >
    <t-card header-bordered :style="{ margin: '5px' }" id="data_table">
        <template #header>
            <div>
                <t-button theme="primary" variant="outline" @click="onShowRentAdd()">
                    <template #icon><AddIcon /></template>
                    仓库租赁
                </t-button>
            </div>
        </template>
        <t-table
            rowKey="id"
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
                showFirstAndLastPageBtn
                @onChange="onQueryFormData(false)"
                @current-change="onQueryFormData(false)"
                @page-size-change="onQueryFormData(false)"
        /></template>
    </t-card>
    <t-drawer
        id="costRuleList"
        v-model:visible="cost_rule_drawer_model.view"
        @close="onHideCostRuleDrawer"
        size="100%"
        placement="right"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
    >
        <template #header>计费规则</template>
        <page_cost_rule v-model="cost_rule_drawer_model"> </page_cost_rule>
    </t-drawer>
    <page_house_rent v-model="house_rent_model"> </page_house_rent>
</template>

<style scoped></style>
