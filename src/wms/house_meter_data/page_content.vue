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
import t_form_item_house_center_list from "@/components/wms/t_form_item_house_center_list.vue";
import t_form_item_wms_house_list from "@/components/wms/t_form_item_wms_house_list.vue";
import t_form_item_wms_cost_item from "@/components/wms/t_form_item_wms_cost_item.vue";

const datePresets = ref({
    昨天: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    今天: dayjs().format("YYYY-MM-DD")
});

const table_columns = [
    { colKey: "id", title: "#ID", width: 100 },
    { colKey: "houseTitle", title: "仓库" },
    {
        colKey: "renterTitle",
        title: "内部商户"
    },
    {
        colKey: "costItemTitle",
        title: "费用科目",
        width: 110
    },
    {
        colKey: "copyMeterDate",
        title: "抄表日期",
        width: 110,
        align: "right",
        cell: (h, { row }) => {
            return <span style="font-style:italic;">{row.copyMeterDate}</span>;
        }
    },
    {
        colKey: "meterData",
        title: "本轮读数",
        align: "right",
        cell: (h, { row }) => {
            return <span class="table_column_money">{row.meterData}</span>;
        },
        width: 100
    },
    { colKey: "actionStr", title: "复位操作？" },
    {
        colKey: "nullifyAction",
        title: "删除操作",
        width: 120,
        cell: (h, { row }) => {
            if (row.nullifyAction) {
                return (
                    <span style="font-style:italic;color:red;">
                        {row.nullifyAction} / {row.nullifyRemark}
                    </span>
                );
            } else {
                return <span></span>;
            }
        }
    },
    { colKey: "remark", title: "备注" },
    { colKey: "createAction", title: "创建操作", width: 120 },
    { colKey: "updateAction", title: "最后修改", width: 120 },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const meter_del_submit_data = ref({
    visible: false,
    itemId: null,
    remark: ""
});

async function onShowDelDlg(editId, house_id) {
    meter_del_submit_data.value = {
        visible: true,
        itemId: editId,
        houseId: house_id
    };
}

const meter_add_submit_data = ref({
    visible: false,
    addMode: false,
    submitData: {
        id: null,
        centerId: null,
        houseId: null,
        renterId: null,
        costItemId: null,
        copyMeterDate: null,
        meterData: null,
        resetMeterData: null,
        remark: null
    },
    rules: {
        houseId: [
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
    meter_add_submit_data.value.submitData = {};
    meter_add_submit_data.value.visible = true;
    meter_add_submit_data.value.addMode = true;
}

async function onShowCopyAddDlg(editId) {
    meter_add_submit_data.value.submitData = {};
    meter_add_submit_data.value.addMode = true;
    axiosPostJson(
        "/api/biz/wms/houseMeterData/oneById",
        {
            itemId: editId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                meter_add_submit_data.value.submitData = response.data.data;
                meter_add_submit_data.value.submitData.resetMeterData = globalConstDef.yesOrNo.No;
                meter_add_submit_data.value.submitData.meterData = null;
                meter_add_submit_data.value.submitData.copyMeterDate = null;
                meter_add_submit_data.value.submitData.remark = null;
                meter_add_submit_data.value.visible = true;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

async function onSubmitDel() {
    axiosPostJson(
        "/api/biz/wms/houseMeterData/delById",
        {
            itemId: meter_del_submit_data.value.itemId,
            houseId: meter_del_submit_data.value.houseId,
            remark: meter_del_submit_data.value.remark
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                meter_del_submit_data.value.visible = false;
                MessagePlugin.success({
                    content: response.data.data,
                    duration: 2000,
                    closeBtn: true,
                    placement: "center",
                    onClose: function () {}
                });
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

function onShowTableLineMenu(row) {
    return true;
}

function onBuildTableLineMenu(row) {
    let menus = [];

    menus.push({ content: "补充添加", value: row, divider: true });

    if (!row.nullifyAccountId || row.nullifyAccountId < 1) {
        menus.push({ content: "作废记录", value: row, divider: true });
    }

    return menus;
}

const onTableLineMenuHandler = data => {
    if ("补充添加" === data.content) {
        onShowCopyAddDlg(data.value.id);
    } else if ("作废记录" === data.content) {
        onShowDelDlg(data.value.id, data.value.houseId);
    }
};

const onSubmitData = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/wms/houseMeterData/add";

        axiosPostJsonBody(distUrl, meter_add_submit_data.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                meter_add_submit_data.value.visible = false;
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
    deleteStatus: null,
    centerId: null,
    costItemId: null,
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
        "/api/biz/wms/houseMeterData/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            centerId: form_query_data.value.centerId,
            costItemId: form_query_data.value.costItemId,
            deleteStatus: form_query_data.value.deleteStatus
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
                <t_form_item_house_center_list
                    label="仓库中心"
                    v-model="form_query_data.centerId"
                    :showFilter="true"
                />
                <t_form_item_wms_cost_item
                    label="费用科目"
                    v-model="form_query_data.costItemId"
                    :showFilter="true"
                />
                <form_enum_list
                    label="是否删除"
                    v-model="form_query_data.deleteStatus"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.yesOrNo"
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
                    抄表录入
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
                    :options="onBuildTableLineMenu(row)"
                    @click="onTableLineMenuHandler"
                    v-if="onShowTableLineMenu(row)"
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
        id="meter_add_submit_data"
        v-model:visible="meter_add_submit_data.visible"
        header="抄表信息"
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
            :rules="meter_add_submit_data.rules"
            :data="meter_add_submit_data.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitData"
        >
            <t_form_item_house_center_list
                label="仓库中心"
                help="*必填"
                v-model="meter_add_submit_data.submitData.centerId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                @change="meter_add_submit_data.submitData.houseId = null"
                :disabled="!meter_add_submit_data.addMode"
            />
            <t_form_item_wms_house_list
                label="直租仓库"
                help="*必填"
                v-model="meter_add_submit_data.submitData.houseId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :houseType="globalConstDef.wmsHouseType.MerchantPrivate.toString()"
                :centerId="meter_add_submit_data.submitData.centerId"
                :disabled="!meter_add_submit_data.addMode"
            />
            <t_form_item_wms_cost_item
                label="费用科目"
                help="*必填"
                v-model="meter_add_submit_data.submitData.costItemId"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <t-form-item label="抄表日期" name="抄表日期" help="*必填，实际真实抄表日期">
                <t-date-picker
                    placeholder="抄表日期"
                    v-model="meter_add_submit_data.submitData.copyMeterDate"
                    :presets="datePresets"
                />
            </t-form-item>
            <t-form-item label="抄表读值" name="抄表读值" help="*必填，本次度数必须高于上次度数">
                <t-input
                    placeholder="抄表读值"
                    v-model="meter_add_submit_data.submitData.meterData"
                />
            </t-form-item>
            <form_enum_radio_group
                label="是否复位"
                help="*必填，复位操作不会自动产生费用单"
                v-model="meter_add_submit_data.submitData.resetMeterData"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.yesOrNo"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="meter_add_submit_data.submitData.remark" />
            </t-form-item>
            <t-form-item>
                <t-space size="small">
                    <t-button theme="default" variant="base" type="reset">重置</t-button>
                    <t-button theme="primary" type="submit">提交</t-button>
                </t-space>
            </t-form-item>
        </t-form>
    </t-dialog>
    <t-dialog
        id="meterDeleteDlg"
        v-model:visible="meter_del_submit_data.visible"
        header="作废记录"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
    >
        <t-form :data="meter_del_submit_data" requiredMarkPosition="right" @submit="onSubmitDel">
            <t-form-item label="删除原因" name="删除原因">
                <t-input placeholder="请补充删除原因" v-model="meter_del_submit_data.remark" />
            </t-form-item>
            <t-form-item>
                <t-space size="small">
                    <t-button theme="primary" type="submit">提交</t-button>
                </t-space>
            </t-form-item>
        </t-form>
    </t-dialog>
</template>

<style scoped></style>
