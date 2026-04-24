<script setup lang="jsx">
import { onMounted, ref } from "vue";

const thisModel = defineModel();

import { AddIcon, ArrowRightIcon, CheckIcon, CloseIcon } from "tdesign-icons-vue-next";
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

import form_enum_list from "@/components/form_enum_list.vue";
import form_enum_radio_group from "@/components/form_enum_radio_group.vue";

const doRenderStatus = (h, { row }) => {
    if (row.status == globalConstDef.scPurchaseSupplierStatus.Check) {
        return (
            <span class="table_column_italic">
                <t-tag theme="primary" shape="round" size="medium" variant="light-outline">
                    <ArrowRightIcon />
                    {row.statusTitle}
                </t-tag>
            </span>
        );
    } else if (row.status == globalConstDef.scPurchaseSupplierStatus.Corporate) {
        return (
            <span class="table_column_italic">
                <t-tag theme="success" shape="round" size="medium" variant="light-outline">
                    <CheckIcon />
                    {row.statusTitle}
                </t-tag>
            </span>
        );
    } else {
        return (
            <span class="table_column_italic">
                <t-tag theme="danger" shape="round" size="medium" variant="light-outline">
                    <CloseIcon />
                    {row.statusTitle}
                </t-tag>
            </span>
        );
    }
};

