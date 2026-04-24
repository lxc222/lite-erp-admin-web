<script setup lang="jsx">
import { onMounted, ref } from "vue";

const thisModel = defineModel();

import { AddIcon, CheckCircleIcon, CloseCircleIcon } from "tdesign-icons-vue-next";
import { MessagePlugin, LoadingPlugin } from "tdesign-vue-next";

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
import t_form_item_position_check_group from "@/components/md/t_form_item_position_check_group.vue";

const department_list_query = ref([]);

async function onLoadDepartmentQuery() {
    department_list_query.value = [];
    let filterStatus = null;

    if (form_query_data.value.departmentFlterType == 1) {
        filterStatus = null;
    } else if (form_query_data.value.departmentFlterType == 2) {
        filterStatus = globalConstDef.enableModel.Enabled;
    } else {
        filterStatus = globalConstDef.enableModel.Disabled;
    }

    axiosPostJsonBody(
        "/api/biz/md/department/list",
        {
            status: filterStatus
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                department_list_query.value = response.data.data;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

const department_list_submit = ref([]);
async function onLoadDepartmentSubmit() {
    department_list_submit.value = [];

    axiosPostJsonBody(
        "/api/biz/md/department/list",
        {
            status: globalConstDef.enableModel.Enabled
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                department_list_submit.value = response.data.data;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

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
        colKey: "title",
        title: "姓名#编号",
        width: "200",
        cell: (h, { row }) => {
            let jsx = [];
            jsx.push(<span>【姓名】{row.title}</span>);
            jsx.push(<p class="my_p_divider" />);
            jsx.push(<span>【工号】{row.employeeNo}</span>);
            jsx.push(<p class="my_p_divider" />);

            if (row.status == globalConstDef.employeeStatus.Work) {
                jsx.push(
                    <t-tag theme="primary" shape="round" size="medium" variant="light-outline">
                        {<CheckCircleIcon />}
                        {row.statusTitle}&nbsp;
                    </t-tag>
                );
            } else {
                jsx.push(
                    <t-tag theme="success" shape="round" size="medium" variant="light-outline">
                        {<CloseCircleIcon />}
                        {row.statusTitle}&nbsp;
                    </t-tag>
                );
            }

            return jsx;
        }
    },
    {
        colKey: "phone",
        title: "联系方式",
        cell: (h, { row }) => {
            return (
                <span>
                    【电话】{row.phone}
                    <p class="my_p_divider" />
                    【邮件】{row.email}
                    <p class="my_p_divider" />
                    【地址】{row.address}
                </span>
            );
        }
    },
    {
        colKey: "positionTitles",
        title: "关联岗位",
        cell: (h, { row }) => {
            let jsx = [];
            for (let i = 0; i < row.positionTitles.length; i++) {
                jsx.push(
                    <span>
                        <p style="height: 2px;" />
                    </span>
                );
                jsx.push(
                    <span>
                        <t-typography-text code>{row.positionTitles[i]}</t-typography-text>
                    </span>
                );
            }

            return jsx;
        }
    },
    { colKey: "departmentTitle", title: "归属部门" },
    { colKey: "remark", title: "备注", width: 150 },
    { colKey: "updateAction", title: "最后修改", width: 150 },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const employee_submit_data = ref({
    addMode: false,
    visible: false,
    submitData: {
        id: null,
        title: null,
        phone: null,
        email: null,
        address: null,
        employeeNo: null,
        positionIds: null,
        remark: null,
        status: null,
        departmentId: null
    },
    rules: {
        title: [
            { required: true, message: "姓名*必填", type: "error", trigger: "blur" },
            { required: true, message: "姓名*必填", type: "error", trigger: "change" }
        ]
    }
});

async function showEmployeeAdd() {
    employee_submit_data.value.submitData = { positionIds: [] };
    employee_submit_data.value.visible = true;
    employee_submit_data.value.addMode = true;
}

async function showEmployeeEdit(editId) {
    axiosPostJson(
        "/api/biz/md/employee/infoById",
        {
            employeeId: editId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                employee_submit_data.value.submitData = response.data.data;
                employee_submit_data.value.visible = true;
                employee_submit_data.value.addMode = false;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

const onSubmitEmployee = () => {
    axiosPostJsonBody(
        "/api/biz/md/employee/save",
        employee_submit_data.value.submitData,
        function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                employee_submit_data.value.visible = false;
                MessagePlugin.info({
                    content: response.data.data,
                    duration: 3000,
                    closeBtn: true,
                    placement: "center",
                    onClose: function () {}
                });
            }
        }
    );
};

const form_query_data = ref({
    departmentFlterType: "1",
    departmentId: null,
    employeeNo: null,
    phone: null,
    status: null,
    directOrAll: "100",
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
        "/api/biz/md/employee/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            phone: form_query_data.value.phone,
            status: form_query_data.value.status,
            employeeNo: form_query_data.value.employeeNo,
            departmentId: form_query_data.value.departmentId,
            directOrAll: form_query_data.value.directOrAll
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
    onLoadDepartmentQuery();
    onLoadDepartmentSubmit();
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
                <t-form-item label="部门信息" name="部门信息">
                    <t-select
                        style="width: 160px"
                        v-model="form_query_data.departmentFlterType"
                        :clearable="true"
                        @change="onLoadDepartmentQuery"
                    >
                        <t-option key="所有" label="所有" value="1" />
                        <t-option key="仅启用" label="仅启用" value="2" />
                        <t-option key="未启用" label="未启用" value="3" />
                    </t-select>
                    <t-select v-model="form_query_data.departmentId" :clearable="true">
                        <t-option
                            v-for="item in department_list_query"
                            :key="item.id"
                            :label="item.titleAbs"
                            :value="item.id"
                        />
                    </t-select>
                </t-form-item>
                <t-form-item label="人员工号" name="人员工号">
                    <t-input v-model="form_query_data.employeeNo" :clearable="true"></t-input>
                </t-form-item>
                <t-form-item label="联系电话" name="联系电话">
                    <t-input v-model="form_query_data.phone" :clearable="true"></t-input>
                </t-form-item>
                <t-form-item label="在职状态" name="在职状态" class="form_select_short">
                    <t-select v-model="form_query_data.status" :clearable="true">
                        <t-option
                            v-for="item in globalLoginData.commonData.employeeStatus"
                            v-if="globalLoginData.commonData"
                            :key="item.code"
                            :label="item.remark"
                            :value="item.code"
                        />
                    </t-select>
                </t-form-item>
                <t-form-item label="人员范围" name="人员范围" class="form_select_short">
                    <t-select v-model="form_query_data.directOrAll">
                        <t-option key="所有人员" label="所有人员" value="100" />
                        <t-option key="直属人员" label="直属人员" value="200" />
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
                <t-button theme="primary" variant="outline" @click="showEmployeeAdd()">
                    <template #icon><AddIcon /></template>
                    人员
                </t-button>
            </div>
        </template>
        <template #refOperation="{ row }">
            <t-space direction="vertical" size="5">
                <t-button
                    variant="outline"
                    size="medium"
                    theme="danger"
                    shape="round"
                    @click="showEmployeeEdit(row.id)"
                >
                    修改信息
                </t-button>
            </t-space>
        </template>
    </table_with_pagination>
    <t-drawer
        id="employee_submit_data"
        v-model:visible="employee_submit_data.visible"
        @confirm="onSubmitEmployee"
        size="40%"
        placement="right"
        :closeBtn="true"
        :cancelBtn="null"
        confirmBtn="提交"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
    >
        <template #header>人员信息</template>
        <t-form
            :rules="employee_submit_data.rules"
            :data="employee_submit_data.submitData"
            requiredMarkPosition="right"
        >
            <t-form-item label="人员姓名" name="title" help="*必填，提交后无法修改">
                <t-input
                    placeholder="人员姓名"
                    v-model="employee_submit_data.submitData.title"
                    :disabled="!employee_submit_data.addMode"
                />
            </t-form-item>
            <t-form-item label="联系电话" name="联系电话" help="*必填">
                <t-input placeholder="联系电话" v-model="employee_submit_data.submitData.phone" />
            </t-form-item>
            <t-form-item label="联系邮箱" name="联系邮箱" help="*必填">
                <t-input placeholder="联系邮箱" v-model="employee_submit_data.submitData.email" />
            </t-form-item>
            <t-form-item label="联系地址" name="联系地址" help="选填">
                <t-input placeholder="联系地址" v-model="employee_submit_data.submitData.address" />
            </t-form-item>
            <t-form-item
                label="人员工号"
                name="人员工号"
                help="选填，在整个商户范围内唯一，提交后无法修改"
            >
                <t-input
                    placeholder="人员工号"
                    v-model="employee_submit_data.submitData.employeeNo"
                    :disabled="!employee_submit_data.addMode"
                />
            </t-form-item>
            <form_enum_radio_group
                label="在职状态"
                help="*必填"
                v-model="employee_submit_data.submitData.status"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.employeeStatus"
            />
            <t-form-item label="人员部门" name="人员部门" help="*必填">
                <t-select v-model="employee_submit_data.submitData.departmentId">
                    <t-option
                        v-for="item in department_list_submit"
                        :key="item.id"
                        :label="item.titleAbs"
                        :value="item.id"
                    />
                </t-select>
            </t-form-item>
            <t_form_item_position_check_group
                label="关联岗位"
                help="选填"
                v-model="employee_submit_data.submitData.positionIds"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <t-form-item label="备注信息" name="备注信息" help="选填">
                <t-input placeholder="备注信息" v-model="employee_submit_data.submitData.remark" />
            </t-form-item>
        </t-form>
    </t-drawer>
</template>

<style scoped></style>
