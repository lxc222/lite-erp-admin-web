<script setup lang="jsx">
import { onMounted, ref } from "vue";

const thisModel = defineModel();

import { LoadingPlugin, MessagePlugin } from "tdesign-vue-next";

import {
    ajaxPageDataParse,
    axiosPostJsonBody,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";

import { message_plugin_config } from "@/assets/asset_biz_base_20251024.js";
import table_with_pagination from "@/components/table_with_pagination.vue";
import form_enum_list from "@/components/form_enum_list.vue";

const presets = ref({
    昨天: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    今天: dayjs().format("YYYY-MM-DD")
});

const table_columns = [
    { colKey: "id", title: "#流水ID", width: "100px" },
    { colKey: "customer_whole", title: "会员信息" },
    {
        colKey: "remain_num",
        title: "剩余金额￥",
        align: "right",
        cell: (h, { row }) => {
            return <span>￥{row.remain_num}</span>;
        }
    },
    {
        colKey: "operate_num",
        title: "本次调整￥",
        align: "right",
        cell: (h, { row }) => {
            if (row.operateTypeCode == 100) {
                return <span>-￥{row.operate_num}</span>;
            } else {
                return <span>+￥{row.operate_num}</span>;
            }
        }
    },
    {
        colKey: "deposit_num",
        title: "本次充值￥",
        align: "right",
        cell: (h, { row }) => {
            return <span>+￥{row.deposit_num}</span>;
        }
    },
    {
        colKey: "give_num",
        title: "本次赠送￥",
        align: "right",
        cell: (h, { row }) => {
            return <span>+￥{row.give_num}</span>;
        }
    },
    {
        colKey: "num_change",
        title: "金额变动￥",
        align: "right",
        cell: (h, { row }) => {
            return (
                <span>
                    ￥{row.num_before} - ￥{row.num_after}
                </span>
            );
        }
    },
    { colKey: "operate_source", title: "流水来源" },
    { colKey: "remark", title: "备注信息", ellipsis: true },
    { colKey: "createAction", title: "操作记录" }
];

const form_query_data = ref({
    customerPhone: null,
    assetAction: null,
    assetActionSource: null,
    operateDate: [],
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
        "/api/biz/o2o/walletHistory/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            customerPhone: form_query_data.value.customerPhone,
            assetAction: form_query_data.value.assetAction,
            assetActionSource: form_query_data.value.assetActionSource,
            operateDateBegin: form_query_data.value.operateDate[0],
            operateDateEnd: form_query_data.value.operateDate[1]
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
    <t-card :bordered="true" :style="{ margin: '5px' }">
        <div style="padding-top: 10px; padding-bottom: 10px">
            <t-form
                labelWidth="60px"
                label-align="right"
                :data="form_query_data"
                layout="inline"
                scroll-to-first-error="smooth"
                @submit="onQueryFormData(true)"
            >
                <t-form-item label="会员手机" name="会员手机">
                    <t-input v-model="form_query_data.customerPhone"></t-input>
                </t-form-item>
                <form_enum_list
                    label="操作类型"
                    v-model="form_query_data.assetAction"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData._m_asset_action_"
                    :widthPx="160"
                />
                <form_enum_list
                    label="操作来源"
                    v-model="form_query_data.assetActionSource"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.sysOrManual"
                    :widthPx="160"
                />
                <t-form-item label="操作范围" name="操作范围">
                    <t-date-range-picker
                        v-model="form_query_data.operateDate"
                        :presets="presets"
                        enable-time-picker
                        clearable
                        format="YYYY-MM-DD HH:mm:ss"
                    />
                </t-form-item>
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
        <template #header>
            <div>流水记录</div>
        </template>
    </table_with_pagination>
</template>

<style scoped></style>
