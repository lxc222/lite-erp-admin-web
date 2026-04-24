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
import enable_status_tag from "@/components/enable_status_tag.vue";

const columns = ref([
    { colKey: "id", title: "#ID", width: 100 },
    { colKey: "name", title: "名称" },
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
        colKey: "idCard",
        title: "身份ID",
        align: "right"
    },
    {
        colKey: "statusTitle",
        title: "状态",
        width: "110",
        cell: (h, { row }) => {
            return <enable_status_tag status={row.status} />;
        }
    },
    {
        colKey: "walletMoney",
        title: "钱包余额",
        width: 120,
        align: "right",
        cell: (h, { row }) => {
            return <span class="table_column_money">￥{row.walletMoney}</span>;
        }
    },
    { colKey: "remark", title: "备注" },
    { colKey: "createAction", title: "创建操作", width: 120 },
    { colKey: "updateAction", title: "最后修改", width: 120 },
    { colKey: "refOperation", title: "关联操作", width: 120 }
]);

const entity_submit_data = ref({
    visible: false,
    addMode: false,
    submitData: {
        id: null,
        name: null,
        phone: null,
        email: null,
        idCard: null,
        status: null,
        remark: null
    },
    rules: {
        name: [
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

async function onShowRenterAdd() {
    entity_submit_data.value.submitData = { status: globalConstDef.enableModel.Enabled };
    entity_submit_data.value.visible = true;
    entity_submit_data.value.addMode = true;
}

async function onShowRenterEdit(editId) {
    entity_submit_data.value.submitData = {};
    entity_submit_data.value.addMode = false;
    axiosPostJson(
        "/api/biz/md/merchant/oneById",
        {
            itemId: editId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                entity_submit_data.value.submitData = response.data.data;
                entity_submit_data.value.visible = true;
            }
        }
    );
}

const onTableLineMenuHandler = data => {
    if ("修改信息" === data.content) {
        onShowRenterEdit(data.value);
    }
};

const onSubmitRenterData = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/md/merchant/add";
        if (entity_submit_data.value.submitData.id > 0) {
            distUrl = "/api/biz/md/merchant/change";
        }

        axiosPostJsonBody(distUrl, entity_submit_data.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                entity_submit_data.value.visible = false;
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
    phone: null,
    name: null,
    email: null,
    idCard: null,
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
        "/api/biz/md/merchant/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            storeWare: form_query_data.value.storeWare,
            storeMaterial: form_query_data.value.storeMaterial,
            status: form_query_data.value.status,
            phone: form_query_data.value.phone,
            name: form_query_data.value.name,
            email: form_query_data.value.email,
            idCard: form_query_data.value.idCard
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
                <t-form-item label="商户姓名" name="商户姓名">
                    <t-input v-model="form_query_data.name" :clearable="true"></t-input>
                </t-form-item>
                <t-form-item label="联系电话" name="联系电话">
                    <t-input v-model="form_query_data.phone" type="tel" :clearable="true"></t-input>
                </t-form-item>
                <t-form-item label="联系邮件" name="联系邮件">
                    <t-input v-model="form_query_data.email" :clearable="true"></t-input>
                </t-form-item>
                <t-form-item label="身份ID" name="身份ID">
                    <t-input v-model="form_query_data.idCard" :clearable="true"></t-input>
                </t-form-item>
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
    <t-card header-bordered :style="{ margin: '5px' }" id="data_table">
        <template #header>
            <div>
                <t-button theme="primary" variant="outline" @click="onShowRenterAdd()">
                    <template #icon><AddIcon /></template>
                    商户
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
        id="entity_submit_data"
        :closeBtn="true"
        width="35%"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
        v-model:visible="entity_submit_data.visible"
        header="商户信息"
    >
        <t-form
            :rules="entity_submit_data.rules"
            :data="entity_submit_data.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitRenterData"
        >
            <t-form-item label="商户名称" name="商户名称" help="*必填">
                <t-input placeholder="商户名称" v-model="entity_submit_data.submitData.name" />
            </t-form-item>
            <t-form-item label="联系电话" name="联系电话" help="*必填">
                <t-input
                    placeholder="请确保电话真实性"
                    v-model="entity_submit_data.submitData.phone"
                />
            </t-form-item>
            <t-form-item label="联系邮箱" name="联系邮箱" help="选填">
                <t-input placeholder="联系邮箱" v-model="entity_submit_data.submitData.email" />
            </t-form-item>
            <t-form-item label="身份ID" name="身份ID" help="选填">
                <t-input placeholder="身份ID" v-model="entity_submit_data.submitData.idCard" />
            </t-form-item>
            <form_enum_radio_group
                label="是否启用"
                help="*必填"
                v-model="entity_submit_data.submitData.status"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.enableModel"
            >
            </form_enum_radio_group>
            <t-form-item label="备注信息" name="备注信息" help="选填">
                <t-input placeholder="备注信息" v-model="entity_submit_data.submitData.remark" />
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
