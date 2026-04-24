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
import dialog_barcode_128 from "@/components/dialog_barcode_128.vue";
import t_form_item_house_center_list from "@/components/wms/t_form_item_house_center_list.vue";
import t_form_item_wms_house_cascader from "@/components/wms/t_form_item_wms_house_cascader.vue";

import page_rack_edit from "@/wms/house_rack/page_rack_edit.vue";

import enable_status_tag from "@/components/enable_status_tag.vue";

const table_columns = [
    { colKey: "id", title: "#ID", width: "80" },
    { colKey: "title", title: "库位标签" },
    {
        colKey: "code",
        title: "库位编码",
        cell: (h, { row }) => {
            return <span onClick={() => onShowQrCodeDlg(row.code)}>{row.code}</span>;
        }
    },
    { colKey: "centerTitle", title: "仓库中心" },
    {
        colKey: "houseTitleWithRegion",
        title: "归属仓库"
    },
    {
        colKey: "statusTitle",
        title: "状态",
        width: "110",
        cell: (h, { row }) => {
            return <enable_status_tag status={row.status} />;
        }
    },
    { colKey: "remark", title: "备注" },
    { colKey: "createAction", title: "创建操作", width: 120 },
    { colKey: "updateAction", title: "最后修改", width: 120 },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const rack_edit_model = ref({
    visible: false,
    addMode: false,
    rackId: null
});

async function onShowRackAdd() {
    rack_edit_model.value = {
        addMode: true,
        visible: true,
        rackId: null
    };
}

async function onShowRackEdit(editId) {
    rack_edit_model.value = {
        addMode: false,
        visible: true,
        rackId: editId
    };
}

function onShowTableLineMenu(row) {
    return true;
}

function onBuildTableLineMenu(row) {
    return [{ content: "修改信息", value: row, divider: true }];
}

const onTableLineMenuHandler = data => {
    if ("修改信息" === data.content) {
        onShowRackEdit(data.value.id);
    }
};

const form_query_data = ref({
    centerId: null,
    houseId: null,
    status: null,
    title: null,
    code: null,
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
        "/api/biz/wms/houseRack/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            centerId: form_query_data.value.centerId,
            houseId: form_query_data.value.houseId,
            title: form_query_data.value.title,
            code: form_query_data.value.code
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

const qrcode_show_model = ref({
    visiable: false,
    code: ""
});

function onShowQrCodeDlg(code) {
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
                    label="仓库"
                    v-model="form_query_data.houseId"
                    :centerId="form_query_data.centerId"
                />
                <t-form-item label="库位编号" name="库位编号">
                    <t-input placeholder="库位编号" v-model="form_query_data.title" />
                </t-form-item>
                <t-form-item label="库位编码" name="库位编码">
                    <t-input placeholder="库位编码" v-model="form_query_data.code" />
                </t-form-item>
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
    <t-card header-bordered :style="{ margin: '5px' }" id="data_table">
        <template #header>
            <div>
                <t-button theme="primary" variant="outline" @click="onShowRackAdd()">
                    <template #icon><AddIcon /></template>
                    库位
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
    <page_rack_edit v-model="rack_edit_model"> </page_rack_edit>
    <dialog_barcode_128
        header="库位编码"
        :visible="qrcode_show_model.visiable"
        :barcode="qrcode_show_model.code"
        @close="qrcode_show_model.visiable = false"
    />
</template>

<style scoped></style>
