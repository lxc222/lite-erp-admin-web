<script setup lang="jsx">
import { onMounted, ref } from "vue";

const thisModel = defineModel();

import { MessagePlugin, LoadingPlugin } from "tdesign-vue-next";
import { AddIcon } from "tdesign-icons-vue-next";

import {
    ajaxPageDataParse,
    axiosPostJsonBody,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";
import { message_plugin_config } from "@/assets/asset_biz_base_20251024.js";

import form_enum_list from "@/components/form_enum_list.vue";
import t_form_item_mkp_store_center from "@/components/mktp/t_form_item_mkp_store_center.vue";
import t_form_item_mkp_store_region_cascader from "@/components/mktp/t_form_item_mkp_store_region_cascader.vue";

import enable_status_tag from "@/components/enable_status_tag.vue";

import page_house_edit from "@/mktp/store/page_house_edit.vue";

const table_columns = [
    { colKey: "id", title: "#ID", width: 100 },
    { colKey: "storeCenterName", title: "商铺中心" },
    {
        colKey: "storeRegionNameAbs",
        title: "商铺区域"
    },
    { colKey: "title", title: "名称/编号" },
    {
        colKey: "squareSize",
        title: "面积(平方米)",
        align: "right",
        cell: (h, { row }) => {
            return <span>{row.squareSize} 平方</span>;
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
    { colKey: "orderWeight", title: "展示权重", align: "right" },
    { colKey: "remark", title: "备注" },
    { colKey: "createAction", title: "创建操作" },
    { colKey: "updateAction", title: "最后修改" },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const house_submit_model = ref({
    addMode: true,
    visible: false,
    houseId: null,
    storeCenterId: null,
    storeRegionId: null
});

async function onShowStoreHouseAdd() {
    house_submit_model.value = {
        addMode: true,
        visible: true,
        houseId: null,
        storeCenterId: form_query_data.value.storeCenterId,
        storeRegionId: form_query_data.value.storeRegionId
    };

    // console.log("onShowStoreHouseAdd", house_submit_model.value);
}

async function onShowStoreHouseEdit(row) {
    house_submit_model.value = {
        addMode: false,
        visible: true,
        houseId: row.id,
        storeCenterId: row.storeCenterId,
        storeRegionId: row.storeRegionId
    };

    // console.log("onShowStoreHouseEdit", house_submit_model.value);
}

const onTableLineMenuHandler = data => {
    if ("修改信息" === data.content) {
        onShowStoreHouseEdit(data.value);
    }
};

const form_query_data = ref({
    storeCenterId: null,
    storeRegionId: null,
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
        "/api/biz/mktp/store/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            storeCenterId: form_query_data.value.storeCenterId,
            storeRegionId: form_query_data.value.storeRegionId,
            status: form_query_data.value.status,
            type: form_query_data.value.type
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
                    v-model="form_query_data.storeCenterId"
                    @change="form_query_data.storeRegionId = null"
                    :showFilter="true"
                />
                <t_form_item_mkp_store_region_cascader
                    label="商铺区域"
                    v-model="form_query_data.storeRegionId"
                    :checkStrictly="true"
                    :centerId="form_query_data.storeCenterId"
                    :showFilter="true"
                />
                <form_enum_list
                    label="是否启用"
                    v-model="form_query_data.status"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.enableModel"
                    widthPx="160"
                />
                <t-button theme="primary" type="submit">开始查询</t-button>
            </t-form>
        </div>
    </t-card>
    <t-card header-bordered :style="{ margin: '5px' }" id="data_table">
        <template #header>
            <div>
                <t-button theme="primary" variant="outline" @click="onShowStoreHouseAdd()">
                    <template #icon><AddIcon /></template>
                    商铺
                </t-button>
            </div>
        </template>
        <t-space>
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
                        :options="[{ content: '修改信息', value: row, divider: true }]"
                        @click="onTableLineMenuHandler"
                    >
                        <t-button theme="success" shape="round">
                            更多&nbsp;
                            <span><i class="icon-chevron-down"></i></span>
                        </t-button>
                    </t-dropdown>
                </template>
            </t-table>
        </t-space>
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
    <page_house_edit v-model="house_submit_model"></page_house_edit>
</template>

<style scoped>
.header_class_name {
    font: 10px normal !important;
}
</style>
