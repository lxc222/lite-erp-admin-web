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
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

import form_enum_list from "@/components/form_enum_list.vue";
import t_form_item_merchant from "@/components/md/t_form_item_merchant.vue";
import t_form_item_mkp_gate from "@/components/mktp/t_form_item_mkp_gate.vue";
import t_form_item_mkp_ware from "@/components/mktp/t_form_item_mkp_ware.vue";
import t_form_item_mkp_admission_cost_standard from "@/components/mktp/t_form_item_mkp_admission_cost_standard.vue";
import t_form_item_mkp_ware_unit from "@/components/mktp/t_form_item_mkp_ware_unit.vue";
import t_form_item_mkp_ware_catalog_cascader from "@/components/mktp/t_form_item_mkp_ware_catalog_cascader.vue";

const table_line_expanded_row_keys = ref([""]);

const onTableLineExpandChange = (value, params) => {
    table_line_expanded_row_keys.value = value;
    // console.log("onTableLineExpandChange", value, params);
};

const onTableLineExpandedViewTpl = (h, { row }) => (
    <div>
        <div class="more-detail">
            <p class="content">
                <b>【计费标准】</b>
                {row.costStandardTitle}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【入场收费】</b>￥{row.enterWareCost}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【出场收费】</b>￥{row.exitWareCost}
            </p>
        </div>
        <div class="more-detail">
            <p class="content">
                <b>【ID】</b>
                {row.id}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【创建操作】</b>
                {row.createAction}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【最后修改】</b>
                {row.updateAction}
            </p>
        </div>
    </div>
);

const table_columns = [
    { colKey: "vehicleNo", title: "车牌号码", width: "130" },
    {
        colKey: "merchantTitle",
        title: "商户",
        width: "150",
        cell: (h, { row }) => {
            return <span>{row.merchantTitle}</span>;
        }
    },
    {
        colKey: "wareUnitNum",
        title: "入场货品",
        width: "120",
        cell: (h, { row }) => {
            let jsx = [];
            jsx.push(<span>{row.wareTitle}</span>);
            jsx.push(<p class="my_p_divider" />);
            jsx.push(
                <span>
                    {row.wareUnitNum} {row.wareUnitTitle}
                </span>
            );
            return jsx;
        }
    },
    {
        colKey: "wareActualCost",
        title: "管理费用",
        align: "right",
        width: "100px",
        cell: (h, { row }) => {
            return <span class="table_column_money">￥{row.wareActualCost}</span>;
        }
    },
    {
        colKey: "enterReceiptNo",
        title: "入场信息",
        cell: (h, { row }) => {
            let jsx = [];

            jsx.push(<span>【单据】{row.enterReceiptNo}</span>);

            jsx.push(<p class="my_p_divider" />);
            jsx.push(<span>【门岗】{row.enterGateTitle}</span>);

            jsx.push(<p class="my_p_divider" />);
            jsx.push(
                <span>
                    【数量】{row.enterWareUnitNum} {row.wareUnitTitle}
                </span>
            );

            jsx.push(<p class="my_p_divider" />);
            jsx.push(
                <span>
                    【收费】<span class="table_column_money">￥{row.enterWareCost}</span>
                </span>
            );

            jsx.push(<p class="my_p_divider" />);
            jsx.push(<span>【操作】{row.enterAction}</span>);

            return jsx;
        }
    },
    {
        colKey: "exitReceiptNo",
        title: "出场信息",
        cell: (h, { row }) => {
            if (row.exitCreateAccountId) {
                let jsx = [];

                jsx.push(<span>【单据】{row.exitReceiptNo}</span>);

                jsx.push(<p class="my_p_divider" />);
                jsx.push(<span>【门岗】{row.exitGateTitle}</span>);

                jsx.push(<p class="my_p_divider" />);
                jsx.push(
                    <span>
                        【数量】{row.exitWareUnitNum} {row.wareUnitTitle}
                    </span>
                );

                jsx.push(<p class="my_p_divider" />);
                jsx.push(
                    <span>
                        【收费】<span class="table_column_money">￥{row.exitWareCost}</span>
                    </span>
                );

                jsx.push(<p class="my_p_divider" />);
                jsx.push(<span>【操作】{row.exitAction}</span>);

                return jsx;
            } else {
                return <span></span>;
            }
        }
    },
    {
        colKey: "nullifyAction",
        title: "删除操作",
        width: "120",
        cell: (h, { row }) => {
            return (
                <span style="color:gray;font-style:italic;">
                    {row.nullifyAction} {row.nullifyRemark}
                </span>
            );
        }
    },
    { colKey: "remark", title: "备注", width: "120" },
    // { colKey: "createAction", title: "创建操作" },
    // { colKey: "updateAction", title: "最后修改", width: "100px" },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const enter_submit_model = ref({
    visible: false,
    cost_standard_type: null,
    submitData: {
        id: null,
        enterGateId: null,
        vehicleNo: null,
        merchantId: null,
        costStandardId: null,
        wareId: null,
        wareUnitId: null,
        enterWareUnitNum: null,
        exitWareUnitNum: null,
        enterRemark: null
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

function onEnterShowDlg() {
    enter_submit_model.value.submitData = {};
    enter_submit_model.value.visible = true;
}
const onEnterCount = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/mktp/wareAdmission/enterCount";

        axiosPostJsonBody(distUrl, enter_submit_model.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                let countRst = response.data.data;
                // console.log(countRst);
                onEnterSubmit(countRst.reqId, countRst.cost);
            }
        });
    } else {
        // console.log("Validate Errors: ", firstError, validateResult);
        MessagePlugin.error(firstError);
    }
};

