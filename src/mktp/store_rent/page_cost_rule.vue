<script setup lang="jsx">
import { ref, watch, onMounted } from "vue";

const thisModel = defineModel();

import { AddIcon, SearchIcon } from "tdesign-icons-vue-next";
import { MessagePlugin, DialogPlugin } from "tdesign-vue-next";

import {
    axiosPostJson,
    axiosPostJsonBody,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

import form_enum_list from "@/components/form_enum_list.vue";
import t_form_item_mkp_cost_item from "@/components/mktp/t_form_item_mkp_cost_item.vue";

import enable_status_tag from "@/components/enable_status_tag.vue";

const datePresets = ref({
    昨天: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    今天: dayjs().format("YYYY-MM-DD")
});

const cost_rule_pageData = ref({
    houseId: null,
    ruleList: []
});

async function onLoadCostRuleList() {
    cost_rule_pageData.value.houseId = thisModel.value.houseId;

    axiosPostJsonBody(
        "/api/biz/mktp/storeCostRule/list",
        {
            houseId: cost_rule_pageData.value.houseId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                cost_rule_pageData.value.ruleList = response.data.data;

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
}

const cost_rule_submit_data = ref({
    visible: false,
    addMode: false,
    submitData: {
        id: null,
        migrateId: null,
        houseId: null,
        costItemId: null,
        chargeBeginDate: null,
        chargeEndDate: null,
        costRuleType: null,
        circleType: null,
        circleNum: null,
        circlePrice: null,
        quantityPrice: null,
        status: null,
        remark: null
    },
    rules: {}
});

function onShowCostRuleAdd() {
    cost_rule_pageData.value.houseId = thisModel.value.houseId;

    cost_rule_submit_data.value.visible = true;
    cost_rule_submit_data.value.addMode = true;
    cost_rule_submit_data.value.submitData = { houseId: cost_rule_pageData.value.houseId };
}

watch(
    thisModel,
    (newVal, oldVal) => {
        // console.log("watch: ", newVal);
        const view = newVal.view;
        if (view) {
            const watchHouseId = newVal.houseId;
            if (watchHouseId && watchHouseId > 0) {
                cost_rule_pageData.value.houseId = watchHouseId;
                cost_rule_pageData.value.ruleList = [];
                onLoadCostRuleList();
            } else {
                MessagePlugin.error({
                    content: "请选择商铺",
                    duration: 3000,
                    closeBtn: true,
                    placement: "center",
                    onClose: function () {}
                });
            }
        }
    },
    { immediate: true }
);

const onSubmitCostRule = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/mktp/storeCostRule/add";
        axiosPostJsonBody(distUrl, cost_rule_submit_data.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                cost_rule_submit_data.value.visible = false;
                MessagePlugin.info({
                    content: response.data.data,
                    duration: 3000,
                    closeBtn: true,
                    placement: "center",
                    onClose: function () {}
                });

                onLoadCostRuleList();
            }
        });
    } else {
        // console.log("Validate Errors: ", firstError, validateResult);
        MessagePlugin.error(firstError);
    }
};

function buildCircleTypeStr(row) {
    if (row.costRuleType == globalConstDef.mktpStoreCostRuleType.CircleWhole) {
        return "￥单价 x " + row.circleTypeStr + " x " + row.circleNum;
    } else if (row.costRuleType == globalConstDef.mktpStoreCostRuleType.CircleSqual) {
        return "￥单价 x " + row.circleTypeStr + " x " + row.circleNum + " x 面积";
    } else {
        return "￥单价 x 用量";
    }
}

