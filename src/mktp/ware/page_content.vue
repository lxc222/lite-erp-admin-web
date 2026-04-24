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
import t_form_item_mkp_ware_catalog_cascader from "@/components/mktp/t_form_item_mkp_ware_catalog_cascader.vue";

import enable_status_tag from "@/components/enable_status_tag.vue";

const columns = ref([
    { colKey: "id", title: "#ID", width: 100 },
    { colKey: "title", title: "货品科目" },
    { colKey: "code", title: "货品编码" },
    { colKey: "categoryTitleComplete", title: "货品类目" },
    {
        colKey: "statusTitle",
        title: "状态",
        width: 115,
        cell: (h, { row }) => {
            return <enable_status_tag status={row.status} />;
        }
    },
    { colKey: "remark", title: "备注" },
    { colKey: "createAction", title: "创建操作" },
    { colKey: "updateAction", title: "最后修改" },
    { colKey: "refOperation", title: "关联操作", width: 120 }
]);

const ware_submit_data = ref({
    visible: false,
    addMode: false,
    submitData: {
        id: null,
        title: null,
        categoryId: null,
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
async function onShowWareAddDlg() {
    ware_submit_data.value.submitData = { status: globalConstDef.enableModel.Enabled };
    ware_submit_data.value.visible = true;
    ware_submit_data.value.addMode = true;
}

async function onShowWareEditDlg(editId) {
    ware_submit_data.value.submitData = {};
    ware_submit_data.value.addMode = false;
    axiosPostJson(
        "/api/biz/mktp/ware/oneById",
        {
            itemId: editId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                ware_submit_data.value.submitData = response.data.data;
                ware_submit_data.value.submitData.categoryId =
                    response.data.data.categoryId.toString();
                ware_submit_data.value.visible = true;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

const onTableLineMenuHandler = data => {
    if ("修改信息" === data.content) {
        onShowWareEditDlg(data.value);
    }
};

const onSubmitWareData = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/mktp/ware/add";
        if (ware_submit_data.value.submitData.id > 0) {
            distUrl = "/api/biz/mktp/ware/change";
        }

        axiosPostJsonBody(distUrl, ware_submit_data.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                ware_submit_data.value.visible = false;
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
    forceDirectChildren: true,
    categoryId: null,
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
        "/api/biz/mktp/ware/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            status: form_query_data.value.status,
            categoryId: form_query_data.value.categoryId,
            forceDirectChildren: form_query_data.value.forceDirectChildren
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
                    v-model="form_query_data.categoryId"
                    :checkStrictly="true"
                />
                <t-form-item label="检索范围" name="检索范围" class="form_select_short">
                    <t-select v-model="form_query_data.forceDirectChildren">
                        <t-option :key="true" label="直属货品" :value="true" />
                        <t-option :key="false" label="所有货品" :value="false" />
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
                <t-button theme="primary" variant="outline" @click="onShowWareAddDlg()">
                    <template #icon><AddIcon /></template>
                    入场货品
                </t-button>
            </div>
        </template>
        <t-table
            row-key="index"
            :data="form_query_data.pageData"
            :columns="columns"
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
                    :options="[{ content: '修改信息', value: row.id, divider: true }]"
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
        id="ware_submit_data"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
        v-model:visible="ware_submit_data.visible"
        header="货品信息"
    >
        <t-form
            :rules="ware_submit_data.rules"
            :data="ware_submit_data.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitWareData"
        >
            <t-form-item label="货品名称" name="货品名称" help="*必填">
                <t-input placeholder="货品名称" v-model="ware_submit_data.submitData.title" />
            </t-form-item>
            <t_form_item_mkp_ware_catalog_cascader
                label="货品类目"
                v-model="ware_submit_data.submitData.categoryId"
                :checkStrictly="true"
                help="*必填"
            />
            <form_enum_radio_group
                label="是否启用"
                v-model="ware_submit_data.submitData.status"
                help="*必填"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="ware_submit_data.submitData.remark" />
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
