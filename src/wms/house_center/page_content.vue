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
import { getOneWmsHouseCenter } from "@/assets/asset_biz_wms_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

import form_enum_list from "@/components/form_enum_list.vue";
import form_enum_radio_group from "@/components/form_enum_radio_group.vue";
import t_form_item_employee from "@/components/md/t_form_item_employee.vue";
import t_form_item_position_list from "@/components/md/t_form_item_position_list.vue";

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
                <b>仓库数量：</b>&nbsp;&nbsp;&nbsp;
                <b>【总数量】</b>
                {row.storeCountAll}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【启用中】</b>
                {row.storeCountEnabled}&nbsp;&nbsp;
                <b>【未启用】</b>
                {row.storeCountDisabled}&nbsp;&nbsp;
            </p>
        </div>
        <div class="more-detail">
            <p class="content">
                <b>仓库面积(平方米)：</b>&nbsp;&nbsp;
                <b>【总数量】</b>
                {row.storeSquareAll} 平方&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【启用中】</b>
                {row.storeSquareEnabled} 平方&nbsp;&nbsp;
                <b>【未启用】</b>
                {row.storeSquareDisabled} 平方&nbsp;&nbsp;
            </p>
        </div>
        <div class="more-detail">
            <p class="content">
                <b>【ID】</b>
                {row.id}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【创建操作】</b>
                {row.createAction}
            </p>
        </div>
    </div>
);

const table_columns = [
    { colKey: "title", title: "名称", width: 180 },
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
    {
        colKey: "manageEmployee",
        title: "中心负责人",
        align: "right"
    },
    {
        colKey: "stockManagePositionTitle",
        title: "接收入库单再分？",
        align: "left",
        width: 200,
        cell: (h, { row }) => {
            return (
                <span>
                    【是否接受】{row.applyDepositFlagTitle}
                    <p class="my_p_divider" />
                    【库管岗位】{row.stockManagePositionTitle}
                </span>
            );
        }
    },
    {
        colKey: "statusTitle",
        title: "状态",
        width: "110",
        cell: (h, { row }) => {
            return <enable_status_tag status={row.status} />;
        }
    },
    { colKey: "remark", title: "备注" },
    { colKey: "updateAction", title: "最后修改", width: 120 },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const center_submit_model = ref({
    visible: false,
    addMode: false,
    submitData: {
        id: null,
        title: null,
        phone: null,
        email: null,
        address: null,
        applyDepositFlag: null,
        status: null,
        manageEmployeeId: null,
        stockManagePositionId: null,
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
    center_submit_model.value.submitData = {};
    center_submit_model.value.visible = true;
    center_submit_model.value.addMode = true;
}

async function onShowStoreCenterEdit(editId) {
    center_submit_model.value.submitData = {};
    center_submit_model.value.addMode = false;

    getOneWmsHouseCenter(
        editId,
        function (response) {
            center_submit_model.value.submitData = response.data;
            center_submit_model.value.visible = true;
        },
        function () {}
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
        let distUrl = "/api/biz/wms/houseCenter/add";
        if (center_submit_model.value.submitData.id > 0) {
            distUrl = "/api/biz/wms/houseCenter/change";
        }

        axiosPostJsonBody(distUrl, center_submit_model.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                center_submit_model.value.visible = false;
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
    manageEmployeeId: null,
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
        "/api/biz/wms/houseCenter/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            storeWare: form_query_data.value.storeWare,
            storeMaterial: form_query_data.value.storeMaterial,
            status: form_query_data.value.status,
            phone: form_query_data.value.phone,
            manageEmployeeId: form_query_data.value.manageEmployeeId
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
                <t-form-item label="中心电话" name="中心电话">
                    <t-input v-model="form_query_data.phone" :clearable="true"></t-input>
                </t-form-item>
                <t_form_item_employee
                    label="负责人员"
                    v-model="form_query_data.manageEmployeeId"
                    :showFilter="true"
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
        </div></t-card
    >
    <t-card header-bordered :style="{ margin: '5px' }" id="data_table">
        <template #header>
            <div>
                <t-button theme="primary" variant="outline" @click="onShowStoreCenterAdd()">
                    <template #icon><AddIcon /></template>
                    仓库中心
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
        id="center_submit_model"
        v-model:visible="center_submit_model.visible"
        header="中心信息"
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
            :rules="center_submit_model.rules"
            :data="center_submit_model.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitStoreCenter"
        >
            <t-form-item label="名称" name="主体名称" help="*必填">
                <t-input placeholder="名称" v-model="center_submit_model.submitData.title" />
            </t-form-item>
            <t-form-item label="联系电话" name="联系电话" help="选填">
                <t-input placeholder="联系电话" v-model="center_submit_model.submitData.phone" />
            </t-form-item>
            <t-form-item label="联系邮箱" name="联系邮箱" help="选填">
                <t-input placeholder="联系邮箱" v-model="center_submit_model.submitData.email" />
            </t-form-item>
            <t_form_item_employee
                label="中心负责人"
                help="*必填"
                v-model="center_submit_model.submitData.manageEmployeeId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :externalOption="[{ id: -1, title: '### 无负责人员 ###' }]"
            />
            <t-form-item label="中心地址" name="中心地址" help="选填, 该地址直接作为收发地址">
                <t-input placeholder="中心地址" v-model="center_submit_model.submitData.address" />
            </t-form-item>
            <form_enum_radio_group
                label="接单再分"
                help="*必填, 是否统一接收入库单再分，业务人员可直接提交到该中心"
                v-model="center_submit_model.submitData.applyDepositFlag"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.yesOrNo"
            />
            <t_form_item_position_list
                label="库管岗位"
                help="*必填, 该岗位人员负责确认审核入库单(库调)及取消、审批、执行等动作"
                v-model="center_submit_model.submitData.stockManagePositionId"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <form_enum_radio_group
                label="是否启用"
                help="*必填"
                v-model="center_submit_model.submitData.status"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="center_submit_model.submitData.remark" />
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
