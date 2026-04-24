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
import table_with_pagination from "@/components/table_with_pagination.vue";
import form_enum_list from "@/components/form_enum_list.vue";
import form_enum_radio_group from "@/components/form_enum_radio_group.vue";
import enable_status_tag from "@/components/enable_status_tag.vue";

const table_columns = [
    { colKey: "id", title: "#ID" },
    { colKey: "title", title: "单位名称" },
    {
        colKey: "statusTitle",
        title: "是否启用",
        cell: (h, { row }) => {
            return <enable_status_tag status={row.status} />;
        }
    },
    { colKey: "remark", title: "备注" },
    { colKey: "createAction", title: "创建操作" },
    { colKey: "updateAction", title: "最后修改" },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const unit_submit_model = ref({
    visible: false,
    addMode: false,
    submitData: {
        id: null,
        title: null,
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

async function onShowUnitAdd() {
    unit_submit_model.value.submitData = {};
    unit_submit_model.value.visible = true;
    unit_submit_model.value.addMode = true;
}

async function onShowUnitEdit(editId) {
    unit_submit_model.value.submitData = {};
    unit_submit_model.value.addMode = false;
    axiosPostJson(
        "/api/biz/o2o/wareUnit/oneById",
        {
            itemId: editId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                unit_submit_model.value.submitData = response.data.data;
                unit_submit_model.value.visible = true;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

const ononTableLineMenuHandler = data => {
    if ("修改信息" === data.content) {
        onShowUnitEdit(data.value);
    }
};

const onSubmitUnit = () => {
    let distUrl = "/api/biz/o2o/wareUnit/add";
    if (unit_submit_model.value.submitData.id > 0) {
        distUrl = "/api/biz/o2o/wareUnit/change";
    }

    axiosPostJsonBody(distUrl, unit_submit_model.value.submitData, function (response) {
        if (!isAjaxRspSucc(response)) {
            MessagePlugin.error({
                ...message_plugin_config,
                content: response.data.tipMsg
            });
        } else {
            unit_submit_model.value.visible = false;
            MessagePlugin.info({
                ...message_plugin_config,
                content: response.data.data
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
        "/api/biz/o2o/wareUnit/page",
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
                    label="启用状态"
                    v-model="form_query_data.status"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.enableModel"
                    :widthPx="160"
                />
                <t-button theme="primary" type="submit">开始查询</t-button>
            </t-form>
        </div>
    </t-card>
    <table_with_pagination
        :data="form_query_data.pageData"
        :columns="table_columns"
        :pagination="form_query_data.page"
        rowKey="id"
        @pageChange="onQueryFormData(false)"
        @pageSizeChange="onQueryFormData(false)"
    >
        <template #headerActions>
            <div>
                <t-button theme="primary" variant="outline" @click="onShowUnitAdd()">
                    <template #icon><AddIcon /></template>
                    单位
                </t-button>
            </div>
        </template>
        <template #refOperation="{ row }">
            <t-dropdown
                :options="[{ content: '修改信息', value: row.id, divider: true }]"
                @click="ononTableLineMenuHandler"
            >
                <t-button theme="success" shape="round">
                    更多&nbsp;
                    <span><i class="icon-chevron-down"></i></span>
                </t-button>
            </t-dropdown>
        </template>
    </table_with_pagination>
    <t-dialog
        id="unit_submit_model"
        :closeBtn="true"
        :cancelBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
        v-model:visible="unit_submit_model.visible"
        header="货品单位"
        @confirm="onSubmitUnit"
    >
        <t-form
            :rules="unit_submit_model.rules"
            :data="unit_submit_model.submitData"
            requiredMarkPosition="right"
        >
            <t-form-item label="货品单位" name="货品单位" help="*必选，货品单位">
                <t-input placeholder="货品单位" v-model="unit_submit_model.submitData.title" />
            </t-form-item>
            <form_enum_radio_group
                label="状态"
                help="*必选"
                v-model="unit_submit_model.submitData.status"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="unit_submit_model.submitData.remark" />
            </t-form-item>
        </t-form>
    </t-dialog>
</template>

<style scoped></style>
