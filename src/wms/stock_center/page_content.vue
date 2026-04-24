<script setup lang="jsx">
import { onMounted, ref } from "vue";

const thisModel = defineModel();

import { AddIcon, RemoveIcon, LockOnIcon, QrcodeIcon } from "tdesign-icons-vue-next";
import { MessagePlugin, LoadingPlugin } from "tdesign-vue-next";

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
import dialog_question from "@/components/dialog_question.vue";
import dialog_barcode_128 from "@/components/dialog_barcode_128.vue";
import t_form_item_merchant from "@/components/md/t_form_item_merchant.vue";
import form_stock_unit_ratio from "@/components/wms/form_stock_unit_ratio.vue";
import t_form_item_house_center_list from "@/components/wms/t_form_item_house_center_list.vue";
import t_form_item_wms_house_cascader from "@/components/wms/t_form_item_wms_house_cascader.vue";

import material_deposit from "@/wms/stock_center/material_deposit.vue";
import material_deduct from "@/wms/stock_center/material_deduct.vue";
import material_change from "@/wms/stock_center/material_change.vue";
import material_move from "@/wms/stock_center/material_move.vue";
import material_transfer from "@/wms/stock_center/material_transfer.vue";

const table_line_expanded_row_keys = ref([""]);

const onTableLineExpandChange = (value, params) => {
    table_line_expanded_row_keys.value = value;
};

const onTableLineExpandedViewTpl = (h, { row }) => (
    <div>
        <div class="more-detail">
            <p class="content">
                <b>【库龄告警】</b>
                {row.retentionNoticeTitle}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【库龄天数】</b>
                {row.retentionDays}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【告警人员】</b>
                {row.retentionNoticeEmployeeNos}&nbsp;&nbsp;&nbsp;
            </p>
        </div>
        <div class="more-detail">
            <p class="content">
                <b>【入库业务】</b>
                {row.depositEmployeeTitle}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【出库需入库业务人授权】</b>
                {row.deductNeedAuthTitle}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【同部门可出库】</b>
                {row.deductForDepartmentTitle}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【其他部门可出库】</b>
                {row.deductForOtherDepartmentTitle}
            </p>
        </div>
        <div class="more-detail">
            <p class="content">
                <b>【ID】</b>
                {row.id}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【物料编码】</b>
                {row.materialCode}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【入库操作】</b>
                {row.createAction}
            </p>
        </div>
    </div>
);

