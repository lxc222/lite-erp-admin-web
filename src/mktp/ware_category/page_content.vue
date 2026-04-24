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
import t_form_item_mkp_ware_catalog_list from "@/components/mktp/t_form_item_mkp_ware_catalog_list.vue";
import t_form_item_mkp_ware_catalog_cascader from "@/components/mktp/t_form_item_mkp_ware_catalog_cascader.vue";

import enable_status_tag from "@/components/enable_status_tag.vue";

const table_columns = [
    { colKey: "id", title: "#ID", width: 100 },
    { colKey: "title", title: "类目名称" },
    {
        colKey: "titleAbs",
        title: "类目全路径"
    },
    {
        colKey: "level",
        title: "类目层级",
        align: "right",
        cell: (h, { row }) => {
            return <span>第{row.level}级</span>;
        }
    },
    {
        colKey: "statusTitle",
        title: "是否启用",
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

const category_submit_data = ref({
    visible: false,
    addMode: false,
    submitData: {
        title: null,
        parentId: null,
        orderWeight: null,
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

async function onShowCategoryAdd() {
    category_submit_data.value.submitData = { status: globalConstDef.enableModel.Enabled };
    category_submit_data.value.visible = true;
    category_submit_data.value.addMode = true;
}

async function onShowCategoryEdit(editId) {
    category_submit_data.value.submitData = {};
    category_submit_data.value.addMode = false;
    axiosPostJson(
        "/api/biz/mktp/wareCategory/oneById",
        {
            itemId: editId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                category_submit_data.value.submitData = response.data.data;
                category_submit_data.value.visible = true;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

const onSubmitCategoryData = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/mktp/wareCategory/add";
        if (category_submit_data.value.submitData.id > 0) {
            distUrl = "/api/biz/mktp/wareCategory/change";
        }

        axiosPostJsonBody(distUrl, category_submit_data.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                category_submit_data.value.visible = false;
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

async function onShowCategoryNextAdd(parentId) {
    category_submit_data.value.submitData = { status: globalConstDef.enableModel.Enabled };
    category_submit_data.value.visible = true;
    category_submit_data.value.submitData.parentId = parentId;
}

const onTableLineMenuHandler = data => {
    if ("修改信息" === data.content) {
        onShowCategoryEdit(data.value);
    } else if ("添加下级" === data.content) {
        onShowCategoryNextAdd(data.value.id);
    }
};

const form_query_data = ref({
    title: null,
    status: null,
    level: null,
    parentId: null,
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
        "/api/biz/mktp/wareCategory/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            status: form_query_data.value.status,
            parentId: form_query_data.value.parentId,
            level: form_query_data.value.level,
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
                <t_form_item_mkp_ware_catalog_cascader
                    label="货品类目"
                    v-model="form_query_data.parentId"
                    :checkStrictly="true"
                />
                <t-form-item label="类目级别" name="类目级别" class="form_select_short">
                    <t-select v-model="form_query_data.level" :clearable="true">
                        <t-option key="1" label="1级" value="1" />
                        <t-option key="2" label="2级" value="2" />
                        <t-option key="3" label="3级" value="3" />
                        <t-option key="4" label="4级" value="4" />
                        <t-option key="5" label="5级" value="5" />
                    </t-select>
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
                <t-button theme="primary" variant="outline" @click="onShowCategoryAdd()">
                    <template #icon><AddIcon /></template>
                    货品类目
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
                    :options="[
                        { content: '修改信息', value: row.id, divider: true },
                        { content: '添加下级', value: row }
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
    <t-dialog
        id="category_submit_data"
        v-model:visible="category_submit_data.visible"
        header="类目信息"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
    >
        <t-form
            :rules="category_submit_data.rules"
            :data="category_submit_data.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitCategoryData"
        >
            <t_form_item_mkp_ware_catalog_list
                label="上级类目"
                v-model="category_submit_data.submitData.parentId"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <t-form-item label="类目名称" name="类目名称" help="*必填">
                <t-input placeholder="类目名称" v-model="category_submit_data.submitData.title" />
            </t-form-item>
            <t-form-item label="展示权重" name="展示权重" help="不填写则默认现有数据最低权重">
                <t-input
                    placeholder="展示权重"
                    v-model="category_submit_data.submitData.orderWeight"
                />
            </t-form-item>
            <form_enum_radio_group
                label="是否启用"
                v-model="category_submit_data.submitData.status"
                help="*必填"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="category_submit_data.submitData.remark" />
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
