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
import t_form_item_merchant from "@/components/md/t_form_item_merchant.vue";
import t_form_item_mkp_store_center from "@/components/mktp/t_form_item_mkp_store_center.vue";
import t_form_item_mkp_store_cascader from "@/components/mktp/t_form_item_mkp_store_cascader.vue";

import page_house_rent from "@/mktp/store_rent/page_house_rent.vue";
import page_cost_rule from "@/mktp/store_rent/page_cost_rule.vue";

const table_columns = [
    { colKey: "id", title: "#ID", width: "80px" },
    { colKey: "centerName", title: "商铺中心" },
    { colKey: "houseName", title: "商铺" },
    {
        colKey: "renterName",
        title: "商户信息"
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
        width: 120,
        cell: (h, { row }) => {
            return <span style="font-weight:bold;">{row.rentStatusTitle}</span>;
        }
    },
    { colKey: "contractNo", title: "合同号" },
    { colKey: "remark", title: "备注" },
    { colKey: "createAction", title: "创建操作" },
    { colKey: "updateAction", title: "最后修改" },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const store_rent_model = ref({
    visible: false,
    addMode: false,
    rentId: null
});

async function onShowRentAdd() {
    store_rent_model.value = {
        addMode: true,
        visible: true,
        rentId: null
    };
}

async function onShowRentEdit(editId) {
    store_rent_model.value = {
        addMode: false,
        visible: true,
        rentId: editId
    };
}

async function onShowStopRent(editId) {
    const confirmDia = DialogPlugin.confirm({
        header: "停止租赁",
        body: "停止租赁？停止后不可恢复",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            // console.log("onShowStopRent: ", e);
            confirmDia.hide();
            axiosPostJson(
                "/api/biz/mktp/storeRent/stopById",
                {
                    itemId: editId
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

const cost_rule_data_model = ref({
    view: false,
    houseId: null
});

function onShowCostRuleDrawer(houseId) {
    if (houseId && houseId > 0) {
        cost_rule_data_model.value = {
            view: true,
            houseId: houseId
        };

        // console.log("onShowCostRuleDrawer: ", cost_rule_data_model.value);
    }
}

function onHideCostRuleDrawer() {
    cost_rule_data_model.value = {
        view: false,
        houseId: -1
    };

    // console.log("onHideCostRuleDrawer: ", cost_rule_data_model.value);
}

const onTableLineMenuHandler = data => {
    if ("修改信息" === data.content) {
        onShowRentEdit(data.value);
    } else if ("停止租赁" === data.content) {
        onShowStopRent(data.value);
    } else if ("计费规则" === data.content) {
        onShowCostRuleDrawer(data.value);
    }
};

const form_query_data = ref({
    centerId: null,
    regionId: null,
    houseId: null,
    renterId: null,
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

function onShowTableLineMenu(row) {
    return row.rentStatus == globalConstDef.mktpStoreRentStatus.Normal;
}

function onMakeTableLineMenu(row) {
    if (row.rentStatus == globalConstDef.mktpStoreRentStatus.Normal) {
        return [
            { content: "修改信息", value: row.id, divider: true },
            { content: "停止租赁", value: row.id, divider: true },
            { content: "计费规则", value: row.houseId, divider: true }
        ];
    } else {
        return [];
    }
}

function onQueryFormData(resetPage) {
    if (resetPage) {
        form_query_data.value.page.pageNo = 1;
    }

    LoadingPlugin(true);
    axiosPostJsonBody(
        "/api/biz/mktp/storeRent/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            houseId: form_query_data.value.houseId,
            renterId: form_query_data.value.renterId,
            rentStatus: form_query_data.value.rentStatus
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
                    v-model="form_query_data.centerId"
                    @change="form_query_data.houseId = null"
                    :showFilter="true"
                />
                <t_form_item_mkp_store_cascader
                    label="租赁商铺"
                    v-model="form_query_data.houseId"
                    :centerId="form_query_data.centerId"
                    :checkStrictly="true"
                    :showFilter="true"
                />
                <t_form_item_merchant
                    label="内部商户"
                    v-model="form_query_data.renterId"
                    :showFilter="true"
                />
                <form_enum_list
                    label="租赁状态"
                    v-model="form_query_data.rentStatus"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.wmsHouseRentStatus"
                    widthPx="160"
                />
                <t-form-item label="合同号" name="合同号">
                    <t-input
                        placeholder="合同号"
                        v-model="form_query_data.contractNo"
                        :clearable="true"
                    />
                </t-form-item>
                <t-button theme="primary" type="submit">开始查询</t-button>
            </t-form>
        </div></t-card
    >
    <t-card header-bordered :style="{ margin: '5px' }" id="data_table">
        <template #header>
            <div>
                <t-button theme="primary" variant="outline" @click="onShowRentAdd()">
                    <template #icon><AddIcon /></template>
                    商铺租赁
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
                    :options="onMakeTableLineMenu(row)"
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
        v-model:visible="cost_rule_data_model.view"
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
        <page_cost_rule v-model="cost_rule_data_model"> </page_cost_rule>
    </t-drawer>
    <page_house_rent v-model="store_rent_model"> </page_house_rent>
</template>

<style scoped></style>