const table_columns = [
    { colKey: "id", title: "#ID", width: "80px" },
    {
        colKey: "houseName",
        title: "商铺",
        cell: (h, { row }) => {
            return (
                <span>
                    {row.centerName}/{row.houseName}
                </span>
            );
        }
    },
    { colKey: "costItemName", title: "费用科目" },
    {
        colKey: "chargeBeginDate",
        title: "计费时段",
        cell: (h, { row }) => {
            if (
                row.costRuleType == globalConstDef.mktpStoreCostRuleType.CircleWhole ||
                row.costRuleType == globalConstDef.mktpStoreCostRuleType.CircleSqual
            ) {
                return (
                    <span style="font-style:italic;">
                        {row.chargeBeginDate} - {row.chargeEndDate}
                    </span>
                );
            } else {
                return <span> </span>;
            }
        }
    },
    {
        colKey: "costRuleTypeStr",
        title: "计费方案",
        cell: (h, { row }) => {
            return (
                <span>
                    [规则] {row.costRuleTypeStr}
                    <p class="my_p_divider" />
                    [计费] {buildCircleTypeStr(row)}
                </span>
            );
        }
    },
    {
        colKey: "circlePrice",
        title: "计费单价",
        width: 150,
        cell: (h, { row }) => {
            if (row.costRuleType == globalConstDef.mktpStoreCostRuleType.CircleWhole) {
                return (
                    <span class="table_column_money">
                        ￥{row.circlePrice} / {row.circleTypeStr}
                    </span>
                );
            } else if (row.costRuleType == globalConstDef.mktpStoreCostRuleType.CircleSqual) {
                return (
                    <span class="table_column_money">
                        ￥{row.circlePrice} / {row.circleTypeStr} / 平方
                    </span>
                );
            } else {
                return <span class="table_column_money">￥{row.quantityPrice} / 单位</span>;
            }
        }
    },
    { colKey: "nextCircleBeginDate", title: "下次计费起始" },
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

function doBuildableLineMenu(row) {
    let result = [{ content: "删除规则", value: row, divider: true }];

    if (row.status == globalConstDef.enableModel.Enabled) {
        result.push({ content: "停用规则", value: row, divider: true });
    }

    if (row.status == globalConstDef.enableModel.Disabled) {
        result.push({ content: "启用规则", value: row, divider: true });
    }

    return result;
}

async function onEnableCostRule(houseId, id) {
    cost_rule_submit_data.value.submitData = {};
    cost_rule_submit_data.value.addMode = false;
    axiosPostJson(
        "/api/biz/mktp/storeCostRule/oneById",
        {
            houseId: houseId,
            itemId: id
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                cost_rule_submit_data.value.submitData = response.data.data;
                cost_rule_submit_data.value.submitData.migrateId = id;
                cost_rule_submit_data.value.visible = true;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

function onDisableCostRule(houseId, id) {
    const confirmDia = DialogPlugin.confirm({
        header: "停用规则",
        body: "停用后请继续处理相关费用，请确认？",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();

            axiosPostJson(
                "/api/biz/mktp/storeCostRule/disableById",
                {
                    itemId: id,
                    houseId: houseId
                },
                function (response) {
                    if (!isAjaxRspSucc(response)) {
                        MessagePlugin.error({
                            content: response.data.tipMsg,
                            duration: 3000,
                            closeBtn: true,
                            placement: "center"
                        });
                    } else {
                        MessagePlugin.error({
                            content: response.data.data,
                            duration: 3000,
                            closeBtn: true,
                            placement: "center"
                        });

                        onLoadCostRuleList();
                    }
                }
            );
        },
        onClose: ({ e, trigger }) => {
            confirmDia.hide();
        }
    });
}

function onDelCostRule(houseId, id) {
    const confirmDia = DialogPlugin.confirm({
        header: "删除规则",
        body: "删除后请继续处理相关费用，请确认？",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();

            axiosPostJson(
                "/api/biz/mktp/storeCostRule/delById",
                {
                    itemId: id,
                    houseId: houseId
                },
                function (response) {
                    if (!isAjaxRspSucc(response)) {
                        MessagePlugin.error({
                            content: response.data.tipMsg,
                            duration: 3000,
                            closeBtn: true,
                            placement: "center"
                        });
                    } else {
                        MessagePlugin.error({
                            content: response.data.data,
                            duration: 3000,
                            closeBtn: true,
                            placement: "center"
                        });

                        onLoadCostRuleList();
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
    if ("删除规则" === data.content) {
        onDelCostRule(data.value.houseId, data.value.id);
    } else if ("停用规则" === data.content) {
        onDisableCostRule(data.value.houseId, data.value.id);
    } else if ("启用规则" === data.content) {
        onEnableCostRule(data.value.houseId, data.value.id);
    }
};

onMounted(async () => {});
</script>
<template>
    <t-card header-bordered :style="{ margin: '5px' }" id="data_table">
        <template #header>
            <div>
                <t-space>
                    <t-button theme="primary" @click="onShowCostRuleAdd">
                        <template #icon><AddIcon /></template> 新增
                    </t-button>
                    <t-button theme="primary" variant="outline" @click="onLoadCostRuleList">
                        <template #icon><SearchIcon /></template> 刷新
                    </t-button>
                </t-space>
            </div>
        </template>
        <t-table
            rowKey="id"
            :data="cost_rule_pageData.ruleList"
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
                <t-dropdown :options="doBuildableLineMenu(row)" @click="onTableLineMenuHandler">
                    <t-button theme="success" shape="round">
                        更多&nbsp;
                        <span><i class="icon-chevron-down"></i></span>
                    </t-button>
                </t-dropdown>
            </template>
        </t-table>
    </t-card>
    <t-dialog
        id="cost_rule_submit_data"
        v-model:visible="cost_rule_submit_data.visible"
        header="租赁信息"
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
            :rules="cost_rule_submit_data.rules"
            :data="cost_rule_submit_data.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitCostRule"
        >
            <t_form_item_mkp_cost_item
                label="费用科目"
                help="*必填"
                v-model="cost_rule_submit_data.submitData.costItemId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :type="globalConstDef.mktpCostItemType.House.toString()"
            />
            <form_enum_list
                label="计费方案"
                help="*必填"
                v-model="cost_rule_submit_data.submitData.costRuleType"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.mktpStoreCostRuleType"
            />
            <form_enum_list
                label="计费周期"
                help="*必填"
                v-show="
                    cost_rule_submit_data.submitData.costRuleType ==
                        globalConstDef.mktpStoreCostRuleType.CircleWhole ||
                    cost_rule_submit_data.submitData.costRuleType ==
                        globalConstDef.mktpStoreCostRuleType.CircleSqual
                "
                v-model="cost_rule_submit_data.submitData.circleType"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.mktpStoreCostCircleType"
            />
            <t-form-item
                label="周期数量"
                name="周期数量"
                help="*必填，单次计费日期跨度 = 计费周期 x 周期数量"
                v-show="
                    cost_rule_submit_data.submitData.costRuleType ==
                        globalConstDef.mktpStoreCostRuleType.CircleWhole ||
                    cost_rule_submit_data.submitData.costRuleType ==
                        globalConstDef.mktpStoreCostRuleType.CircleSqual
                "
            >
                <t-input v-model="cost_rule_submit_data.submitData.circleNum" />
            </t-form-item>
            <t-form-item
                label="周期单价"
                name="周期单价"
                help="*必填，每周期的单价，总费用 = 计费周期 x 周期数量 ( x 面积 ) x 周期单价"
                v-show="
                    cost_rule_submit_data.submitData.costRuleType ==
                        globalConstDef.mktpStoreCostRuleType.CircleWhole ||
                    cost_rule_submit_data.submitData.costRuleType ==
                        globalConstDef.mktpStoreCostRuleType.CircleSqual
                "
            >
                <t-input
                    label="￥"
                    suffix="元"
                    type="number"
                    placeholder="最小到小数点后两位"
                    v-model="cost_rule_submit_data.submitData.circlePrice"
                />
            </t-form-item>
            <t-form-item
                label="单价/单位"
                name="单价/单位"
                help="*必填"
                v-show="
                    cost_rule_submit_data.submitData.costRuleType ==
                    globalConstDef.mktpStoreCostRuleType.Quantity
                "
            >
                <t-input
                    label="￥"
                    suffix="元"
                    type="number"
                    placeholder="最小到小数点后两位"
                    v-model="cost_rule_submit_data.submitData.quantityPrice"
                />
            </t-form-item>
            <t-form-item
                label="计费开始"
                name="计费开始"
                help="选填，不填写则与租赁开始日期保持一致"
                v-show="
                    cost_rule_submit_data.submitData.costRuleType ==
                        globalConstDef.mktpStoreCostRuleType.CircleWhole ||
                    cost_rule_submit_data.submitData.costRuleType ==
                        globalConstDef.mktpStoreCostRuleType.CircleSqual
                "
            >
                <t-date-picker
                    v-model="cost_rule_submit_data.submitData.chargeBeginDate"
                    :presets="datePresets"
                />
            </t-form-item>
            <t-form-item
                label="计费截止"
                name="计费截止"
                help="选填，不填写则与租赁截止日期保持一致"
                v-show="
                    cost_rule_submit_data.submitData.costRuleType ==
                        globalConstDef.mktpStoreCostRuleType.CircleWhole ||
                    cost_rule_submit_data.submitData.costRuleType ==
                        globalConstDef.mktpStoreCostRuleType.CircleSqual
                "
            >
                <t-date-picker
                    v-model="cost_rule_submit_data.submitData.chargeEndDate"
                    :presets="datePresets"
                />
            </t-form-item>
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="cost_rule_submit_data.submitData.remark" />
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