function onEnterSubmit(uuid, price) {
    const confirmDia = DialogPlugin.confirm({
        header: "提交计费",
        body: "确认已收费 ￥" + price + " ?",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();

            let distUrl = "/api/biz/mktp/wareAdmission/enter";

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
                    enter_submit_model.value.visible = false;
                    MessagePlugin.info({
                        content: response.data.data,
                        duration: 3000,
                        closeBtn: true,
                        placement: "center",
                        onClose: function () {}
                    });
                }
            });
        },
        onClose: ({ e, trigger }) => {
            confirmDia.hide();
        }
    });
}

const exit_submit_model = ref({
    visible: false,
    submitData: {
        exitGateId: null,
        enterReceiptNo: null,
        exitWareUnitNum: null,
        exitRemark: null
    }
});

function onExitShowDlg(row) {
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

    if (!row || (row.exitCreateAccountId && row.exitCreateAccountId > 0)) {
        MessagePlugin.error({
            content: "记录已出场",
            duration: 3000,
            closeBtn: true,
            placement: "center",
            onClose: function () {}
        });

        return;
    }

    exit_submit_model.value.submitData = {};
    axiosPostJson(
        "/api/biz/mktp/wareAdmission/oneById",
        {
            itemId: row.id
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                exit_submit_model.value.submitData.enterReceiptNo =
                    response.data.data.enterReceiptNo;
                exit_submit_model.value.visible = true;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}
const onExitCount = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/mktp/wareAdmission/exitCount";

        axiosPostJsonBody(distUrl, exit_submit_model.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                let countRst = response.data.data;
                // console.log(countRst);
                onExitSubmit(countRst.reqId, countRst.cost);
            }
        });
    } else {
        // console.log("Validate Errors: ", firstError, validateResult);
        MessagePlugin.error(firstError);
    }
};

function onExitSubmit(uuid, price) {
    const confirmDia = DialogPlugin.confirm({
        header: "提交计费",
        body: "确认已收费 ￥" + price + " ?",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();

            let distUrl = "/api/biz/mktp/wareAdmission/exit";

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
                    exit_submit_model.value.visible = false;
                    MessagePlugin.info({
                        content: response.data.data,
                        duration: 3000,
                        closeBtn: true,
                        placement: "center",
                        onClose: function () {}
                    });
                }
            });
        },
        onClose: ({ e, trigger }) => {
            confirmDia.hide();
        }
    });
}

function onChangeCostStandard(wareUnitId, standardType) {
    // console.log("onChangeCostStandard", wareUnitId, standardType);
    if (enter_submit_model.value.submitData.costStandardId) {
        enter_submit_model.value.submitData.wareUnitId = wareUnitId;
        enter_submit_model.value.cost_standard_type = standardType;
    }
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
        if (!row.exitCreateAccountId) {
            menus.push({ content: "出场登记", value: row, divider: true });
        }

        menus.push({ content: "作废记录", value: row, divider: true });
    }

    return menus;
}

const onTableLineMenuHandler = data => {
    if ("出场登记" === data.content) {
        onExitShowDlg(data.value);
    } else if ("作废记录" === data.content) {
        onDeleteShowDlg(data.value);
    }
};

const delete_submit_model = ref({
    visible: false,
    submitData: {
        itemId: null,
        remark: null
    }
});

