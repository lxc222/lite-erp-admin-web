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
import form_enum_check_group from "@/components/form_enum_check_group.vue";

import enable_status_tag from "@/components/enable_status_tag.vue";

const table_columns = [
    { colKey: "id", title: "#ID", width: 100 },
    {
        colKey: "title",
        title: "名称",
        cell: (h, { row }) => {
            return <span>{row.title}</span>;
        }
    },
    { colKey: "phone", title: "联系电话" },
    {
        colKey: "license",
        title: "驾驶证"
    },
    {
        colKey: "licenseLevelTitles",
        title: "持证类型",
        cell: (h, { row }) => {
            let jsx = [];
            for (let i = 0; i < row.licenseLevelTitles.length; i++) {
                jsx.push(
                    <span>
                        <p style="height: 2px;" />
                    </span>
                );
                jsx.push(
                    <span>
                        <t-typography-text code>{row.licenseLevelTitles[i]}</t-typography-text>
                    </span>
                );
            }

            return jsx;
        }
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

const data_submit_data = ref({
    visible: false,
    addMode: false,
    submitData: {
        id: null,
        title: null,
        license: null,
        phone: null,
        licenseLevels: [],
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

async function onShowAddDlg() {
    data_submit_data.value.submitData = {
        status: globalConstDef.enableModel.Enabled,
        licenseLevels: []
    };

    data_submit_data.value.visible = true;
    data_submit_data.value.addMode = true;
}

async function onShowEditDlg(editId) {
    data_submit_data.value.submitData = {
        licenseLevels: []
    };
    data_submit_data.value.addMode = false;
    axiosPostJson(
        "/api/biz/tms/selfDriver/oneById",
        {
            itemId: editId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                data_submit_data.value.submitData = response.data.data;
                data_submit_data.value.visible = true;
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

const onSubmitDataData = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/tms/selfDriver/add";
        if (data_submit_data.value.submitData.id > 0) {
            distUrl = "/api/biz/tms/selfDriver/change";
        }

        axiosPostJsonBody(distUrl, data_submit_data.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                data_submit_data.value.visible = false;
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
    title: null,
    license: null,
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
        "/api/biz/tms/selfDriver/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            status: form_query_data.value.status,
            title: form_query_data.value.title,
            license: form_query_data.value.license,
            phone: form_query_data.value.phone
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
                <t-form-item label="司机姓名" name="司机姓名">
                    <t-input v-model="form_query_data.title" :clearable="true"></t-input>
                </t-form-item>
                <t-form-item label="联系电话" name="联系电话">
                    <t-input v-model="form_query_data.phone" :clearable="true"></t-input>
                </t-form-item>
                <t-form-item label="驾驶证号" name="驾驶证号">
                    <t-input v-model="form_query_data.license" :clearable="true"></t-input>
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
                <t-button theme="primary" variant="outline" @click="onShowAddDlg()">
                    <template #icon><AddIcon /></template>
                    驾车司机
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
        id="data_submit_data"
        v-model:visible="data_submit_data.visible"
        header="驾车司机"
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
            :rules="data_submit_data.rules"
            :data="data_submit_data.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitDataData"
        >
            <t-form-item label="司机姓名" name="司机姓名" help="*必填">
                <t-input
                    placeholder="司机姓名"
                    v-model="data_submit_data.submitData.title"
                    :clearable="true"
                />
            </t-form-item>
            <t-form-item label="联系电话" name="联系电话" help="*必填">
                <t-input
                    placeholder="联系电话"
                    v-model="data_submit_data.submitData.phone"
                    :clearable="true"
                />
            </t-form-item>
            <t-form-item label="驾驶证号" name="驾驶证号" help="*必填">
                <t-input
                    placeholder="驾驶证号"
                    v-model="data_submit_data.submitData.license"
                    :clearable="true"
                />
            </t-form-item>
            <form_enum_check_group
                label="持证类型"
                help="*必填"
                v-model="data_submit_data.submitData.licenseLevels"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.tmsDriverLicenseLevel"
            />
            <form_enum_radio_group
                label="是否启用"
                help="*必填"
                v-model="data_submit_data.submitData.status"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input
                    placeholder="备注信息"
                    v-model="data_submit_data.submitData.remark"
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
