<script setup lang="jsx">
import { ref, onMounted } from "vue";

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
import form_spec_material from "@/components/md/form_spec_material.vue";
import sc_purchase_supplier_list from "@/components/scm/purchase_supplier_list.vue";
import form_purchase_unit from "@/components/scm/form_purchase_unit.vue";
import sc_purchase_supplier_material_list from "@/components/scm/purchase_supplier_material_list.vue";

import enable_status_tag from "@/components/enable_status_tag.vue";

async function onSupplierChange(supplierType) {
    relation_submit_model.value.submitData.supplierType = supplierType;
    // console.log(relation_submit_model.value.submitData.supplierType);
}

const table_columns = [
    {
        colKey: "materialTitle",
        title: "物料信息",
        align: "center",
        children: [
            {
                colKey: "materialTitle",
                title: "基础信息",
                cell: (h, { row }) => {
                    return <span>{row.materialTitle}</span>;
                }
            },
            {
                colKey: "materialSpecItemTitle",
                title: "规格信息",
                cell: (h, { row }) => {
                    return <span>{row.materialSpecValueTxt}</span>;
                }
            }
        ]
    },
    {
        colKey: "supplierId",
        title: "供货信息",
        align: "center",
        children: [
            {
                colKey: "supplierId",
                title: "供货信息",
                cell: (h, { row }) => {
                    let jsx = [];
                    jsx.push(<span>【供应商】{row.supplierName}</span>);
                    jsx.push(<p class="my_p_divider" />);
                    jsx.push(<span>【供货编码】{row.supplyCode}</span>);

                    return jsx;
                }
            },
            {
                colKey: "supplyPrice",
                title: "￥销售单价",
                align: "right",
                width: 100,
                cell: (h, { row }) => {
                    let jsx = [];
                    if (row.supplyPrice) {
                        jsx.push(<span class="table_column_money">￥{row.supplyPrice}</span>);
                    }

                    return jsx;
                }
            }
        ]
    },
    {
        colKey: "purchasePrice",
        title: "采购单价",
        align: "right",
        width: 150,
        cell: (h, { row }) => {
            return (
                <span class="table_column_money">
                    ￥{row.purchasePrice} / {row.purchaseUnitTitle}
                </span>
            );
        }
    },
    {
        colKey: "prepareDays",
        title: "到货天数",
        align: "right",
        width: 100,
        cell: (h, { row }) => {
            return <span>{row.prepareDays} 天</span>;
        }
    },
    {
        colKey: "statusTitle",
        title: "状态",
        width: 115,
        cell: (h, { row }) => {
            return <enable_status_tag status={row.status} />;
        }
    },
    { colKey: "remark", title: "备注" },
    { colKey: "updateAction", title: "最后修改", width: 120 },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const table_line_expanded_row_keys = ref([""]);

const onTableLineExpandChange = (value, params) => {
    table_line_expanded_row_keys.value = value;
    // console.log("onTableLineExpandChange", value, params);
};

const onTableLineExpandedViewTpl = (h, { row }) => {
    var jsx = [];
    jsx.push(
        <p class="content">
            <b>【ID】</b>
            {row.id}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <b>【下单来源】</b>
            {row.triggerSourceStr}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <b>【创建操作】</b>
            {row.createAction}
        </p>
    );

    jsx.push(
        <p class="content">
            <b>【规格编码】</b> {row.specMaterialCode}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <b>【物料编码】</b> {row.materialCode}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </p>
    );

    return jsx;
};

const onTableLineMenuHandler = data => {
    if ("修改信息" === data.content) {
        onShowRelationEdit(data.value);
    } else {
    }
};

const relation_submit_model = ref({
    visible: false,
    addMode: true,
    submitData: {
        id: null,
        specMaterialId: null,
        materialUnitId: null,
        supplierId: null,
        supplierType: null,
        purchasePrice: null,
        purchaseUnitId: null,
        supplyCode: null,
        prepareDays: null,
        status: null,
        remark: null
    },
    rules: {}
});

async function onShowRelationAdd() {
    relation_submit_model.value.submitData = { status: globalConstDef.enableModel.Enabled };
    relation_submit_model.value.visible = true;
    relation_submit_model.value.addMode = true;
}

async function onShowRelationEdit(editId) {
    relation_submit_model.value.addMode = false;
    relation_submit_model.value.visible = true;
    axiosPostJson(
        "/api/biz/scm/purchaseRelation/oneById",
        {
            itemId: editId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                relation_submit_model.value.submitData = response.data.data;
            }
        }
    );
}
const onSubmitPoolData = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/scm/purchaseRelation/add";
        if (relation_submit_model.value.submitData.id > 0) {
            distUrl = "/api/biz/scm/purchaseRelation/change";
        }

        axiosPostJson(distUrl, relation_submit_model.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                relation_submit_model.value.visible = false;
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
    materialId: null,
    materialCode: null,
    supplierId: null,
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
        "/api/biz/scm/purchaseRelation/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            materialCode: form_query_data.value.materialCode,
            materialId: form_query_data.value.materialId,
            supplierId: form_query_data.value.supplierId,
            status: form_query_data.value.status
        },
        function (response) {
            LoadingPlugin(false);
            if (isAjaxRspSucc(response)) {
                ajaxPageDataParse(response.data.data, form_query_data);
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
    <t-card :bordered="true" :style="{ margin: '5px' }" id="form_data">
        <div style="padding-top: 10px; padding-bottom: 10px">
            <t-form
                label-align="right"
                labelWidth="60px"
                :data="form_query_data"
                layout="inline"
                scroll-to-first-error="smooth"
                @submit="onQueryFormData(true)"
            >
                <sc_purchase_supplier_list label="供应商" v-model="form_query_data.supplierId" />
                <form_spec_material
                    label="规格物料"
                    v-model="form_query_data.materialId"
                    :showFilter="true"
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
        </div></t-card
    >
    <t-card header-bordered :style="{ margin: '5px' }" id="data_table">
        <template #header>
            <div>
                <t-button theme="primary" variant="outline" @click="onShowRelationAdd()">
                    <template #icon><AddIcon /></template>
                    采购关系
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
                    :options="[{ content: '修改信息', value: row.id }]"
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
    <t-dialog
        id="relation_submit_model"
        v-model:visible="relation_submit_model.visible"
        header="采购关系"
        width="80%"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
    >
        <t-form
            :rules="relation_submit_model.rules"
            :data="relation_submit_model.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitPoolData"
        >
            <form_spec_material
                label="规格物料"
                help="(*必填，对应即将入库的规格物料)"
                v-model="relation_submit_model.submitData.specMaterialId"
                :disabled="!relation_submit_model.addMode"
                :labelType="1"
                :materialProduceType="globalConstDef.materialProduceType.PurchaseDirect.toString()"
                @change="
                    materialUnitId => {
                        relation_submit_model.submitData.materialUnitId = materialUnitId;
                    }
                "
            />
            <form_enum_radio_group
                label="是否启用"
                help="(*必填)"
                v-model="relation_submit_model.submitData.status"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="relation_submit_model.submitData.remark" />
            </t-form-item>
            <t-divider>采购配置</t-divider>
            <sc_purchase_supplier_list
                label="供应商"
                help="(*必填)"
                v-model="relation_submit_model.submitData.supplierId"
                @change="onSupplierChange"
                :disabled="!relation_submit_model.addMode"
            />
            <t-form-item
                label="供货编码"
                name="供货编码"
                help="供应商提供的供货编码，无供应编码则不填写"
                v-if="
                    relation_submit_model.submitData.supplierType ==
                    globalConstDef.scPurchaseSupplierType.External
                "
            >
                <t-input
                    placeholder="供货编码"
                    v-model="relation_submit_model.submitData.supplyCode"
                    :disabled="!relation_submit_model.addMode"
                />
            </t-form-item>
            <sc_purchase_supplier_material_list
                v-else
                label="供应商物料"
                help="(*必填,物料信息及规格均来自供应商，需要供应商先配置)"
                v-model="relation_submit_model.submitData.supplyCode"
                :disabled="!relation_submit_model.addMode"
                :supplierId="relation_submit_model.submitData.supplierId"
            />
            <form_purchase_unit
                label="采购单位"
                help="*必填"
                v-model="relation_submit_model.submitData.purchaseUnitId"
                :disabled="!relation_submit_model.addMode"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :supplier="relation_submit_model.submitData.supplierId"
                :materialUnitId="relation_submit_model.submitData.materialUnitId"
            />
            <t-form-item label="采购单价" name="采购单价" help="*必填，最高支持两位小数">
                <t-input
                    label="￥"
                    suffix="元"
                    type="number"
                    placeholder="采购单价"
                    v-model="relation_submit_model.submitData.purchasePrice"
                />
            </t-form-item>
            <t-form-item label="采购天数" name="采购天数" help="*必填，采购天数">
                <t-input
                    suffix="天"
                    type="number"
                    placeholder="采购到货最小所需天数"
                    v-model="relation_submit_model.submitData.prepareDays"
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
