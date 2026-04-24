<script setup lang="jsx">
import { onMounted, ref } from "vue";

const thisModel = defineModel();

import { LogoutIcon, CheckCircleIcon } from "tdesign-icons-vue-next";

import { LoadingPlugin, MessagePlugin } from "tdesign-vue-next";

import {
    ajaxPageDataParse,
    axiosPostJsonBody,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";

import { message_plugin_config } from "@/assets/asset_biz_base_20251024.js";

const columns = ref([
    { colKey: "user_name", title: "用户名称" },
    { colKey: "user_account", title: "登入账户" },
    {
        colKey: "user_phone",
        title: "账户手机"
    },
    {
        colKey: "login_action",
        title: "操作",
        cell: (h, { row }) => {
            if (row.loginActionCode == 100) {
                return (
                    <t-tag theme="primary" shape="round" size="medium" variant="light-outline">
                        {<CheckCircleIcon />}
                        {row.login_action}&nbsp;
                    </t-tag>
                );
            } else {
                return (
                    <t-tag theme="success" shape="round" size="medium" variant="light-outline">
                        {<LogoutIcon />}
                        {row.login_action}&nbsp;
                    </t-tag>
                );
            }
        }
    },
    { colKey: "login_ip", title: "来源IP" },
    { colKey: "user_agent", title: "UserAgent" },
    { colKey: "create_time", title: "创建操作" }
]);

const form_query_data = ref({
    account: null,
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
        "/api/biz/md/account/login_history",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            account: form_query_data.value.account
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
    <t-card :bordered="true" :style="{ margin: '5px' }">
        <div style="padding-top: 10px; padding-bottom: 10px">
            <t-form
                label-align="right"
                :data="form_query_data"
                layout="inline"
                scroll-to-first-error="smooth"
                @submit="onQueryFormData(true)"
            >
                <t-form-item label="登入账号" name="登入账号">
                    <t-input v-model="form_query_data.account"></t-input>
                </t-form-item>
                <t-button theme="primary" type="submit">开始查询</t-button>
            </t-form>
        </div></t-card
    >
    <t-card header-bordered :style="{ margin: '5px' }">
        <template #header>
            <div>登入历史</div>
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
</template>

<style scoped></style>
