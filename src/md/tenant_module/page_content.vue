<script setup>
import { onMounted, ref } from "vue";

import { MessagePlugin, LoadingPlugin, DialogPlugin } from "tdesign-vue-next";

import { AddIcon } from "tdesign-icons-vue-next";

import {
    ajaxPageDataParse,
    axiosGetJson,
    axiosPostJson,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";
import { message_plugin_config } from "@/assets/asset_biz_base_20251024.js";

const thisModel = defineModel();

const subscribeData = ref({
    moduleId: -1,
    visible: false,
    moduleList: []
});

const unsubscribeData = ref({
    moduleId: -1
});

const form_query_data = ref({
    moduleId: null,
    account: "",
    page: {
        pageNo: 1,
        pageSize: 10,
        totalNum: 0,
        totalPage: 0
    },
    pageData: []
});

const columns = ref([
    { colKey: "id", title: "#ID", width: "100" },
    { colKey: "moduleName", title: "模块名称" },
    { colKey: "moduleId", title: "#模块ID" },
    { colKey: "createAction", title: "订阅操作" },
    { colKey: "refOperation", title: "关联操作", width: 120 }
]);

async function load_module_for_subscribe() {
    axiosGetJson("/api/biz/md/module/listTenantCanSubscribe", function (response) {
        // console.log(response.data);
        if (isAjaxRspSucc(response)) {
            subscribeData.value.moduleList = response.data.data;
        }
    });
}

async function show_subscribe_module() {
    subscribeData.value.moduleId = null;
    load_module_for_subscribe();
    subscribeData.value.visible = true;
}

function submit_subscribe_module() {
    axiosPostJson(
        "/api/biz/md/module/subscriptTenant",
        {
            moduleId: subscribeData.value.moduleId
        },
        function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                subscribeData.value.visible = false;
                MessagePlugin.info({
                    content: response.data.data,
                    duration: 3000,
                    closeBtn: true,
                    placement: "center",
                    onClose: function () {}
                });

                onQueryFormData(true);
            }
        }
    );
}

async function show_unsubscribe_module(moduleId) {
    unsubscribeData.value.moduleId = moduleId;
    const confirmDia = DialogPlugin.confirm({
        header: "取消关联",
        body: "取消关联后将无法恢复",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();
            submit_unsubscribe_module();
        },
        onClose: ({ e, trigger }) => {
            confirmDia.hide();
        }
    });
}

function submit_unsubscribe_module() {
    axiosPostJson(
        "/api/biz/md/module/unsubscriptTenant",
        {
            moduleId: unsubscribeData.value.moduleId
        },
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

            onQueryFormData(true);
        }
    );
}

function onQueryFormData(resetPage) {
    if (resetPage) {
        form_query_data.value.page.pageNo = 1;
    }

    LoadingPlugin(true);
    axiosPostJson(
        "/api/biz/md/module/pageTenantSubscribed",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize
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
    <t-card header-bordered :style="{ margin: '5px' }">
        <template #header>
            <div>
                <t-button theme="primary" variant="outline" @click="show_subscribe_module()">
                    <template #icon><AddIcon /></template>
                    新增订阅
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
                <t-button
                    variant="outline"
                    size="medium"
                    theme="danger"
                    shape="round"
                    @click="show_unsubscribe_module(row.moduleId)"
                >
                    取消订阅
                </t-button>
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
        :closeBtn="false"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
        v-model:visible="subscribeData.visible"
        header="新增订阅"
        :on-confirm="submit_subscribe_module"
        :on-cancel="() => (subscribeData.visible = false)"
        :on-close-btn-click="() => (subscribeData.visible = false)"
    >
        <t-form>
            <t-form-item label="未定模块" name="未定模块">
                <t-select v-model="subscribeData.moduleId">
                    <t-option
                        v-for="item in subscribeData.moduleList"
                        :key="item.moduleName"
                        :label="item.moduleName"
                        :value="item.moduleId"
                    />
                </t-select>
            </t-form-item>
        </t-form>
    </t-dialog>
</template>

<style scoped></style>
