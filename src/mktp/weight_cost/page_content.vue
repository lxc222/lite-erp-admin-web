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

import form_enum_list from "@/components/form_enum_list.vue";
import t_form_item_mkp_weight_cost_standard from "@/components/mktp/t_form_item_mkp_weight_cost_standard.vue";

const table_columns = [
    { colKey: "id", title: "#ID", width: "80px" },
    { colKey: "vehiclePlateNo", title: "车牌号码" },
    {
        colKey: "receiptNo",
        title: "单据"
    },
    {
        colKey: "weightKG",
        title: "称重重量(KG)",
        align: "right",
        cell: (h, { row }) => {
            return <span>{row.weightKG} KG</span>;
        }
    },
    {
        colKey: "costPrice",
        title: "收费金额",
        align: "right",
        cell: (h, { row }) => {
            return <span class="table_column_money">￥{row.costPrice}</span>;
        }
    },
    {
        colKey: "nullifyAction",
        title: "删除操作",
        cell: (h, { row }) => {
            return (
                <span style="color:gray;font-style:italic;">
                    {row.nullifyAction} {row.nullifyRemark}
                </span>
            );
        }
    },
    { colKey: "remark", title: "备注" },
    { colKey: "createAction", title: "创建操作" },
    { colKey: "updateAction", title: "最后修改" },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const cost_submit_data = ref({
    visible: false,
    submitData: {
        id: null,
        vehiclePlateNo: null,
        weightKG: null,
        costStandardId: null,
        costPrice: null,
        remark: null
    },
    rules: {
        vehiclePlateNo: [
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

function onChangeCostStandard(standardType) {
    // console.log("onChangeCostStandard", wareUnitId, standardType);
}

function onShowTableLineMenu(row) {
    if (!row.nullifyAccountId) {
        return true;
    } else {
        return false;
    }
}

function onBuildTableLineMenu(row) {
    let menus = [];

    if (!row.nullifyAccountId) {
        menus.push({ content: "打印票据", value: row.id, divider: true });
        menus.push({ content: "作废记录", value: row, divider: true });
    }

    return menus;
}

const onTableLineMenuHandler = data => {
    if ("作废记录" === data.content) {
        onCostShowDelDlg(data.value);
    } else if ("打印票据" === data.content) {
        onPrintCost(data.value);
    }
};

function onCostShowAddDlg() {
    cost_submit_data.value.submitData = {};
    cost_submit_data.value.visible = true;
}

const delete_submit_model = ref({
    visible: false,
    submitData: {
        itemId: null,
        remark: null
    }
});

function onCostShowDelDlg(row) {
    if (!row || (row.nullifyAccountId && row.nullifyAccountId > 0)) {
        MessagePlugin.error({
            content: "记录已删除",
            duration: 3000,
            closeBtn: true,
            placement: "center",
            onClose: function () {}
        });

        return;
    }

    delete_submit_model.value.submitData = {};
    delete_submit_model.value.submitData.itemId = row.id;
    delete_submit_model.value.visible = true;
}

const onSubmitDeleteData = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/mktp/weightCost/delById";

        axiosPostJsonBody(distUrl, delete_submit_model.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                delete_submit_model.value.visible = false;
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

const onCountCost = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/mktp/weightCost/countCost";

        axiosPostJsonBody(distUrl, cost_submit_data.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                let countRst = response.data.data;
                // console.log(countRst);
                onSubmitCost(countRst.reqId, countRst.costPrice);
            }
        });
    } else {
        // console.log("Validate Errors: ", firstError, validateResult);
        MessagePlugin.error(firstError);
    }
};

function onSubmitCost(uuid, price) {
    const confirmDia = DialogPlugin.confirm({
        header: "提交计费记录",
        body: "确认已收费 ￥" + price + " ?",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();
            let distUrl = "/api/biz/mktp/weightCost/submitCost";

            axiosPostJson(distUrl, { reqId: uuid, costPrice: price }, function (response) {
                if (!isAjaxRspSucc(response)) {
                    MessagePlugin.error({
                        content: response.data.tipMsg,
                        duration: 3000,
                        closeBtn: true,
                        placement: "center",
                        onClose: function () {}
                    });
                } else {
                    cost_submit_data.value.visible = false;
                    // MessagePlugin.info({
                    //     content: response.data.data,
                    //     duration: 3000,
                    //     closeBtn: true,
                    //     placement: "center",
                    //     onClose: function () {}
                    // } );

                    onPrintCost(response.data.data);
                }
            });
        },
        onClose: ({ e, trigger }) => {
            confirmDia.hide();
        }
    });
}

const onPrintCost = costId => {
    let distUrl = "/api/biz/mktp/weightCost/printById";

    axiosPostJson(distUrl, { itemId: costId }, function (response) {
        if (!isAjaxRspSucc(response)) {
            MessagePlugin.error({
                content: response.data.tipMsg,
                duration: 3000,
                closeBtn: true,
                placement: "center",
                onClose: function () {}
            });
        } else {
            window.open("/web/open/erp/printPdfL190W93?reqId=" + response.data.data);
        }
    });
};

const form_query_data = ref({
    vehicleNo: null,
    receiptNo: null,
    deleteStatus: null,
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
        "/api/biz/mktp/weightCost/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            vehicleNo: form_query_data.value.vehicleNo,
            receiptNo: form_query_data.value.receiptNo,
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
                <t-form-item label="车牌号码" name="车牌号码">
                    <t-input v-model="form_query_data.vehicleNo" :clearable="true"></t-input>
                </t-form-item>
                <t-form-item label="单据编号" name="单据编号">
                    <t-input v-model="form_query_data.receiptNo" :clearable="true"></t-input>
                </t-form-item>
                <form_enum_list
                    label="是否删除"
                    v-model="form_query_data.deleteStatus"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.yesOrNo"
                    widthPx="160"
                />
                <t-button theme="primary" type="submit">开始查询</t-button>
            </t-form>
        </div></t-card
    >
    <t-card header-bordered :style="{ margin: '5px' }" id="data_table">
        <template #header>
            <div>
                <t-button theme="primary" variant="outline" @click="onCostShowAddDlg()">
                    <template #icon><AddIcon /></template>
                    过秤记录
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
                @onChange="onQueryFormData(false)"
                @current-change="onQueryFormData(false)"
                @page-size-change="onQueryFormData(false)"
                showFirstAndLastPageBtn
            />
        </template>
    </t-card>
    <t-dialog
        id="cost_submit_data"
        v-model:visible="cost_submit_data.visible"
        header="过秤收费"
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
            :rules="cost_submit_data.rules"
            :data="cost_submit_data.submitData"
            requiredMarkPosition="right"
            @submit="onCountCost"
        >
            <t-form-item label="车牌号码" name="车牌号码">
                <t-input
                    placeholder="车牌号码"
                    v-model="cost_submit_data.submitData.vehiclePlateNo"
                />
            </t-form-item>
            <t_form_item_mkp_weight_cost_standard
                label="计费标准"
                help="*必填"
                v-model="cost_submit_data.submitData.costStandardId"
                @change="onChangeCostStandard"
            />
            <t-form-item label="称重重量" name="称重重量" help="*必填">
                <t-input
                    placeholder="称重重量"
                    v-model="cost_submit_data.submitData.weightKG"
                    suffix="KG"
                />
            </t-form-item>
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="cost_submit_data.submitData.remark" />
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
        id="delete_submit_model"
        v-model:visible="delete_submit_model.visible"
        header="作废记录"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
    >
        <t-form
            :data="delete_submit_model.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitDeleteData"
        >
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="delete_submit_model.submitData.remark" />
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