const table_columns = [
    { colKey: "id", title: "#ID", width: 100 },
    { colKey: "title", title: "供应商名称", width: 200 },
    {
        colKey: "typeStr",
        title: "供应商类型",
        width: 200,
        cell: (h, { row }) => {
            if (row.type == globalConstDef.scPurchaseSupplierType.External) {
                return <span>【主体类型】{row.typeStr}</span>;
            } else {
                return (
                    <span>
                        【主体类型】<span style="font-weight:bold;">{row.typeStr}</span>
                        <p class="my_p_divider" />
                        【平台编码】{row.platformTenantCode}
                    </span>
                );
            }
        }
    },
    {
        colKey: "phone",
        title: "联系信息",
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
    { colKey: "statusTitle", title: "合作状态", width: 115, cell: doRenderStatus },
    { colKey: "remark", title: "备注", width: 150 },
    { colKey: "createAction", title: "创建操作", width: 120 },
    { colKey: "updateAction", title: "最后修改", width: 120 },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const data_submit = ref({
    visible: false,
    addMode: false,
    formData: {
        id: null,
        title: null,
        phone: null,
        email: null,
        address: null,
        status: null,
        remark: null,
        platformTenantCode: null,
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

async function onShowSupplierAdd() {
    data_submit.value.formData = {};
    data_submit.value.visible = true;
    data_submit.value.addMode = true;
}

async function onShowSupplierEdit(editId) {
    data_submit.value.formData = {};
    data_submit.value.addMode = false;
    axiosPostJson(
        "/api/biz/scm/supplier/oneById",
        {
            itemId: editId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                data_submit.value.formData = response.data.data;
                data_submit.value.visible = true;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

async function onLoadTenantByCode() {
    if (
        !data_submit.value.formData.platformTenantCode ||
        "" == data_submit.value.formData.platformTenantCode
    ) {
        data_submit.value.formData.title = null;
        data_submit.value.formData.phone = null;
        data_submit.value.formData.email = null;
        data_submit.value.formData.address = null;
        return;
    }

    axiosPostJson(
        "/api/biz/md/tenant/getByCode",
        {
            code: data_submit.value.formData.platformTenantCode
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                data_submit.value.formData.title = response.data.data.title;
                data_submit.value.formData.phone = response.data.data.phone;
                data_submit.value.formData.email = response.data.data.email;
                data_submit.value.formData.address = response.data.data.address;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

function onSupplierTypeChange() {
    if (data_submit.value.formData.type == globalConstDef.scPurchaseSupplierType.Inner) {
        data_submit.value.formData.title = null;
        data_submit.value.formData.phone = null;
        data_submit.value.formData.email = null;
        data_submit.value.formData.address = null;

        onLoadTenantByCode();
    }
}

const onTableLineMenuHandler = data => {
    if ("修改信息" === data.content) {
        onShowSupplierEdit(data.value);
    }
};

const onSubmitSupplier = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/scm/supplier/add";
        if (data_submit.value.formData.id > 0) {
            distUrl = "/api/biz/scm/supplier/change";
        }

        axiosPostJsonBody(distUrl, data_submit.value.formData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                data_submit.value.visible = false;
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
    phone: null,
    platformTenantCode: null,
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
        "/api/biz/scm/supplier/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            phone: form_query_data.value.phone,
            status: form_query_data.value.status,
            platformTenantCode: form_query_data.value.platformTenantCode
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
                <t-form-item label="联系电话" name="联系电话">
                    <t-input v-model="form_query_data.phone" :clearable="true"></t-input>
                </t-form-item>
                <t-form-item label="平台编码" name="平台编码">
                    <t-input
                        v-model="form_query_data.platformTenantCode"
                        :clearable="true"
                    ></t-input>
                </t-form-item>
                <form_enum_list
                    label="合作状态"
                    v-model="form_query_data.status"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.scPurchaseSupplierStatus"
                    :widthPx="160"
                />
                <t-button theme="primary" type="submit">开始查询</t-button>
            </t-form>
        </div></t-card
    >
    <t-card header-bordered :style="{ margin: '5px' }" id="data_table">
        <template #header>
            <div>
                <t-button theme="primary" variant="outline" @click="onShowSupplierAdd()">
                    <template #icon><AddIcon /></template>
                    供应商
                </t-button>
            </div>
        </template>
        <t-table
            row-key="index"
            :data="form_query_data.pageData"
            :columns="table_columns"
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
        id="data_submit"
        v-model:visible="data_submit.visible"
        header="供应商信息"
        width="50%"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
    >
        <t-form
            :rules="data_submit.rules"
            :data="data_submit.formData"
            requiredMarkPosition="right"
            @submit="onSubmitSupplier"
        >
            <form_enum_radio_group
                label="供应商类型"
                help="*必填, 本平台内供应商请填写供应商编码，方便互通数据"
                v-model="data_submit.formData.type"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.scPurchaseSupplierType"
                @change="onSupplierTypeChange"
            />
            <t-form-item
                label="供应商编码"
                name="供应商编码"
                help="*必填，在本平台内的供应商编码"
                v-show="data_submit.formData.type == globalConstDef.scPurchaseSupplierType.Inner"
            >
                <t-input
                    placeholder="供应商编码"
                    v-model="data_submit.formData.platformTenantCode"
                    @blur="onLoadTenantByCode"
                />
            </t-form-item>
            <t-form-item label="供应商名称" name="供应商名称" help="*必填">
                <t-input
                    placeholder="主体名称"
                    v-model="data_submit.formData.title"
                    :disabled="
                        data_submit.formData.type == globalConstDef.scPurchaseSupplierType.Inner
                    "
                />
            </t-form-item>
            <t-form-item
                label="联系电话"
                name="联系电话"
                help="选填"
                v-show="data_submit.formData.type"
            >
                <t-input
                    placeholder="请确保电话真实性"
                    v-model="data_submit.formData.phone"
                    :disabled="
                        data_submit.formData.type == globalConstDef.scPurchaseSupplierType.Inner
                    "
                />
            </t-form-item>
            <t-form-item
                label="联系邮箱"
                name="联系邮箱"
                help="选填"
                v-show="data_submit.formData.type"
            >
                <t-input
                    placeholder="联系邮箱"
                    v-model="data_submit.formData.email"
                    :disabled="
                        data_submit.formData.type == globalConstDef.scPurchaseSupplierType.Inner
                    "
                />
            </t-form-item>
            <t-form-item
                label="联系地址"
                name="联系地址"
                help="选填"
                v-show="data_submit.formData.type"
            >
                <t-input
                    placeholder="联系地址"
                    v-model="data_submit.formData.address"
                    :disabled="
                        data_submit.formData.type == globalConstDef.scPurchaseSupplierType.Inner
                    "
                />
            </t-form-item>
            <form_enum_radio_group
                label="合作状态"
                help="*必填"
                v-model="data_submit.formData.status"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.scPurchaseSupplierStatus"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="data_submit.formData.remark" />
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
