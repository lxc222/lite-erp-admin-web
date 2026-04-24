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
import { getOneWmsStockGroup } from "@/assets/asset_biz_wms_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

import table_with_pagination from "@/components/table_with_pagination.vue";
import form_enum_list from "@/components/form_enum_list.vue";
import form_enum_radio_group from "@/components/form_enum_radio_group.vue";
import t_form_item_employee from "@/components/md/t_form_item_employee.vue";

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
    { colKey: "title", title: "分组名称" },
    { colKey: "dudectDualAuthEmployeeTitle", title: "二次审核人" },
    {
        colKey: "status",
        title: "是否启用",
        cell: (h, { row }) => {
            return <enable_status_tag status={row.status} />;
        }
    },
    { colKey: "remark", title: "备注" },
    { colKey: "updateAction", title: "最后修改" },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const group_submit_data = ref({
    visible: false,
    addMode: false,
    submitData: {
        id: null,
        title: null,
        dudectDualAuthEmployeeId: null,
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

async function onGroupAddDlg() {
    group_submit_data.value.submitData = {};
    group_submit_data.value.visible = true;
    group_submit_data.value.addMode = true;
}

async function onGroupEditDlg(editId) {
    group_submit_data.value.submitData = {};
    group_submit_data.value.addMode = false;

    getOneWmsStockGroup(
        editId,
        response => {
            group_submit_data.value.submitData = response.data;
            group_submit_data.value.visible = true;
        },
        response => {}
    );
}

const onTableLineMenuHandler = data => {
    if ("修改信息" === data.content) {
        onGroupEditDlg(data.value.id);
    }
};

const onSubmitUnitData = () => {
    let distUrl = "/api/biz/wms/stockBatchGroup/add";
    if (group_submit_data.value.submitData.id > 0) {
        distUrl = "/api/biz/wms/stockBatchGroup/change";
    }

    axiosPostJsonBody(distUrl, group_submit_data.value.submitData, function (response) {
        if (!isAjaxRspSucc(response)) {
            MessagePlugin.error({
                ...message_plugin_config,
                content: response.data.tipMsg
            });
        } else {
            group_submit_data.value.visible = false;
            MessagePlugin.info({
                ...message_plugin_config,
                content: response.data.data
            });
        }
    });
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
        "/api/biz/wms/stockBatchGroup/page",
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

onMounted(async () => {
    onQueryFormData(true);
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
                <t-form-item label="分组名称" name="分组名称">
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
                <t-button theme="primary" variant="outline" @click="onGroupAddDlg()">
                    <template #icon><AddIcon /></template>
                    批次分组
                </t-button>
                <span style="font-style: italic"> 分组用于设置库龄及安全库存告警 </span>
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
    <t-drawer
        id="group_submit_data"
        v-model:visible="group_submit_data.visible"
        @confirm="onSubmitUnitData"
        size="40%"
        placement="right"
        :closeBtn="true"
        :cancelBtn="null"
        confirmBtn="提交"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
    >
        <template #header>批次分组</template>
        <t-form
            :rules="group_submit_data.rules"
            :data="group_submit_data.submitData"
            requiredMarkPosition="right"
        >
            <t-form-item label="分组名称" name="分组名称" help="*必填">
                <t-input placeholder="分组名称" v-model="group_submit_data.submitData.title" />
            </t-form-item>
            <t_form_item_employee
                label="强制二次审核人"
                help="*必填, 分组下所有批次出库操作需要二次审核，仅展示拥有账号的人员"
                v-model="group_submit_data.submitData.dudectDualAuthEmployeeId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :hasAccount="globalConstDef.yesOrNo.Yes.toString()"
                :externalOption="[{ id: -1, title: '### 无需二次强制审核 ###' }]"
            />
            <form_enum_radio_group
                label="是否启用"
                help="*必填"
                v-model="group_submit_data.submitData.status"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="group_submit_data.submitData.remark" />
            </t-form-item>
        </t-form>
    </t-drawer>
</template>

<style scoped></style>
