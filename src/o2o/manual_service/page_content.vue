<script setup lang="jsx">
import { onMounted, ref } from "vue";

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
import table_with_pagination from "@/components/table_with_pagination.vue";
import form_enum_list from "@/components/form_enum_list.vue";
import form_enum_radio_group from "@/components/form_enum_radio_group.vue";
import enable_status_tag from "@/components/enable_status_tag.vue";

const table_columns = [
    { colKey: "id", title: "#ID" },
    { colKey: "title", title: "项目名称" },
    {
        colKey: "price",
        title: "散客售价",
        align: "right",
        cell: (h, { row }) => {
            return <span class="table_column_money">￥{row.price}</span>;
        }
    },
    {
        colKey: "memberPrice",
        title: "会员售价",
        align: "right",
        cell: (h, { row }) => {
            return <span class="table_column_money">￥{row.memberPrice}</span>;
        }
    },
    {
        colKey: "serviceMinuts",
        title: "服务时长(分钟)",
        align: "right",
        cell: (h, { row }) => {
            return <span>{row.serviceMinuts}分钟</span>;
        }
    },
    { colKey: "saleStatusTitle", title: "可售状态", align: "right" },
    { colKey: "remark", title: "备注" },
    { colKey: "createAction", title: "创建操作" },
    { colKey: "updateAction", title: "最后修改" },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];
async function onSwitchServiceStatus(editId) {
    const confirmDia = DialogPlugin.confirm({
        header: "可售状态切换",
        body: "调整货品可售状态",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();
            axiosPostJson(
                "/api/biz/o2o/manualService/enableOrDisable",
                {
                    itemId: editId
                },
                function (response) {
                    if (!isAjaxRspSucc(response)) {
                        MessagePlugin.error({
                            content: response.data.tipMsg,
                            duration: 3000,
                            closeBtn: true,
                            placement: "center",
                            onClose: function () {}
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
        },
        onClose: ({ e, trigger }) => {
            confirmDia.hide();
        }
    });
}

const onTableLineMenuHandler = data => {
    if ("修改货品" === data.content) {
        onShowServiceEdit(data.value);
    } else if ("启售/禁售" === data.content) {
        onSwitchServiceStatus(data.value);
    } else {
    }
};

const service_submit_model = ref({
    visible: false,
    submitData: {
        id: null,
        title: null,
        price: null,
        memberPrice: null,
        serviceMinuts: null,
        saleStatus: null,
        remark: null
    },
    rules: {
        title: [
            {
                required: true,
                message: "服务名称*必填",
                type: "error",
                trigger: "blur"
            },
            {
                required: true,
                message: "服务名称*必填",
                type: "error",
                trigger: "change"
            }
        ]
    }
});

async function onShowServiceAdd() {
    service_submit_model.value.submitData = {};
    service_submit_model.value.visible = true;
}

async function onShowServiceEdit(editId) {
    service_submit_model.value.visible = true;
    axiosPostJson(
        "/api/biz/o2o/manualService/one",
        {
            itemId: editId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                service_submit_model.value.submitData = response.data.data;
            }
        }
    );
}
const onSubmitService = () => {
    let distUrl = "/api/biz/o2o/manualService/add";
    if (service_submit_model.value.submitData.id > 0) {
        distUrl = "/api/biz/o2o/manualService/change";
    }

    axiosPostJsonBody(distUrl, service_submit_model.value.submitData, function (response) {
        if (!isAjaxRspSucc(response)) {
            MessagePlugin.error({
                ...message_plugin_config,
                content: response.data.tipMsg
            });
        } else {
            service_submit_model.value.visible = false;
            MessagePlugin.info({
                content: response.data.data,
                duration: 3000,
                closeBtn: true,
                placement: "center",
                onClose: function () {}
            });
        }
    });
};

const form_query_data = ref({
    title: null,
    saleStatus: null,
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
        "/api/biz/o2o/manualService/list",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            title: form_query_data.value.title,
            saleStatus: form_query_data.value.saleStatus
        },
        function (response) {
            LoadingPlugin(false);
            if (isAjaxRspSucc(response)) {
                ajaxPageDataParse(response.data.data, form_query_data);
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
    <t-card :bordered="true" :style="{ margin: '5px' }" id="data_query_form">
        <div style="padding-top: 10px; padding-bottom: 10px">
            <t-form
                label-align="right"
                labelWidth="60px"
                :data="form_query_data"
                layout="inline"
                scroll-to-first-error="smooth"
                @submit="onQueryFormData(true)"
            >
                <t-form-item label="服务名称" name="服务名称">
                    <t-input v-model="form_query_data.title"></t-input>
                </t-form-item>
                <form_enum_list
                    label="启用状态"
                    v-model="form_query_data.saleStatus"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.o2oWareSaleStatus"
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
        @pageChange="onQueryFormData(false)"
        @pageSizeChange="onQueryFormData(false)"
    >
        <template #headerActions>
            <div>
                <t-button theme="primary" variant="outline" @click="onShowServiceAdd()">
                    <template #icon><AddIcon /></template>
                    人工项目
                </t-button>
            </div>
        </template>
        <template #refOperation="{ row }">
            <t-dropdown
                :options="[
                    { content: '修改货品', value: row.id },
                    { content: '启售/禁售', value: row.id, divider: true }
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
        id="service_submit_model"
        width="40%"
        :closeBtn="true"
        :cancelBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
        v-model:visible="service_submit_model.visible"
        header="人工项目"
        @confirm="onSubmitService"
    >
        <t-form
            :rules="service_submit_model.rules"
            :data="service_submit_model.submitData"
            requiredMarkPosition="right"
        >
            <t-form-item label="项目名称" name="项目名称" help="*必填">
                <t-input placeholder="服务名称" v-model="service_submit_model.submitData.title" />
            </t-form-item>
            <t-form-item label="散客售价" name="散客售价" help="*必填，(最高支持两位小数)">
                <t-input
                    label="￥"
                    suffix="元"
                    type="number"
                    placeholder="散客售价￥"
                    v-model="service_submit_model.submitData.price"
                />
            </t-form-item>
            <t-form-item label="会员售价" name="会员售价" help="*必填，(最高支持两位小数)">
                <t-input
                    label="￥"
                    suffix="元"
                    type="number"
                    placeholder="会员售价￥"
                    v-model="service_submit_model.submitData.memberPrice"
                />
            </t-form-item>
            <form_enum_radio_group
                label="可售状态"
                help="*必填"
                v-model="service_submit_model.submitData.saleStatus"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.o2oWareSaleStatus"
            />
            <t-form-item label="服务时长" name="服务时长" help="*必填，(分钟)">
                <t-input
                    suffix="分钟"
                    type="number"
                    placeholder="服务时长"
                    v-model="service_submit_model.submitData.serviceMinuts"
                />
            </t-form-item>
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="service_submit_model.submitData.remark" />
            </t-form-item>
        </t-form>
    </t-dialog>
</template>

<style scoped></style>