function onDeleteShowDlg(row) {
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

const onDeleteSubmit = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/mktp/wareAdmission/delById";

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

const form_query_data = ref({
    vehicleNo: null,
    wareId: null,
    wareUnitId: null,
    categoryId: null,
    enterGateId: null,
    exitGateId: null,
    enterReceiptNo: null,
    deleteStatus: null,
    exitStatus: null,
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
        "/api/biz/mktp/wareAdmission/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            vehicleNo: form_query_data.value.vehicleNo,
            merchantId: form_query_data.value.merchantId,
            categoryId: form_query_data.value.categoryId,
            wareId: form_query_data.value.wareId,
            wareUnitId: form_query_data.value.wareUnitId,
            deleteStatus: form_query_data.value.deleteStatus,
            enterReceiptNo: form_query_data.value.enterReceiptNo,
            enterGateId: form_query_data.value.enterGateId,
            exitGateId: form_query_data.value.exitGateId,
            exitStatus: form_query_data.value.exitStatus
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
                <t_form_item_mkp_ware_catalog_cascader
                    label="货品类目"
                    v-model="form_query_data.categoryId"
                    @change="form_query_data.wareId = null"
                    :checkStrictly="true"
                    :showFilter="true"
                />
                <t_form_item_mkp_ware
                    label="入场货品"
                    v-model="form_query_data.wareId"
                    :catalogId="form_query_data.categoryId"
                    :showFilter="true"
                />
                <t_form_item_mkp_ware_unit
                    label="入场单位"
                    v-model="form_query_data.wareUnitId"
                    :showFilter="true"
                />

                <t-form-item label="车牌号码" name="车牌号码">
                    <t-input v-model="form_query_data.vehicleNo" :clearable="true"></t-input>
                </t-form-item>
                <t-form-item label="入场单据" name="入场单据">
                    <t-input v-model="form_query_data.enterReceiptNo" :clearable="true"></t-input>
                </t-form-item>
                <t_form_item_merchant
                    label="关联商户"
                    v-model="form_query_data.merchantId"
                    :showFilter="true"
                />
                <t_form_item_mkp_gate
                    label="入场门岗"
                    v-model="form_query_data.enterGateId"
                    :showFilter="true"
                />
                <t_form_item_mkp_gate
                    label="出场门岗"
                    v-model="form_query_data.exitGateId"
                    :showFilter="true"
                />
                <form_enum_list
                    label="是否出场"
                    v-model="form_query_data.exitStatus"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.yesOrNo"
                    widthPx="160"
                />
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
                <t-button theme="primary" variant="outline" @click="onEnterShowDlg()">
                    <template #icon><AddIcon /></template>
                    入场记录
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
        id="enter_submit_model"
        v-model:visible="enter_submit_model.visible"
        header="入场管理收费"
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
            :rules="enter_submit_model.rules"
            :data="enter_submit_model.submitData"
            requiredMarkPosition="right"
            @submit="onEnterCount"
        >
            <t-form-item label="车牌号码" name="车牌号码">
                <t-input placeholder="备注信息" v-model="enter_submit_model.submitData.vehicleNo" />
            </t-form-item>
            <t_form_item_mkp_gate
                label="入场门岗"
                v-model="enter_submit_model.submitData.enterGateId"
                help="*必填"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <t_form_item_merchant
                label="内部商户"
                help="*必填"
                v-model="enter_submit_model.submitData.merchantId"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <t_form_item_mkp_ware
                label="入场货品"
                help="*必填"
                v-model="enter_submit_model.submitData.wareId"
            />
            <t_form_item_mkp_admission_cost_standard
                label="计费标准"
                help="*必填"
                v-model="enter_submit_model.submitData.costStandardId"
                @change="onChangeCostStandard"
            />
            <t_form_item_mkp_ware_unit
                label="计费单位"
                help="*必填"
                v-model="enter_submit_model.submitData.wareUnitId"
                :disabled="true"
            />
            <t-form-item
                label="入场数量"
                name="入场数量"
                help="*必填"
                v-show="
                    enter_submit_model.cost_standard_type ==
                    globalConstDef.mktpAdmissionCostType.Quantity
                "
            >
                <t-input
                    placeholder="入场数量"
                    v-model="enter_submit_model.submitData.enterWareUnitNum"
                />
            </t-form-item>
            <t-form-item
                label="出场数量"
                name="出场数量"
                help="非*必填，如填写则等同于直接出场"
                v-show="
                    enter_submit_model.cost_standard_type ==
                    globalConstDef.mktpAdmissionCostType.Quantity
                "
            >
                <t-input
                    placeholder="出场数量"
                    v-model="enter_submit_model.submitData.exitWareUnitNum"
                />
            </t-form-item>
            <t-form-item label="备注信息" name="备注信息">
                <t-input
                    placeholder="备注信息"
                    v-model="enter_submit_model.submitData.enterRemark"
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
    <t-dialog
        id="exit_submit_model"
        v-model:visible="exit_submit_model.visible"
        header="出场管理收费"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
    >
        <t-form
            :rules="exit_submit_model.rules"
            :data="exit_submit_model.submitData"
            requiredMarkPosition="right"
            @submit="onExitCount"
        >
            <t_form_item_mkp_gate
                label="出场门岗"
                v-model="exit_submit_model.submitData.exitGateId"
                help="*必填"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <t-form-item label="出场数量" name="出场数量" help="*必填">
                <t-input
                    placeholder="出场数量"
                    v-model="exit_submit_model.submitData.exitWareUnitNum"
                />
            </t-form-item>
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="exit_submit_model.submitData.exitRemark" />
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
            @submit="onDeleteSubmit"
        >
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="delete_submit_model.submitData.remark" />
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
