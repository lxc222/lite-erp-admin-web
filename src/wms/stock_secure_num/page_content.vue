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
import form_stock_group_list from "@/components/wms/form_stock_group_list.vue";
import form_spec_material from "@/components/md/form_spec_material.vue";

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
        colKey: "batchGroupTitle",
        title: "批次分组",
        width: 150
    },
    {
        colKey: "specMaterialTitle",
        title: "物料信息"
    },
    {
        colKey: "secureNum",
        title: "安全库存",
        width: 150,
        align: "right",
        cell: (h, { row }) => {
            return <span>{row.secureNum} 基本单位</span>;
        }
    },
    {
        colKey: "stockNum",
        title: "当前库存",
        width: 150,
        align: "right",
        cell: (h, { row }) => {
            return <span>{row.stockNum} 基本单位</span>;
        }
    },
    { colKey: "noticeTypeTitle", title: "告警类型", align: "center", width: 115 },
    { colKey: "noticeEmployeeNos", title: "告警人员", width: 150 },
    {
        colKey: "statusTitle",
        title: "是否启用",
        width: 115,
        cell: (h, { row }) => {
            return <enable_status_tag status={row.status} />;
        }
    },
    { colKey: "remark", title: "备注", width: 120 },
    { colKey: "updateAction", title: "最后修改", width: 120 },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const notice_submit_data = ref({
    visible: false,
    addMode: false,
    submitData: {
        id: null,
        batchGroupId: null,
        specMaterialId: null,
        secureNum: null,
        noticeType: null,
        noticeEmployeeNos: null,
        status: null,
        remark: null
    }
});

async function onShowNoticeAddDlg() {
    notice_submit_data.value.submitData = {};
    notice_submit_data.value.visible = true;
    notice_submit_data.value.addMode = true;
}

async function onShowNoticeEditDlg(editId) {
    notice_submit_data.value.submitData = {};
    notice_submit_data.value.addMode = false;
    axiosPostJson(
        "/api/biz/wms/stockSecureNum/oneById",
        {
            itemId: editId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                notice_submit_data.value.submitData = response.data.data;
                notice_submit_data.value.visible = true;
            }
        }
    );
}

const onTableLineMenuHandler = data => {
    if ("修改信息" === data.content) {
        onShowNoticeEditDlg(data.value.id);
    }
};

const onSubmitUnitData = () => {
    let distUrl = "/api/biz/wms/stockSecureNum/add";
    if (notice_submit_data.value.submitData.id > 0) {
        distUrl = "/api/biz/wms/stockSecureNum/change";
    }

    axiosPostJsonBody(distUrl, notice_submit_data.value.submitData, function (response) {
        if (!isAjaxRspSucc(response)) {
            MessagePlugin.error({
                ...message_plugin_config,
                content: response.data.tipMsg
            });
        } else {
            notice_submit_data.value.visible = false;
            MessagePlugin.info({
                content: response.data.data,
                duration: 3000,
                closeBtn: true,
                placement: "center",
                onClose: function () {}
            });
        }
    });
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
        "/api/biz/wms/stockSecureNum/page",
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
                <t-button theme="primary" variant="outline" @click="onShowNoticeAddDlg()">
                    <template #icon><AddIcon /></template>
                    安全库存
                </t-button>
                <span style="font-style: italic"> 安全库存按照基本单位计算 </span>
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
        id="notice_submit_data"
        v-model:visible="notice_submit_data.visible"
        header="安全库存"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
        width="40%"
    >
        <t-form
            :rules="notice_submit_data.rules"
            :data="notice_submit_data.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitUnitData"
        >
            <form_stock_group_list
                label="批次分组"
                v-model="notice_submit_data.submitData.batchGroupId"
                help="*必填"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :disabled="!notice_submit_data.addMode"
            />
            <form_spec_material
                label="规格物料"
                help="*必填"
                v-model="notice_submit_data.submitData.specMaterialId"
                :disabled="!notice_submit_data.addMode"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :supplyOpen="globalConstDef.yesOrNo.Yes.toString()"
                :labelType="100"
            />
            <t-form-item label="安全库存" name="安全库存" help="*必填">
                <t-input
                    placeholder="安全库存"
                    type="number"
                    v-model="notice_submit_data.submitData.secureNum"
                    suffix="基本单位"
                />
            </t-form-item>
            <form_enum_radio_group
                label="告警类型"
                help="*必填"
                v-model="notice_submit_data.submitData.noticeType"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.wmsStockSecureNumNoticeType"
            />
            <t-form-item label="告警人员" name="告警人员" help="*必填, 多人请使用英文逗号分隔">
                <t-input
                    placeholder="告警人员"
                    v-model="notice_submit_data.submitData.noticeEmployeeNos"
                />
            </t-form-item>
            <form_enum_radio_group
                label="是否启用"
                help="*必填"
                v-model="notice_submit_data.submitData.status"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="notice_submit_data.submitData.remark" />
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
