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
import table_with_pagination from "@/components/table_with_pagination.vue";
import t_form_item_mkp_store_center from "@/components/mktp/t_form_item_mkp_store_center.vue";
import t_form_item_mkp_store_region_list from "@/components/mktp/t_form_item_mkp_store_region_list.vue";
import t_form_item_mkp_store_region_cascader from "@/components/mktp/t_form_item_mkp_store_region_cascader.vue";

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
                商铺面积(平方米)
                <b>【总数量】</b>
                {row.storeSquareAll} 平方&nbsp;&nbsp;
                <b>【启用中】</b>
                {row.storeSquareEnabled} 平方&nbsp;&nbsp;
                <b>【未启用】</b>
                {row.storeSquareDisabled} 平方&nbsp;&nbsp;
            </p>
        </div>
        <div class="more-detail">
            <p class="content">
                <b>【ID】</b>
                {row.id}&nbsp;&nbsp;
                <b>【创建操作】</b>
                {row.createAction}
            </p>
        </div>
    </div>
);

const table_columns = [
    { colKey: "centerName", title: "商铺中心" },
    {
        colKey: "titleAbs",
        title: "区域全路径"
    },
    { colKey: "title", title: "区域名称" },
    {
        colKey: "level",
        title: "区域层级",
        align: "right",
        cell: (h, { row }) => {
            return <span>第{row.level}级</span>;
        }
    },
    {
        colKey: "storeCountAll",
        title: "商铺数量",
        align: "left",
        cell: (h, { row }) => {
            return (
                <span>
                    【总数量】{row.storeCountAll}
                    <p class="my_p_divider" />
                    【启用中】<span style="font-weight:bold;">{row.storeCountEnabled}</span>
                    <p class="my_p_divider" />
                    【未启用】{row.storeCountDisabled}
                </span>
            );
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
    { colKey: "orderWeight", title: "展示权重", align: "right" },
    { colKey: "remark", title: "备注" },
    { colKey: "updateAction", title: "最后修改", width: 120 },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const region_submit_data = ref({
    visible: false,
    addMode: false,
    submitData: {
        title: null,
        centerId: null,
        parentId: null,
        orderWeight: null,
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

async function onShowStoreRegionAdd() {
    region_submit_data.value.submitData = { status: globalConstDef.enableModel.Enabled };
    region_submit_data.value.visible = true;
    region_submit_data.value.addMode = true;
    if (form_query_data.value.storeCenterId) {
        region_submit_data.value.submitData.storeCenterId = form_query_data.value.storeCenterId;
    }
}

async function onShowStoreRegionEdit(editId) {
    region_submit_data.value.submitData = {};
    region_submit_data.value.addMode = false;
    axiosPostJson(
        "/api/biz/mktp/storeRegion/oneById",
        {
            itemId: editId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                region_submit_data.value.submitData = response.data.data;
                region_submit_data.value.visible = true;
            }
        }
    );
}

const onSubmitStoreRegion = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/mktp/storeRegion/add";
        if (region_submit_data.value.submitData.id > 0) {
            distUrl = "/api/biz/mktp/storeRegion/change";
        }

        axiosPostJsonBody(distUrl, region_submit_data.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                region_submit_data.value.visible = false;
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

async function onShowStoreRegionNextAdd(parentId, storeCenterId) {
    // console.log("onShowStoreRegionNextAdd", parentId, storeCenterId);
    region_submit_data.value.submitData = { status: globalConstDef.enableModel.Enabled };
    region_submit_data.value.visible = true;
    region_submit_data.value.submitData.centerId = storeCenterId;
    region_submit_data.value.submitData.parentId = parentId;
}

const onTableLineMenuHandler = data => {
    if ("修改信息" === data.content) {
        onShowStoreRegionEdit(data.value.id);
    } else if ("添加下级" === data.content) {
        onShowStoreRegionNextAdd(data.value.id, data.value.centerId);
    }
};

const form_query_data = ref({
    storeCenterId: null,
    parentId: null,
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
        "/api/biz/mktp/storeRegion/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            storeCenterId: form_query_data.value.storeCenterId,
            parentId: form_query_data.value.parentId,
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
                <t_form_item_mkp_store_center
                    label="商铺中心"
                    v-model="form_query_data.storeCenterId"
                    @change="form_query_data.parentId = null"
                    :showFilter="true"
                />
                <t_form_item_mkp_store_region_cascader
                    label="商铺库区"
                    v-model="form_query_data.parentId"
                    :centerId="form_query_data.storeCenterId"
                    :checkStrictly="true"
                    :showFilter="true"
                />
                <form_enum_list
                    label="是否启用"
                    v-model="form_query_data.status"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.enableModel"
                    widthPx="160"
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
        :expandedRow="onTableLineExpandedViewTpl"
        :expandedRowKeys="table_line_expanded_row_keys"
        @expandChange="onTableLineExpandChange"
        @pageChange="onQueryFormData(false)"
        @pageSizeChange="onQueryFormData(false)"
    >
        <template #headerActions>
            <div>
                <t-button theme="primary" variant="outline" @click="onShowStoreRegionAdd()">
                    <template #icon><AddIcon /></template>
                    区域
                </t-button>
            </div>
        </template>
        <template #refOperation="{ row }">
            <t-dropdown
                :options="[
                    { content: '修改信息', value: row, divider: true },
                    { content: '添加下级', value: row }
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
        id="region_submit_data"
        width="40%"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
        v-model:visible="region_submit_data.visible"
        header="区域信息"
    >
        <t-form
            :rules="region_submit_data.rules"
            :data="region_submit_data.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitStoreRegion"
        >
            <t_form_item_mkp_store_center
                label="商铺中心"
                help="*必填"
                v-model="region_submit_data.submitData.centerId"
                :disabled="!region_submit_data.addMode"
                @change="region_submit_data.submitData.parentId = null"
            />
            <t_form_item_mkp_store_region_list
                label="上级区域"
                help="*必填"
                v-model="region_submit_data.submitData.parentId"
                :centerId="region_submit_data.submitData.centerId"
                :externalOption="[{ title: '无上级区域(一级)', id: -1 }]"
            />
            <t-form-item label="区域名称" name="区域名称" help="*必填">
                <t-input placeholder="区域名称" v-model="region_submit_data.submitData.title" />
            </t-form-item>
            <t-form-item label="展示权重" name="展示权重" help="不填写则默认现有数据最低权重">
                <t-input
                    placeholder="展示权重"
                    v-model="region_submit_data.submitData.orderWeight"
                />
            </t-form-item>
            <form_enum_radio_group
                label="是否启用"
                help="*必填"
                v-model="region_submit_data.submitData.status"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="region_submit_data.submitData.remark" />
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
