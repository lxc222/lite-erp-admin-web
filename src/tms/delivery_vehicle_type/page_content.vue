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

const table_columns = [
    { colKey: "id", title: "#ID", width: 100 },
    { colKey: "title", title: "规格名称" },
    {
        colKey: "hasRefrigeratorTitle",
        title: "冷藏"
    },
    {
        colKey: "hasContainerTitle",
        title: "箱式"
    },
    {
        colKey: "hasCoverTitle",
        title: "篷布"
    },
    {
        colKey: "statusTitle",
        title: "是否启用",
        width: 115,
        cell: (h, { row }) => {
            return <enable_status_tag status={row.status} />;
        }
    },
    { colKey: "remark", title: "备注" },
    { colKey: "createAction", title: "创建操作" },
    { colKey: "updateAction", title: "最后修改" },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const data_submit = ref({
    visible: false,
    addMode: false,
    submitData: {
        id: null,
        title: null,
        hasRefrigerator: null,
        hasContainer: null,
        hasCover: null,
        status: null,
        remark: null
    },
    rules: {}
});

async function onShowAddDlg() {
    data_submit.value.submitData = {
        status: globalConstDef.enableModel.Enabled
    };

    data_submit.value.visible = true;
    data_submit.value.addMode = true;
}

async function onShowEditDlg(editId) {
    data_submit.value.submitData = {};
    data_submit.value.addMode = false;
    axiosPostJson(
        "/api/biz/tms/deliveryVehicleType/oneById",
        {
            itemId: editId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                data_submit.value.submitData = response.data.data;
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

const onTableLineMenuHandler = data => {
    if ("修改信息" === data.content) {
        onShowEditDlg(data.value.id);
    }
};

const onSubmitData = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/tms/deliveryVehicleType/add";
        if (data_submit.value.submitData.id > 0) {
            distUrl = "/api/biz/tms/deliveryVehicleType/change";
        }

        axiosPostJsonBody(distUrl, data_submit.value.submitData, function (response) {
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
        "/api/biz/tms/deliveryVehicleType/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
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
                <t-button theme="primary" variant="outline" @click="onShowAddDlg()">
                    <template #icon><AddIcon /></template>
                    运输车型
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
                    :options="[{ content: '修改信息', value: row, divider: true }]"
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
                @onChange="onQueryFormData(false)"
                @current-change="onQueryFormData(false)"
                @page-size-change="onQueryFormData(false)"
                showFirstAndLastPageBtn
            />
        </template>
    </t-card>
    <t-dialog
        id="data_submit"
        v-model:visible="data_submit.visible"
        header="运输规格"
        width="40%"
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
            :data="data_submit.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitData"
        >
            <t-form-item label="车型名称" name="车型名称" help="*必填">
                <t-input
                    placeholder="车型名称"
                    v-model="data_submit.submitData.title"
                    :clearable="true"
                />
            </t-form-item>
            <form_enum_radio_group
                label="冷藏运输"
                help="*必填"
                v-model="data_submit.submitData.hasRefrigerator"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.yesOrNo"
            />
            <form_enum_radio_group
                label="箱式运输"
                help="*必填"
                v-model="data_submit.submitData.hasContainer"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.yesOrNo"
            />
            <form_enum_radio_group
                label="篷布运输"
                help="*必填"
                v-model="data_submit.submitData.hasCover"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.yesOrNo"
            />
            <form_enum_radio_group
                label="是否启用"
                help="*必填"
                v-model="data_submit.submitData.status"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input
                    placeholder="备注信息"
                    v-model="data_submit.submitData.remark"
                    :clearable="true"
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

<style scoped>
.switch-status span {
    font-size: 13px;
}
</style>
