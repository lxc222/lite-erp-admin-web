<script setup lang="jsx">
import { ref, onMounted } from "vue";

const thisModel = defineModel();

import { MessagePlugin, LoadingPlugin } from "tdesign-vue-next";
import { AddIcon } from "tdesign-icons-vue-next";

import {
    ajaxPageDataParse,
    axiosPostJson,
    axiosPostJsonBody,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";
import { message_plugin_config } from "@/assets/asset_biz_base_20251024.js";

import form_enum_list from "@/components/form_enum_list.vue";
import form_enum_radio_group from "@/components/form_enum_radio_group.vue";
import table_with_pagination from "@/components/table_with_pagination.vue";
import form_spec_material from "@/components/md/form_spec_material.vue";
import t_form_item_sale_customer from "@/components/scm/t_form_item_sale_customer.vue";
import t_form_item_sale_unit from "@/components/scm/t_form_item_sale_unit.vue";

import enable_status_tag from "@/components/enable_status_tag.vue";

const table_columns = [
    {
        colKey: "customerId",
        title: "采购客户",
        width: "200",
        cell: (h, { row }) => {
            let jsx = [];
            jsx.push(
                <span>
                    {row.customerName} {row.customerPhone}
                </span>
            );
            jsx.push(<p class="my_p_divider" />);
            jsx.push(<enable_status_tag status={row.status} />);

            return jsx;
        }
    },
    {
        colKey: "materialTitle",
        title: "物料信息",
        align: "left",
        width: 250,
        cell: (h, { row }) => {
            let jsx = [];
            jsx.push(<span>【物料名称】{row.materialTitle}</span>);
            jsx.push(<p class="my_p_divider" />);
            jsx.push(
                <span>
                    【规格编码】<span style="font-weight:bold">{row.specMaterialCode}</span>
                </span>
            );
            return jsx;
        }
    },
    {
        colKey: "supplyInfo",
        title: "销售信息",
        align: "center",
        children: [
            {
                colKey: "saleCode",
                title: "编码价格",
                width: 250,
                cell: (h, { row }) => {
                    return (
                        <span>
                            【编码】<span style="font-weight:bold">{row.saleCode}</span>
                            <p class="my_p_divider" />
                            【单价】<span class="table_column_money">￥{row.salePrice}</span>
                            <p class="my_p_divider" />
                            【单位】{row.saleUnitTitle}
                        </span>
                    );
                }
            },
            {
                colKey: "minUnitNum",
                title: "数量限制",
                align: "left",
                cell: (h, { row }) => {
                    return (
                        <span>
                            【最少】{row.minUnitNumTitle}
                            <p class="my_p_divider" />
                            【最多】{row.maxUnitNumTitle}
                        </span>
                    );
                }
            }
        ]
    },
    { colKey: "minPrepareDayTitle", title: "备货周期(天)", width: 120 },
    { colKey: "remark", title: "备注", width: 120 },
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
            <b>【建议价格】</b> ￥{row.salePriceSuggest} / {row.saleUnitTitle}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <b>【规格详情】</b> {row.specDetailTitle}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <b>【物料外供】</b> {row.supplyOpenStr}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <b>【物料编码】</b> {row.materialCode}
        </p>
    );

    jsx.push(
        <p class="content">
            <b>【ID】</b>
            {row.id}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            {row.triggerSourceStr}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <b>【创建操作】</b>
            {row.createAction}
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
    addMode: true,
    visible: false,
    submitData: {
        id: null,
        specMaterialId: null,
        customerId: null,
        salePrice: null,
        saleUnitId: null,
        materialUnitId: null,
        minPrepareDay: null,
        minUnitNum: null,
        maxUnitNum: null,
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
        "/api/biz/scm/saleRelation/oneById",
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
const onSubmitRelation = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/scm/saleRelation/add";
        if (relation_submit_model.value.submitData.id > 0) {
            distUrl = "/api/biz/scm/saleRelation/change";
        }

        axiosPostJsonBody(distUrl, relation_submit_model.value.submitData, function (response) {
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
    specMaterialId: null,
    materialCode: null,
    customerId: null,
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
        "/api/biz/scm/saleRelation/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            materialCode: form_query_data.value.materialCode,
            specMaterialId: form_query_data.value.specMaterialId,
            customerId: form_query_data.value.customerId,
            status: form_query_data.value.status
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
                MessagePlugin.info({
                    content: response.data.tipMsg,
                    duration: 2000,
                    closeBtn: true,
                    placement: "center",
                    onClose: function () {}
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
                <form_spec_material
                    label="销售物料"
                    v-model="form_query_data.specMaterialId"
                    :supplyOpen="globalConstDef.yesOrNo.Yes.toString()"
                />
                <t_form_item_sale_customer label="客户列表" v-model="form_query_data.customerId" />
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
                <t-button theme="primary" variant="outline" @click="onShowRelationAdd()">
                    <template #icon><AddIcon /></template>
                    供货关系
                </t-button>
            </div>
        </template>
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
    </table_with_pagination>
    <t-dialog
        id="relation_submit_model"
        v-model:visible="relation_submit_model.visible"
        header="供货关系"
        width="70%"
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
            @submit="onSubmitRelation"
        >
            <t_form_item_sale_customer
                label="采购客户"
                help="*必填"
                v-model="relation_submit_model.submitData.customerId"
                :disabled="!relation_submit_model.addMode"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <form_spec_material
                label="规格物料"
                help="*必填"
                v-model="relation_submit_model.submitData.specMaterialId"
                :disabled="!relation_submit_model.addMode"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :supplyOpen="globalConstDef.yesOrNo.Yes.toString()"
                :labelType="2"
                @change="
                    materialUnitId => {
                        relation_submit_model.submitData.materialUnitId = materialUnitId;
                    }
                "
            />
            <t_form_item_sale_unit
                label="销售单位"
                help="*必填"
                v-model="relation_submit_model.submitData.saleUnitId"
                :disabled="!relation_submit_model.addMode"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :materialUnitId="relation_submit_model.submitData.materialUnitId"
            />
            <t-form-item label="备货周期" name="备货周期" help="选填，无备货周期时请填写0">
                <t-input
                    placeholder="最大订货单位数量"
                    type="number"
                    suffix="天"
                    v-model="relation_submit_model.submitData.minPrepareDay"
                />
            </t-form-item>
            <t-form-item label="最小订货" name="最小订货" help="选填，不填或填0则不限制">
                <t-input
                    placeholder="最小订货单位数量"
                    type="number"
                    v-model="relation_submit_model.submitData.minUnitNum"
                />
            </t-form-item>
            <t-form-item label="最大订货" name="最大订货" help="选填，不填或填0则不限制">
                <t-input
                    placeholder="最大订货单位数量"
                    type="number"
                    v-model="relation_submit_model.submitData.maxUnitNum"
                />
            </t-form-item>
            <form_enum_radio_group
                label="是否启用"
                help="*必填"
                v-model="relation_submit_model.submitData.status"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.enableModel"
            />
            <t-form-item label="销售单价" name="销售单价" help="*必填，(最高支持两位小数)">
                <t-input
                    label="￥"
                    suffix="元"
                    type="number"
                    placeholder="供货价"
                    v-model="relation_submit_model.submitData.salePrice"
                />
            </t-form-item>
            <t-form-item label="备注信息" name="备注信息" help="选填">
                <t-input placeholder="备注信息" v-model="relation_submit_model.submitData.remark" />
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

<style scoped>
.switch-status {
    padding: 3px;
}
.switch-status span {
    font-size: 12px;
}
</style>
