<script setup lang="jsx">
import { onMounted, ref } from "vue";

const thisModel = defineModel();

import { MessagePlugin, LoadingPlugin } from "tdesign-vue-next";
import { AddIcon, CheckCircleIcon, CloseCircleIcon } from "tdesign-icons-vue-next";

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
import t_form_item_house_region_cascader from "@/components/wms/t_form_item_house_region_cascader.vue";
import t_form_item_employee from "@/components/md/t_form_item_employee.vue";
import dialog_barcode_128 from "@/components/dialog_barcode_128.vue";

import page_house_edit from "@/wms/house/page_house_edit.vue";

import enable_status_tag from "@/components/enable_status_tag.vue";

const table_line_expanded_row_keys = ref([""]);

const onTableLineExpandChange = (value, params) => {
    table_line_expanded_row_keys.value = value;
};

const onTableLineExpandedViewTpl = (h, { row }) => (
    <div>
        <div class="more-detail">
            <p class="content">
                <b>【ID】</b>
                {row.id}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【仓库编码】</b>
                <span>{row.code}</span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【展示权重】</b>
                {row.orderWeight}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【创建操作】</b>
                {row.createAction}
            </p>
        </div>
    </div>
);

const table_columns = [
    {
        colKey: "storeRegionNameAbs",
        title: "仓库区域",
        cell: (h, { row }) => {
            let jsx = [];
            jsx.push(<span>【中心】{row.storeCenterName}</span>);
            jsx.push(<p class="my_p_divider" />);
            jsx.push(<span>【区域】{row.storeRegionNameAbs}</span>);
            jsx.push(<p class="my_p_divider" />);
            jsx.push(<span>【编号】{row.title}</span>);

            return jsx;
        }
    },
    { colKey: "squareSize", title: "面积(平方米)", align: "right", width: "110" },
    {
        colKey: "temperatureTypeTitle",
        title: "温控范围(℃)",
        align: "center",
        width: "150",
        cell: (h, { row }) => {
            let jsx = [];
            jsx.push(<span>{row.temperatureTypeTitle}</span>);
            if (row.temperatureType == globalConstDef.wmsHouseTemperatureType.Special) {
                jsx.push(<p class="my_p_divider" />);
                jsx.push(
                    <span>
                        {row.temperatureLow}℃ ~ {row.temperatureHigh}℃
                    </span>
                );
            }

            return jsx;
        }
    },
    {
        colKey: "houseTagTitles",
        title: "标签",
        cell: (h, { row }) => {
            let jsx = [];
            for (let i = 0; i < row.houseTagTitles.length; i++) {
                jsx.push(
                    <span>
                        <p style="height: 2px;" />
                    </span>
                );
                jsx.push(
                    <span>
                        <t-typography-text code>{row.houseTagTitles[i]}</t-typography-text>
                    </span>
                );
            }

            return jsx;
        }
    },
    {
        colKey: "houseTypeTitle",
        title: "经营类型",
        width: "130",
        align: "right",
        cell: (h, { row }) => {
            if (row.houseType == globalConstDef.wmsHouseType.MerchantPublic) {
                return (
                    <t-tag theme="primary" shape="round" size="medium" variant="light-outline">
                        {<CheckCircleIcon />}
                        {row.houseTypeTitle}&nbsp;
                    </t-tag>
                );
            } else {
                return (
                    <t-tag theme="success" shape="round" size="medium" variant="light-outline">
                        {<CloseCircleIcon />}
                        {row.houseTypeTitle}&nbsp;
                    </t-tag>
                );
            }
        }
    },
    {
        colKey: "statusTitle",
        title: "当前状态",
        width: "110",
        cell: (h, { row }) => {
            return <enable_status_tag status={row.status} />;
        }
    },
    {
        colKey: "manageEmployee1",
        title: "负责人员",
        align: "right",
        width: "180",
        cell: (h, { row }) => {
            let jsx = [];
            if (row.manageEmployee1) {
                jsx.push(<span>{row.manageEmployee1}</span>);
                jsx.push(<p class="my_p_divider" />);
            }

            if (row.manageEmployee2) {
                jsx.push(<span>{row.manageEmployee2}</span>);
                jsx.push(<p class="my_p_divider" />);
            }

            if (row.manageEmployee3) {
                jsx.push(<span>{row.manageEmployee3}</span>);
            }

            return jsx;
        }
    },
    { colKey: "remark", title: "备注", width: 120 },
    { colKey: "updateAction", title: "最后修改", width: 120 },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const house_edit_model = ref({
    addMode: true,
    visible: false,
    houseId: null,
    storeCenterId: null,
    storeRegionId: null
});

async function onShowStoreHouseAdd() {
    house_edit_model.value = {
        addMode: true,
        visible: true,
        houseId: null,
        storeCenterId: form_query_data.value.storeCenterId,
        storeRegionId: form_query_data.value.storeRegionId
    };
}

async function onShowStoreHouseEdit(row) {
    house_edit_model.value = {
        addMode: false,
        visible: true,
        houseId: row.id,
        centerId: row.storeCenterId
    };
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

const onTableLineMenuHandler = data => {
    if ("修改信息" === data.content) {
        onShowStoreHouseEdit(data.value);
    } else if ("显示条码" === data.content) {
        onShowQrCodeDlg(data.value);
    }
};

const form_query_data = ref({
    storeCenterId: null,
    storeRegionId: null,
    status: null,
    houseType: null,
    manageEmployeeId: null,
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
        "/api/biz/wms/house/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            storeCenterId: form_query_data.value.storeCenterId,
            storeRegionId: form_query_data.value.storeRegionId,
            status: form_query_data.value.status,
            houseType: form_query_data.value.houseType,
            manageEmployeeId: form_query_data.value.manageEmployeeId
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
                <t_form_item_house_center_list
                    label="仓库中心"
                    v-model="form_query_data.storeCenterId"
                    :showFilter="true"
                    @change="form_query_data.storeRegionId = null"
                />
                <t_form_item_house_region_cascader
                    label="仓库库区"
                    v-model="form_query_data.storeRegionId"
                    :centerId="form_query_data.storeCenterId"
                    :checkStrictly="false"
                    :showFilter="true"
                />
                <t_form_item_employee
                    label="负责人员"
                    v-model="form_query_data.manageEmployeeId"
                    :showFilter="true"
                />
                <form_enum_list
                    label="经营类型"
                    v-model="form_query_data.type"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.wmsHouseType"
                    :widthPx="160"
                />
                <form_enum_list
                    label="是否启用"
                    v-model="form_query_data.status"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.enableModel"
                    :widthPx="160"
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
                    仓库
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
                    :options="[
                        { content: '修改信息', value: row, divider: true },
                        { content: '显示条码', value: row.code, divider: true }
                    ]"
                    @click="onTableLineMenuHandler"
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
    <dialog_barcode_128
        header="条形码"
        :visible="qrcode_show_model.visiable"
        :barcode="qrcode_show_model.code"
        @close="qrcode_show_model.visiable = false"
    />
    <page_house_edit v-model="house_edit_model"></page_house_edit>
</template>

<style scoped>
.header_class_name {
    font: 10px normal !important;
}
</style>