const table_columns = [
    {
        colKey: "houseTitle",
        title: "仓库信息",
        cell: (h, { row }) => {
            return (
                <span>
                    【中心】{row.centerTitle}
                    <p class="my_p_divider" />
                    【仓库】{row.houseTitle}
                    <p class="my_p_divider" />
                    【库位】{row.rackTitle}
                </span>
            );
        }
    },
    {
        colKey: "merchantTitle",
        title: "商户批次",
        cell: (h, { row }) => {
            return (
                <span>
                    【批次】<span style="font-weight:bold;">{row.batchId}</span>
                    <p class="my_p_divider" />
                    【商户】{row.merchantTitle}
                </span>
            );
        }
    },
    {
        colKey: "specMaterialId",
        title: "物料规格",
        cell: (h, { row }) => {
            return (
                <span>
                    【物料名称】{row.materialTitle}
                    <p class="my_p_divider" />
                    【规格编码】<span style="font-weight:bold;">{row.specMaterialCode}</span>
                    <p class="my_p_divider" />
                    【规格详情】{row.materialSpecTitle}
                </span>
            );
        }
    },
    {
        colKey: "stockNumRack",
        title: "库存(库存单位)",
        width: "150",
        cell: (h, { row }) => {
            return (
                <span>
                    【库位】{row.stockNumRack}
                    <p class="my_p_divider" />
                    【批次】{row.stockNumBatch}
                    <p class="my_p_divider" />
                    【单位】{row.stockUnitRatioTitle}
                </span>
            );
        }
    },
    {
        colKey: "stockNumCenterSpecMaterial",
        title: "库存(基本单位)",
        width: "150",
        cell: (h, { row }) => {
            return (
                <span>
                    【库位】{row.stockNumRackMaterialUnit}
                    <p class="my_p_divider" />
                    【批次】
                    <span style="font-weight:bold;">{row.stockNumBatchMaterialUnit}</span>
                    <p class="my_p_divider" />
                    【单位】{row.materialUnitTitle}
                </span>
            );
        }
    },
    {
        colKey: "stockNumCenterSpecMaterial",
        title: "库存统计(基本单位)",
        width: "150",
        cell: (h, { row }) => {
            return (
                <span>
                    【中心】{row.stockNumCenterSpecMaterial}
                    <p class="my_p_divider" />
                    【安全】
                    <span style="font-weight:bold;">{row.specMaterialSecureStockNum}</span>
                    <p class="my_p_divider" />
                    【单位】{row.materialUnitTitle}
                </span>
            );
        }
    },
    {
        colKey: "depositEmployeeTitle",
        title: "出库授权",
        width: "120",
        align: "center",
        cell: (h, { row }) => {
            if (row.deductNeedAuth == globalConstDef.yesOrNo.Yes) {
                return (
                    <span>
                        <span style="color:#5164d3;" onClick={() => onShowQrCodeDlg(row.batchId)}>
                            <QrcodeIcon size="2em" />
                        </span>
                        &nbsp;
                        <span style="color:#5164d3;">
                            <LockOnIcon size="2em" />
                        </span>
                    </span>
                );
            } else {
                return (
                    <span>
                        <span style="color:#5164d3;" onClick={() => onShowQrCodeDlg(row.batchId)}>
                            <QrcodeIcon size="2em" />
                        </span>
                    </span>
                );
            }
        }
    },
    { colKey: "remark", title: "备注信息", ellipsis: true, width: "150px" },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

function onShowDeduct(batchId) {
    if (!batchId) {
        MessagePlugin.error({
            ...message_plugin_config,
            content: "请求失败: 参数不能为空"
        });

        deduct_model.value = {
            batchId: null,
            visible: false
        };
    } else {
        deduct_model.value = {
            batchId: batchId,
            visible: true
        };
    }
}

const deduct_model = ref({
    visible: false,
    batchId: null
});

async function onShowDeposit(batchId) {
    if (!batchId) {
        deposit_model.value = {
            batchId: null,
            visible: true
        };
    } else {
        deposit_model.value = {
            batchId: batchId,
            visible: true
        };
    }
}

const deposit_model = ref({
    visible: false,
    batchId: null
});

async function onShowChange(rowV) {
    if (!rowV) {
        change_model.value = {
            row: {},
            visible: false
        };
    } else {
        change_model.value = {
            row: rowV,
            visible: true
        };
    }
}

const change_model = ref({
    visible: false,
    row: {}
});

async function onShowMove(rowV) {
    if (!rowV) {
        move_model.value = {
            row: {},
            visible: false
        };
    } else {
        move_model.value = {
            row: rowV,
            visible: true
        };
    }
}

const move_model = ref({
    visible: false,
    row: {}
});

async function onShowTransfer(rowV) {
    if (!rowV) {
        transfer_model.value = {
            row: {},
            visible: false
        };
    } else {
        transfer_model.value = {
            row: rowV,
            visible: true
        };
    }
}

const transfer_model = ref({
    visible: false,
    row: {}
});

const onTableLineMenuHandler = data => {
    if ("修改批次" === data.content) {
        onShowChange(data.value);
    } else if ("该批次出库" === data.content) {
        onShowDeduct(data.value.batchId);
    } else if ("同规格入库" === data.content) {
        onShowDeposit(data.value.batchId);
    } else if ("该批次调拨" === data.content) {
        onShowTransfer(data.value);
    } else if ("批次移库" === data.content) {
        onShowMove(data.value);
    } else {
    }
};

const form_query_data = ref({
    materialCode: null,
    storeCenterId: null,
    storeHouseId: null,
    batchId: null,
    merchantId: null,
    stockUnitRatioId: null,
    filterZero: globalConstDef.yesOrNo.Yes,
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
        "/api/biz/wms/stockCenter/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            materialCode: form_query_data.value.materialCode,
            storeCenterId: form_query_data.value.storeCenterId,
            storeHouseId: form_query_data.value.storeHouseId,
            batchId: form_query_data.value.batchId,
            merchantId: form_query_data.value.merchantId,
            stockUnitRatioId: form_query_data.value.stockUnitRatioId,
            filterZero: form_query_data.value.filterZero
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

const deduct_batch_model = ref({
    visible: false
});

function onShowDeductBatch(batchId) {
    onShowDeduct(batchId);
    deduct_batch_model.value.visible = false;
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
    <t-card :bordered="true" :style="{ margin: '5px' }" id="form_data">
        <div style="padding-top: 10px; padding-bottom: 10px">
            <t-form
                labelWidth="60px"
                label-align="right"
                :data="form_query_data"
                layout="inline"
                scroll-to-first-error="smooth"
                @submit="onQueryFormData(true)"
            >
                <t_form_item_house_center_list
                    label="仓库中心"
                    v-model="form_query_data.storeCenterId"
                    :showFilter="true"
                />
                <t_form_item_wms_house_cascader
                    label="仓库列表"
                    v-model="form_query_data.storeHouseId"
                    :checkStrictly="true"
                    :houseType="globalConstDef.wmsHouseType.MerchantPublic.toString()"
                    :centerId="form_query_data.storeCenterId"
                    :showFilter="true"
                />
                <form_stock_unit_ratio
                    label="库存单位"
                    v-model="form_query_data.stockUnitRatioId"
                    :showFilter="true"
                />
                <t_form_item_merchant
                    label="关联商户"
                    v-model="form_query_data.merchantId"
                    :showFilter="true"
                />
                <form_enum_list
                    label="过滤0库"
                    v-model="form_query_data.filterZero"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.yesOrNo"
                    :widthPx="160"
                />
                <t-form-item label="物料编码" name="物料编码">
                    <t-input v-model="form_query_data.materialCode" :clearable="true"></t-input>
                </t-form-item>
                <t-form-item label="批次号" name="批次号">
                    <t-input v-model="form_query_data.batchId" :clearable="true"></t-input>
                </t-form-item>
                <t-button theme="primary" type="submit">开始查询</t-button>
            </t-form>
        </div>
    </t-card>
    <t-card header-bordered :style="{ margin: '5px' }" id="table_data">
        <template #header>
            <div>
                <t-space>
                    <t-button theme="primary" variant="outline" @click="onShowDeposit(null)">
                        <template #icon><AddIcon /></template>
                        入库
                    </t-button>
                    <t-button
                        theme="primary"
                        variant="outline"
                        @click="deduct_batch_model.visible = true"
                    >
                        <template #icon><RemoveIcon /></template>
                        出库
                    </t-button>
                </t-space>
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
                        { content: '修改批次', value: row },
                        { content: '同规格入库', value: row },
                        { content: '该批次出库', value: row },
                        { content: '该批次调拨', value: row },
                        { content: '批次移库', value: row }
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
    <material_deduct v-model="deduct_model"></material_deduct>
    <material_deposit v-model="deposit_model"></material_deposit>
    <material_change v-model="change_model"></material_change>
    <material_move v-model="move_model"></material_move>
    <material_transfer v-model="transfer_model"></material_transfer>
    <dialog_question
        title="扫码出库"
        label="批次号"
        help="*必填"
        width="30%"
        v-model="deduct_batch_model"
        @change="onShowDeductBatch"
    >
    </dialog_question>
    <dialog_barcode_128
        header="入库批次"
        :visible="qrcode_show_model.visiable"
        :barcode="qrcode_show_model.code"
        @close="qrcode_show_model.visiable = false"
    />
</template>

<style scoped></style>
