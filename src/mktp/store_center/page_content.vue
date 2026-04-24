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

import form_enum_list from "@/components/form_enum_list.vue";
import form_enum_radio_group from "@/components/form_enum_radio_group.vue";

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
                商铺面积(平方米)
                <b>【总数量】</b>
                {row.storeSquareAll} 平方&nbsp;&nbsp;
                <b>【启用中】</b>
                {row.storeSquareEnabled} 平方&nbsp;&nbsp;
                <b>【未启用】</b>
                {row.storeSquareDisabled} 平方&nbsp;&nbsp;
            </p>
        </div>
        <div class="more-detail">
            <p class="content">
                <b>【ID】</b>
                {row.id}&nbsp;&nbsp;
                <b>【创建操作】</b>
                {row.createAction}
            </p>
        </div>
    </div>
);

const table_columns = [
    { colKey: "title", title: "名称" },
    {
        colKey: "phone",
        title: "联系电话"
    },
    {
        colKey: "email",
        title: "联系邮件",
        align: "right"
    },
    {
        colKey: "address",
        title: "联系地址",
        align: "right"
    },
    {
        colKey: "storeCountAll",
        title: "商铺数量",
        align: "left",
        cell: (h, { row }) => {
            return (
                <span>
                    【总数量】{row.storeCountAll}
                    <p class="my_p_divider" />
                    【启用中】<span style="font-weight:bold;">{row.storeCountEnabled}</span>
                    <p class="my_p_divider" />
                    【未启用】{row.storeCountDisabled}
                </span>
            );
        }
    },
    {
        colKey: "statusTitle",
        title: "状态",
        width: 115,
        cell: (h, { row }) => {
            return <enable_status_tag status={row.status} />;
        }
    },
    { colKey: "remark", title: "备注", width: 120 },
    { colKey: "updateAction", title: "最后修改", width: 120 },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const store_center_submit_data = ref({
    visible: false,
    addMode: false,
    submitData: {
        id: null,
        title: null,
        phone: null,
        email: null,
        address: null,
        status: null,
        remark: null,
        type: null
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

async function onShowStoreCenterAdd() {
    store_center_submit_data.value.submitData = {};
    store_center_submit_data.value.visible = true;
    store_center_submit_data.value.addMode = true;
}

async function onShowStoreCenterEdit(editId) {
    store_center_submit_data.value.submitData = {};
    store_center_submit_data.value.addMode = false;
    axiosPostJson(
        "/api/biz/mktp/storeCenter/oneById",
        {
            itemId: editId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                store_center_submit_data.value.submitData = response.data.data;
                store_center_submit_data.value.visible = true;
            }
        }
    );
}

const onTableLineMenuHandler = data => {
    if ("修改信息" === data.content) {
        onShowStoreCenterEdit(data.value);
    }
};

const onSubmitStoreCenter = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/mktp/storeCenter/add";
        if (store_center_submit_data.value.submitData.id > 0) {
            distUrl = "/api/biz/mktp/storeCenter/change";
        }

        axiosPostJsonBody(distUrl, store_center_submit_data.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                store_center_submit_data.value.visible = false;
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
        "/api/biz/mktp/storeCenter/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            storeWare: form_query_data.value.storeWare,
            storeMaterial: form_query_data.value.storeMaterial,
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
                    widthPx="160"
                />
                <t-button theme="primary" type="submit">开始查询</t-button>
            </t-form>
        </div></t-card
    >
    <t-card header-bordered :style="{ margin: '5px' }" id="data_table">
        <template #header>
            <div>
                <t-button theme="primary" variant="outline" @click="onShowStoreCenterAdd()">
                    <template #icon><AddIcon /></template>
                    商铺中心
                </t-button>
            </div>
        </template>
        <t-table
            row-key="id"
            :data="form_query_data.pageData"
            :columns="table_columns"
            :expandedRow="onTableLineExpandedViewTpl"
            :expandedRowKeys="table_line_expanded_row_keys"
            :expandOnRowClick="false"
            @expandChange="onTableLineExpandChange"
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
        id="store_center_submit_data"
        v-model:visible="store_center_submit_data.visible"
        header="中心信息"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
    >
        <t-form
            :rules="store_center_submit_data.rules"
            :data="store_center_submit_data.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitStoreCenter"
        >
            <t-form-item label="名称" name="主体名称" help="*必填">
                <t-input placeholder="名称" v-model="store_center_submit_data.submitData.title" />
            </t-form-item>
            <t-form-item label="联系电话" name="联系电话" help="">
                <t-input
                    placeholder="请确保电话真实性"
                    v-model="store_center_submit_data.submitData.phone"
                />
            </t-form-item>
            <t-form-item label="联系邮箱" name="联系邮箱">
                <t-input
                    placeholder="联系邮箱"
                    v-model="store_center_submit_data.submitData.email"
                />
            </t-form-item>
            <t-form-item label="联系地址" name="联系地址" help="">
                <t-input
                    placeholder="联系地址"
                    v-model="store_center_submit_data.submitData.address"
                />
            </t-form-item>
            <form_enum_radio_group
                label="是否启用"
                v-model="store_center_submit_data.submitData.status"
                help="*必填"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input
                    placeholder="备注信息"
                    v-model="store_center_submit_data.submitData.remark"
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
