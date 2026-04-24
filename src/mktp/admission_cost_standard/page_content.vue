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
import t_form_item_mkp_ware_unit from "@/components/mktp/t_form_item_mkp_ware_unit.vue";

import enable_status_tag from "@/components/enable_status_tag.vue";

const table_columns = [
    { colKey: "id", title: "#ID", width: 100 },
    {
        colKey: "title",
        title: "名称",
        cell: (h, { row }) => {
            return <span>{row.title}</span>;
        }
    },
    { colKey: "wareUnitTitle", title: "计费单位" },
    {
        colKey: "unitCost",
        title: "计费单价￥",
        align: "right",
        cell: (h, { row }) => {
            return <span class="table_column_money">￥{row.unitCost}</span>;
        }
    },
    { colKey: "costTypeTitle", title: "计费类型" },
    {
        colKey: "minUnitNum",
        title: "最小计量",
        align: "right",
        cell: (h, { row }) => {
            if (row.costType == globalConstDef.mktpAdmissionCostType.Time) {
                return <span></span>;
            } else {
                return (
                    <span>
                        {row.minUnitNum} {row.wareUnitTitle}
                    </span>
                );
            }
        }
    },
    {
        colKey: "maxUnitNum",
        title: "最大计量",
        align: "right",
        cell: (h, { row }) => {
            if (row.costType == globalConstDef.mktpAdmissionCostType.Time) {
                return <span></span>;
            } else {
                return (
                    <span>
                        {row.maxUnitNum} {row.wareUnitTitle}
                    </span>
                );
            }
        }
    },
    {
        colKey: "minCost",
        title: "最低收费￥",
        align: "right",
        cell: (h, { row }) => {
            if (row.costType == globalConstDef.mktpAdmissionCostType.Time) {
                return <span></span>;
            } else {
                return <span class="table_column_money">￥{row.minCost}</span>;
            }
        }
    },
    {
        colKey: "maxCost",
        title: "最高收费￥",
        align: "right",
        cell: (h, { row }) => {
            if (row.costType == globalConstDef.mktpAdmissionCostType.Time) {
                return <span></span>;
            } else {
                return <span class="table_column_money">￥{row.maxCost}</span>;
            }
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
    { colKey: "createAction", title: "创建操作" },
    { colKey: "updateAction", title: "最后修改" },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const entity_submit_data = ref({
    visible: false,
    addMode: false,
    ware_unit_list: [],
    submitData: {
        id: null,
        title: null,
        wareUnitId: null,
        unitCost: null,
        minUnitNum: null,
        maxUnitNum: null,
        minCost: null,
        maxCost: null,
        costType: null,
        status: null,
        type: null,
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
function onLoadWareUnitList() {
    entity_submit_data.value.ware_unit_list = [];
    axiosPostJsonBody(
        "/api/biz/mktp/wareUnit/list",
        {
            status: globalConstDef.enableModel.Enabled
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                entity_submit_data.value.ware_unit_list = response.data.data;
            }
        }
    );
}

function onShowEntityAddDlg() {
    entity_submit_data.value.submitData = { status: globalConstDef.enableModel.Enabled };
    entity_submit_data.value.visible = true;
    entity_submit_data.value.addMode = true;
}

function onShowEntityEditDlg(editId, type) {
    entity_submit_data.value.submitData = {};
    entity_submit_data.value.addMode = false;
    axiosPostJson(
        "/api/biz/mktp/admissionCostStandard/oneById",
        {
            itemId: editId,
            type: type
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                entity_submit_data.value.submitData = response.data.data;
                entity_submit_data.value.visible = true;
            }
        }
    );
}

const onTableLineMenuHandler = data => {
    if ("修改信息" === data.content) {
        onShowEntityEditDlg(data.value.id, data.value.type);
    }
};

const onSubmitEntityData = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/mktp/admissionCostStandard/add";
        if (entity_submit_data.value.submitData.id > 0) {
            distUrl = "/api/biz/mktp/admissionCostStandard/change";
        }

        axiosPostJsonBody(distUrl, entity_submit_data.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                entity_submit_data.value.visible = false;
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
        "/api/biz/mktp/admissionCostStandard/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
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
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );

    return false;
}

onMounted(async () => {
    onLoadWareUnitList();
});
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
                <t-form-item label="标准名称" name="标准名称">
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
    <t-card header-bordered :style="{ margin: '5px' }" id="data_table">
        <template #header>
            <div>
                <t-button theme="primary" variant="outline" @click="onShowEntityAddDlg()">
                    <template #icon><AddIcon /></template>
                    收费标准
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
    <t-dialog
        id="entity_submit_data"
        v-model:visible="entity_submit_data.visible"
        width="50%"
        header="收费标准"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
    >
        <t-form
            :rules="entity_submit_data.rules"
            :data="entity_submit_data.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitEntityData"
        >
            <t-form-item label="标准名称" name="标准名称" help="*必填">
                <t-input placeholder="标准名称" v-model="entity_submit_data.submitData.title" />
            </t-form-item>
            <t_form_item_mkp_ware_unit
                label="计费单位"
                v-model="entity_submit_data.submitData.wareUnitId"
                help="*必填"
            />
            <t-form-item label="计费单价" name="计费单价" help="*必填">
                <t-input
                    label="￥"
                    suffix="元"
                    type="number"
                    placeholder="精确到两位小数"
                    v-model="entity_submit_data.submitData.unitCost"
                />
            </t-form-item>
            <form_enum_radio_group
                label="计费类型"
                v-model="entity_submit_data.submitData.costType"
                help="*必填"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.mktpAdmissionCostType"
            />
            <t-form-item
                label="最小计量"
                name="最小计量"
                help="*必填，低于该量不计费(支持小商户)"
                v-show="
                    entity_submit_data.submitData.costType ==
                    globalConstDef.mktpAdmissionCostType.Quantity
                "
            >
                <t-input
                    placeholder="最小计量"
                    v-model="entity_submit_data.submitData.minUnitNum"
                />
            </t-form-item>
            <t-form-item
                label="最大计量"
                name="最大计量"
                help="*必填，多于该量的定位不计费(计量封顶)"
                v-show="
                    entity_submit_data.submitData.costType ==
                    globalConstDef.mktpAdmissionCostType.Quantity
                "
            >
                <t-input
                    placeholder="最大计量"
                    v-model="entity_submit_data.submitData.maxUnitNum"
                />
            </t-form-item>
            <t-form-item
                label="最低收费"
                name="最低收费"
                help="*必填，单次总最低收费(保底收费)"
                v-show="
                    entity_submit_data.submitData.costType ==
                    globalConstDef.mktpAdmissionCostType.Quantity
                "
            >
                <t-input
                    label="￥"
                    suffix="元"
                    type="number"
                    placeholder="精确到两位小数"
                    v-model="entity_submit_data.submitData.minCost"
                />
            </t-form-item>
            <t-form-item
                label="最高收费"
                name="最高收费"
                help="*必填，单次总最高收费(封底收费)"
                v-show="
                    entity_submit_data.submitData.costType ==
                    globalConstDef.mktpAdmissionCostType.Quantity
                "
            >
                <t-input
                    label="￥"
                    suffix="元"
                    type="number"
                    placeholder="精确到两位小数"
                    v-model="entity_submit_data.submitData.maxCost"
                />
            </t-form-item>
            <form_enum_radio_group
                label="是否启用"
                v-model="entity_submit_data.submitData.status"
                help="*必填"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="entity_submit_data.submitData.remark" />
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
