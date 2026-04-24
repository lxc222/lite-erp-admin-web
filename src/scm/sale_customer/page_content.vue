<script setup lang="jsx">
import { onMounted, ref } from "vue";

const thisModel = defineModel();

import { AddIcon } from "tdesign-icons-vue-next";
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
import t_form_item_employee from "@/components/md/t_form_item_employee.vue";

import enable_status_tag from "@/components/enable_status_tag.vue";

const table_columns = [
    { colKey: "id", title: "#ID", width: 100 },
    {
        colKey: "title",
        title: "客户名称",
        cell: (h, { row }) => {
            let jsx = [];
            jsx.push(<span>【客户名称】{row.title}</span>);
            jsx.push(<p class="my_p_divider" />);
            jsx.push(<enable_status_tag status={row.status} />);

            return jsx;
        }
    },
    {
        colKey: "typeStr",
        title: "客户类型",
        width: 200,
        cell: (h, { row }) => {
            if (row.type == globalConstDef.scSaleCustomerType.External) {
                return <span>【客户类型】{row.typeStr}</span>;
            } else {
                return (
                    <span>
                        【客户类型】<span style="font-weight:bold;">{row.typeStr}</span>
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
        width: 250,
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
        colKey: "contactEmployee",
        title: "联络人员",
        align: "right"
    },
    { colKey: "remark", title: "备注" },
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
        remark: null,
        status: null,
        contactEmployeeId: null,
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

async function onShowCustomerAdd() {
    data_submit.value.formData = {};
    data_submit.value.visible = true;
    data_submit.value.addMode = true;
}

async function onShowCustomerEdit(editId) {
    data_submit.value.formData = {};
    data_submit.value.addMode = false;
    axiosPostJson(
        "/api/biz/scm/saleCustomer/oneById",
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

function onCustomerTypeChange() {
    if (data_submit.value.formData.type == globalConstDef.scSaleCustomerType.Inner) {
        data_submit.value.formData.title = null;
        data_submit.value.formData.phone = null;
        data_submit.value.formData.email = null;
        data_submit.value.formData.address = null;

        onLoadTenantByCode();
    }
}

const onTableLineMenuHandler = data => {
    if ("修改信息" === data.content) {
        onShowCustomerEdit(data.value);
    }
};

const onSubmitCustomer = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/scm/saleCustomer/add";
        if (data_submit.value.formData.id > 0) {
            distUrl = "/api/biz/scm/saleCustomer/change";
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
    status: null,
    platform_tenant_code: null,
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
        "/api/biz/scm/saleCustomer/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            phone: form_query_data.value.phone,
            type: form_query_data.value.type,
            platform_tenant_code: form_query_data.value.platform_tenant_code
        },
        function (response) {
            LoadingPlugin(false);
            //console.info(JSON.stringify(response.data));
            if (isAjaxRspSucc(response)) {
                ajaxPageDataParse(response.data.data, form_query_data);

                MessagePlugin.success({
                    ...message_plugin_config,
                    content: "数据加载完成"
                });
            } else {
                MessagePlugin.info({
                    content: response.data.tipMsg,
                    duration: 2000,
                    closeBtn: true,
                    placement: "center",
                    onClose: function () {}
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
                <t-form-item label="联系电话" name="联系电话">
                    <t-input v-model="form_query_data.phone"></t-input>
                </t-form-item>
                <t-form-item label="平台编码" name="唯一编码">
                    <t-input v-model="form_query_data.platform_tenant_code"></t-input>
                </t-form-item>
                <form_enum_list
                    label="客户类型"
                    v-model="form_query_data.type"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.scSaleCustomerType"
                    :widthPx="180"
                />
                <form_enum_list
                    label="是否启用"
                    v-model="form_query_data.status"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.enableModel"
                    :widthPx="160"
                />
                <t-button theme="primary" type="submit">开始查询</t-button>
            </t-form>
        </div>
    </t-card>
    <t-card header-bordered :style="{ margin: '5px' }" id="data_table">
        <template #header>
            <div>
                <t-button theme="primary" variant="outline" @click="onShowCustomerAdd()">
                    <template #icon><AddIcon /></template>
                    客户信息
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
        header="客户信息"
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
            @submit="onSubmitCustomer"
        >
            <form_enum_radio_group
                label="客户类型"
                help="*必填"
                v-model="data_submit.formData.type"
                @change="onCustomerTypeChange"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.scSaleCustomerType"
            />
            <t-form-item
                label="平台编码"
                name="平台编码"
                help="*必填，本平台内的租户编码，补充后可直接查询供应商外供商品"
                v-show="data_submit.formData.type == globalConstDef.scSaleCustomerType.Inner"
            >
                <t-input
                    placeholder="平台编码"
                    v-model="data_submit.formData.platformTenantCode"
                    @blur="onLoadTenantByCode"
                />
            </t-form-item>
            <t-form-item label="客户名称" name="客户名称" help="*必填，客户名称">
                <t-input
                    placeholder="客户名称"
                    v-model="data_submit.formData.title"
                    :disabled="data_submit.formData.type == globalConstDef.scSaleCustomerType.Inner"
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
                    :disabled="data_submit.formData.type == globalConstDef.scSaleCustomerType.Inner"
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
                    :disabled="data_submit.formData.type == globalConstDef.scSaleCustomerType.Inner"
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
                    :disabled="data_submit.formData.type == globalConstDef.scSaleCustomerType.Inner"
                />
            </t-form-item>
            <t_form_item_employee
                label="联络人员"
                help="选填"
                v-model="data_submit.formData.contactEmployeeId"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <form_enum_radio_group
                label="是否启用"
                help="*必填"
                v-model="data_submit.formData.status"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息" help="选填">
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
