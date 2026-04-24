<script setup lang="jsx">
import { ref, onMounted, computed } from "vue";

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

import table_with_pagination from "@/components/table_with_pagination.vue";
import form_enum_list from "@/components/form_enum_list.vue";

import account_employee_add from "@/md/account/account_employee_add.vue";
import account_merchant_add from "@/md/account/account_merchant_add.vue";

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
    { colKey: "accountTypeTitle", title: "账号类型", width: 100 },
    { colKey: "account", title: "登入账号", width: 150 },
    {
        colKey: "title",
        title: "人员信息",
        width: 250,
        cell: (h, { row }) => {
            let jsx = [];
            jsx.push(<span>【名称】{row.title}</span>);
            jsx.push(<p class="my_p_divider" />);
            jsx.push(<span>【电话】{row.phone}</span>);
            jsx.push(<p class="my_p_divider" />);
            jsx.push(<span>【邮件】{row.email}</span>);
            return jsx;
        }
    },
    {
        colKey: "employeeNo",
        title: "关联数据",
        cell: (h, { row }) => {
            let jsx = [];

            if (row.employeeNo) {
                jsx.push(<span>【人员工号】{row.employeeNo}</span>);
            }

            if (row.merchantTitle) {
                jsx.push(<span>【关联商户】{row.merchantTitle}</span>);
            }
            return jsx;
        }
    },
    {
        colKey: "status",
        title: "状态",
        width: 115,
        cell: (h, { row }) => {
            return <enable_status_tag status={row.status} />;
        }
    },
    {
        colKey: "openAccountPasswdLoginTitle",
        title: "登入方式",
        width: 150,
        cell: (h, { row }) => {
            let jsx = [];
            jsx.push(<span>【账户+单密码】{row.openAccountPasswdLoginTitle}</span>);
            jsx.push(<p class="my_p_divider" />);
            jsx.push(<span>【账户+验证码】{row.openAccountCodeLoginTitle}</span>);
            jsx.push(<p class="my_p_divider" />);
            jsx.push(<span>【邮箱+验证码】{row.openEmailCodeLoginTitle}</span>);
            return jsx;
        }
    },
    { colKey: "remark", title: "备注" },
    { colKey: "updateAction", title: "最后修改", width: 120 },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const passwd_reset_model = ref({
    accountId: null
});

const employee_account_submit_model = ref({
    visible: false,
    itemId: null
});

function onShowEmployeeAccountAdd() {
    employee_account_submit_model.value = {
        visible: true,
        itemId: null
    };
}

function onShowEmployeeAccountEdit(editId) {
    employee_account_submit_model.value = {
        visible: true,
        itemId: editId
    };
}

const merchant_account_submit_model = ref({
    visible: false,
    itemId: null
});

function onShowMerchantAccountAdd() {
    merchant_account_submit_model.value = {
        visible: true,
        itemId: null
    };
}

function onShowMerchantAccountEdit(editId) {
    merchant_account_submit_model.value = {
        visible: true,
        itemId: editId
    };
}

function onShowAccountEdit(editId, type) {
    if (type == globalConstDef.accountType.Employee) {
        onShowEmployeeAccountEdit(editId);
    } else {
        onShowMerchantAccountEdit(editId);
    }
}

async function onPasswdReset(accountId) {
    passwd_reset_model.value.accountId = accountId;

    const confirmDia = DialogPlugin.confirm({
        header: "重置密码",
        body: "新密码会发送到账户关联邮箱",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();
            onSubmitPasswdReset();
        },
        onClose: ({ e, trigger }) => {
            confirmDia.hide();
        }
    });
}

async function onSubmitPasswdReset() {
    axiosPostJson(
        "/api/biz/md/account/resetAnyPassword",
        passwd_reset_model.value,
        function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
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
}

const onTableLineHandler = data => {
    if ("修改信息" === data.content) {
        onShowAccountEdit(data.value.id, data.value.accountType);
    } else {
        onPasswdReset(data.value.id);
    }
};

const form_query_data = ref({
    accountType: null,
    phone: null,
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
        "/api/biz/md/account/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            phone: form_query_data.value.phone,
            status: form_query_data.value.status,
            accountType: form_query_data.value.accountType
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
    <t-card :bordered="true" :style="{ margin: '5px' }">
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
                    label="账号类型"
                    v-model="form_query_data.accountType"
                    v-if="globalLoginData.commonData"
                    :options="globalLoginData.commonData.accountType"
                    :widthPx="160"
                />
                <t-form-item label="联系电话" name="联系电话">
                    <t-input v-model="form_query_data.phone" :clearable="true"></t-input>
                </t-form-item>
                <form_enum_list
                    label="账号状态"
                    v-model="form_query_data.status"
                    v-if="globalLoginData.commonData"
                    :options="globalLoginData.commonData.enableModel"
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
                <t-space>
                    <t-button theme="primary" variant="outline" @click="onShowEmployeeAccountAdd()">
                        <template #icon><AddIcon /></template>
                        人员账户
                    </t-button>
                    <t-button theme="primary" variant="outline" @click="onShowMerchantAccountAdd()">
                        <template #icon><AddIcon /></template>
                        商户账户
                    </t-button>
                </t-space>
            </div>
        </template>
        <template #refOperation="{ row }">
            <t-dropdown
                :options="[
                    { content: '修改信息', value: row },
                    { content: '重置密码', value: row }
                ]"
                @click="onTableLineHandler"
            >
                <t-button theme="success" shape="round">
                    更多&nbsp;
                    <span><i class="icon-chevron-down"></i></span>
                </t-button>
            </t-dropdown>
        </template>
    </table_with_pagination>
    <account_employee_add
        id="employee_account_submit_model"
        v-model="employee_account_submit_model"
    />
    <account_merchant_add
        id="merchant_account_submit_model"
        v-model="merchant_account_submit_model"
    />
</template>

<style scoped></style>
