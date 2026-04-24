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
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

import form_enum_radio_group from "@/components/form_enum_radio_group.vue";

import enable_status_tag from "@/components/enable_status_tag.vue";

const material_spec_list = ref([]);
async function doLoadMaterialSpecData() {
    let distUrl = "/api/biz/md/materialSpecType/list";
    axiosPostJsonBody(distUrl, {}, function (response) {
        if (isAjaxRspSucc(response)) {
            material_spec_list.value = response.data.data;
        }
    });
}

const table_columns = [
    { colKey: "id", title: "#ID", width: 100 },
    {
        colKey: "specTitle",
        title: "规格分类",
        cell: (h, { row }) => {
            return (
                <span>
                    {row.specTitle} ( {row.specId} )
                </span>
            );
        }
    },
    {
        colKey: "title",
        title: "规格明细",
        cell: (h, { row }) => {
            return <span>{row.title}</span>;
        }
    },
    {
        colKey: "statusTitle",
        title: "是否启用",
        width: "110",
        cell: (h, { row }) => {
            return <enable_status_tag status={row.status} />;
        }
    },
    { colKey: "remark", title: "备注" },
    { colKey: "createAction", title: "创建操作" },
    { colKey: "updateAction", title: "最后修改" },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const spec_value_submit_data = ref({
    visible: false,
    addMode: false,
    submitData: {
        id: null,
        specId: null,
        title: null,
        status: null,
        remark: null
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

async function onShowEntityAddDlg() {
    spec_value_submit_data.value.submitData = {};
    spec_value_submit_data.value.visible = true;
    spec_value_submit_data.value.addMode = true;
}

async function ShowEntityEditDlg(editId, type) {
    spec_value_submit_data.value.submitData = {};
    spec_value_submit_data.value.addMode = false;
    axiosPostJson(
        "/api/biz/md/materialSpecValue/oneById",
        {
            itemId: editId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                spec_value_submit_data.value.submitData = response.data.data;
                spec_value_submit_data.value.visible = true;
            }
        }
    );
}

const onTableLineMenuHandler = data => {
    if ("修改信息" === data.content) {
        ShowEntityEditDlg(data.value.id, data.value.type);
    }
};

const onSubmitEntityData = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        spec_value_submit_data.value.visible = false;
        let distUrl = "/api/biz/md/materialSpecValue/add";
        if (spec_value_submit_data.value.submitData.id > 0) {
            distUrl = "/api/biz/md/materialSpecValue/change";
        }

        axiosPostJsonBody(distUrl, spec_value_submit_data.value.submitData, function (response) {
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
        });
    } else {
        // console.log("Validate Errors: ", firstError, validateResult);
        MessagePlugin.error(firstError);
    }
};

const form_query_data = ref({
    specId: null,
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
        "/api/biz/md/materialSpecValue/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            status: form_query_data.value.status,
            specId: form_query_data.value.specId
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
    doLoadMaterialSpecData();
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
                <t-form-item label="规格分类" name="规格分类">
                    <t-select v-model="form_query_data.specId" :clearable="true" :filterable="true">
                        <t-option
                            v-for="item in material_spec_list"
                            :key="item.id"
                            :label="item.title + ' (' + item.statusTitle + ')'"
                            :value="item.id"
                        />
                    </t-select>
                </t-form-item>
                <t-form-item label="是否启用" name="是否启用" class="form_select_short">
                    <t-select v-model="form_query_data.status" :clearable="true">
                        <t-option
                            v-if="globalLoginData.commonData"
                            v-for="item in globalLoginData.commonData.enableModel"
                            :key="item.code"
                            :label="item.remark"
                            :value="item.code"
                        />
                    </t-select>
                </t-form-item>
                <t-button theme="primary" type="submit">开始查询</t-button>
            </t-form>
        </div></t-card
    >
    <t-card header-bordered :style="{ margin: '5px' }" id="data_table">
        <template #header>
            <div>
                <t-button theme="primary" variant="outline" @click="onShowEntityAddDlg()">
                    <template #icon><AddIcon /></template>
                    规格明细
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
                showFirstAndLastPageBtn
                @onChange="onQueryFormData(false)"
                @current-change="onQueryFormData(false)"
                @page-size-change="onQueryFormData(false)"
        /></template>
    </t-card>
    <t-dialog
        id="spec_value_submit_data"
        v-model:visible="spec_value_submit_data.visible"
        header="规格明细"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
    >
        <t-form
            :rules="spec_value_submit_data.rules"
            :data="spec_value_submit_data.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitEntityData"
        >
            <t-form-item label="规格分类" name="规格分类" help="*必填">
                <t-select
                    v-model="spec_value_submit_data.submitData.specId"
                    :disabled="!spec_value_submit_data.addMode"
                >
                    <t-option
                        v-for="item in material_spec_list"
                        :key="item.id"
                        :label="item.title + ' (' + item.statusTitle + ')'"
                        :value="item.id"
                    />
                </t-select>
            </t-form-item>
            <t-form-item label="规格明细" name="规格明细" help="*必填，如 红色 黄色">
                <t-input placeholder="填写明细" v-model="spec_value_submit_data.submitData.title" />
            </t-form-item>
            <form_enum_radio_group
                label="是否启用"
                help="*必填"
                v-model="spec_value_submit_data.submitData.status"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input
                    placeholder="备注信息"
                    v-model="spec_value_submit_data.submitData.remark"
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
