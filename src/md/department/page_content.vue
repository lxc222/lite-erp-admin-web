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

import table_with_pagination from "@/components/table_with_pagination.vue";
import form_enum_radio_group from "@/components/form_enum_radio_group.vue";
import enable_status_tag from "@/components/enable_status_tag.vue";
import t_form_item_employee from "@/components/md/t_form_item_employee.vue";
import t_form_item_department from "@/components/md/t_form_item_department.vue";

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
        colKey: "titleAbs",
        title: "部门全称",
        width: "350"
    },
    {
        colKey: "level",
        title: "部门层级",
        align: "right",
        width: "150",
        cell: (h, { row }) => {
            return <span>{row.level}级部门</span>;
        }
    },
    {
        colKey: "statusTitle",
        title: "当前状态",
        align: "center",
        width: "115",
        cell: (h, { row }) => {
            return <enable_status_tag status={row.status} />;
        }
    },
    { colKey: "supervisorName", title: "部门主管", align: "right" },
    { colKey: "remark", title: "备注" },
    { colKey: "updateAction", title: "最后修改" },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const department_submit_model = ref({
    visible: false,
    addMode: false,
    submitData: {
        id: null,
        parentId: null,
        title: null,
        supervisorId: null,
        status: null,
        remark: null
    },
    rules: {
        title: [{ required: true, message: "*必填", type: "warning" }],
        status: [{ required: true, message: "*必填", type: "warning" }]
    }
});

async function showDepartmentAdd() {
    department_submit_model.value.submitData = { parentId: -1 };
    department_submit_model.value.visible = true;
    department_submit_model.value.addMode = true;
}

async function showDepartmentEdit(editId) {
    department_submit_model.value.submitData = {};
    department_submit_model.value.addMode = false;
    axiosPostJson(
        "/api/biz/md/department/infoById",
        {
            itemId: editId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                department_submit_model.value.submitData = response.data.data;
                department_submit_model.value.visible = true;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

const onSubmitDepartment = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/md/department/add";
        if (department_submit_model.value.submitData.id > 0) {
            distUrl = "/api/biz/md/department/change";
        }

        axiosPostJsonBody(distUrl, department_submit_model.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                department_submit_model.value.visible = false;
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

async function showDepartmentNextAdd(parentId) {
    department_submit_model.value.submitData = {};
    department_submit_model.value.visible = true;
    department_submit_model.value.submitData.parentId = parentId;
}

const onTableLineMenuHandler = data => {
    if ("修改信息" === data.content) {
        showDepartmentEdit(data.value);
    } else if ("添加下级" === data.content) {
        showDepartmentNextAdd(data.value.id);
    }
};

const form_query_data = ref({
    parentId: null,
    status: null,
    level: null,
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
        "/api/biz/md/department/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            parentId: form_query_data.value.parentId,
            status: form_query_data.value.status,
            level: form_query_data.value.level
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
                <t_form_item_department
                    label="部门信息"
                    v-model="form_query_data.parentId"
                    :showFilter="true"
                />
                <t-form-item label="部门级别" name="部门级别" class="form_select_short">
                    <t-select v-model="form_query_data.level" :clearable="true">
                        <t-option
                            v-for="level in 5"
                            :key="level"
                            :label="`${level}级部门`"
                            :value="String(level)"
                        />
                    </t-select>
                </t-form-item>
                <t-form-item label="是否启用" name="是否启用" class="form_select_short">
                    <t-select v-model="form_query_data.status" :clearable="true">
                        <t-option
                            v-if="globalLoginData.commonData"
                            v-for="item in globalLoginData.commonData.enableModel"
                            :key="item.code"
                            :label="item.remark"
                            :value="item.code"
                        />
                    </t-select>
                </t-form-item>
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
                <t-button theme="primary" variant="outline" @click="showDepartmentAdd()">
                    <template #icon><AddIcon /></template>
                    部门
                </t-button>
            </div>
        </template>
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
    </table_with_pagination>
    <t-dialog
        id="department_submit_model"
        v-model:visible="department_submit_model.visible"
        header="部门信息"
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
            :rules="department_submit_model.rules"
            :data="department_submit_model.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitDepartment"
        >
            <t_form_item_department
                label="上级部门"
                help="*必填，上级部门"
                v-model="department_submit_model.submitData.parentId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :externalOption="[{ title: '一级部门(无上级)', id: -1 }]"
            />
            <t-form-item label="部门名称" name="部门名称" help="*必填，部门名称">
                <t-input
                    placeholder="部门名称"
                    v-model="department_submit_model.submitData.title"
                />
            </t-form-item>
            <t_form_item_employee
                label="部门负责人"
                help="*必填"
                v-model="department_submit_model.submitData.supervisorId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :externalOption="[{ title: '-- 继承上级部门配置 --', id: -1 }]"
            />
            <form_enum_radio_group
                label="状态"
                help="*必填"
                v-model="department_submit_model.submitData.status"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input
                    placeholder="备注信息"
                    v-model="department_submit_model.submitData.remark"
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
