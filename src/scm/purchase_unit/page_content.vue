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
        colKey: "titleShow",
        title: "业务展示名"
    },
    {
        colKey: "title",
        title: "单位名称",
        cell: (h, { row }) => {
            return <span>{row.title}</span>;
        }
    },
    {
        colKey: "unitTypeTitle",
        title: "单位类型",
        cell: (h, { row }) => {
            let jsx = [];

            jsx.push(<span>【类型】{row.unitTypeTitle}</span>);
            jsx.push(<p class="my_p_divider" />);
            if (row.unitType == globalConstDef.scPurchaseUnitType.Supplier) {
                for (let i = 0; i < row.supplierTitles.length; i++) {
                    if (i == 0) {
                        jsx.push(<p />);
                        jsx.push(<span>【限定】{row.supplierTitles[i]}</span>);
                    } else {
                        jsx.push(<p />);
                        jsx.push(<span>　　　　{row.supplierTitles[i]}</span>);
                    }
                }
            } else {
                jsx.push(<p />);
                jsx.push(<span>【限定】不限定</span>);
            }

            return jsx;
        }
    },
    {
        colKey: "convertRate",
        title: "采购单位 => 库存单位",
        cell: (h, { row }) => {
            return (
                <span>
                    {row.title} = {row.convertRate} * {row.stockUnitTitle}
                </span>
            );
        }
    },
    {
        colKey: "convertRate",
        title: "采购单位 => 基本单位",
        cell: (h, { row }) => {
            return (
                <span>
                    {row.title} = {row.convertRate} * {row.convertRate2MaterialUnit} =
                    {row.convertRate * row.convertRate2MaterialUnit} * {row.materialUnitTitle}
                </span>
            );
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

const unit_submit_data = ref({
    visible: false,
    addMode: false,
    submitData: {
        id: null,
        title: null,
        unitType: null,
        supplierIds: null,
        stockUnitId: null,
        convertRate: null,
        status: null,
        remark: null
    },
    rules: {
        title: [
            { required: true, message: "名称*必填", type: "error", trigger: "blur" },
            {
                required: true,
                message: "名称*必填",
                type: "error",
                trigger: "change"
            }
        ]
    }
});

async function onShowUnitAddDlg() {
    unit_submit_data.value.submitData = {
        unitType: globalConstDef.scPurchaseUnitType.Common,
        supplierIds: [],
        status: globalConstDef.enableModel.Enabled
    };

    unit_submit_data.value.visible = true;
    unit_submit_data.value.addMode = true;
}

async function onShowUnitEditDlg(editId) {
    unit_submit_data.value.submitData = {};
    unit_submit_data.value.addMode = false;
    axiosPostJson(
        "/api/biz/scm/purchaseUnit/oneById",
        {
            itemId: editId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                unit_submit_data.value.submitData = response.data.data;
                unit_submit_data.value.visible = true;
            }
        }
    );
}

const onTableLineMenuHandler = data => {
    if ("修改信息" === data.content) {
        onShowUnitEditDlg(data.value.id);
    }
};

const submitUnitData = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/scm/purchaseUnit/add";
        if (unit_submit_data.value.submitData.id > 0) {
            distUrl = "/api/biz/scm/purchaseUnit/change";
        }

        axiosPostJsonBody(distUrl, unit_submit_data.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                unit_submit_data.value.visible = false;
                MessagePlugin.info({
                    content: response.data.data,
                    duration: 3000,
                    closeBtn: true,
                    placement: "center",
                    onClose: function () {}
                });
            }
        });
    } else {
        // console.log("Validate Errors: ", firstError, validateResult);
        MessagePlugin.error(firstError);
    }
};

const form_query_data = ref({
    title: null,
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
        "/api/biz/scm/purchaseUnit/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            status: form_query_data.value.status,
            title: form_query_data.value.title
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
                <t-form-item label="单位名称" name="单位名称">
                    <t-input v-model="form_query_data.title" :clearable="true"></t-input>
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
                <t-button theme="primary" variant="outline" @click="onShowUnitAddDlg()">
                    <template #icon><AddIcon /></template>
                    采购单位
                </t-button>
            </div>
        </template>
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
    </table_with_pagination>
    <t-dialog
        id="unit_submit_data"
        v-model:visible="unit_submit_data.visible"
        header="单位信息"
        width="40%"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
    >
        <t-form
            :rules="unit_submit_data.rules"
            :data="unit_submit_data.submitData"
            requiredMarkPosition="right"
            @submit="submitUnitData"
        >
            <t-form-item label="单位名称" name="单位名称" help="*必填">
                <t-input placeholder="单位名称" v-model="unit_submit_data.submitData.title" />
            </t-form-item>
            <form_enum_radio_group
                label="单位类型"
                help="*必填"
                v-model="unit_submit_data.submitData.unitType"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.scPurchaseUnitType"
            />
            <sc_purchase_supplier_check_group
                label="可用供应商"
                v-model="unit_submit_data.submitData.supplierIds"
                :status="globalConstDef.scPurchaseSupplierStatus.Corporate.toString()"
                v-show="
                    unit_submit_data.submitData.unitType ==
                    globalConstDef.scPurchaseUnitType.Supplier
                "
            />
            <form_enum_radio_group
                label="是否启用"
                help="*必填"
                v-model="unit_submit_data.submitData.status"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="unit_submit_data.submitData.remark" />
            </t-form-item>
            <t-divider> 单位换算 </t-divider>
            <form_stock_unit_ratio
                label="库存单位"
                help="*必填"
                v-model="unit_submit_data.submitData.stockUnitId"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <t-form-item label="转换比率" name="转换比率" help="*必填">
                <t-input
                    label="1采购单位"
                    suffix="库存单位"
                    placeholder="1单位采购兑换x库存单位"
                    type="number"
                    v-model="unit_submit_data.submitData.convertRate"
                />
            </t-form-item>
            <t-form-item>
                <t-space size="small">
                    <t-button theme="default" variant="base" type="reset">重置</t-button>
                    <t-button theme="primary" type="submit">提交</t-button>
                </t-space>
            </t-form-item>
        </t-form>
    </t-dialog>
</template>

<style scoped></style>
