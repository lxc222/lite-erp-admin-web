<script setup lang="jsx">
import { onMounted, ref } from "vue";

const thisModel = defineModel();

import { MessagePlugin, LoadingPlugin } from "tdesign-vue-next";
import { AddIcon } from "tdesign-icons-vue-next";

import {
    ajaxPageDataParse,
    axiosPostJsonBody,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";
import { message_plugin_config } from "@/assets/asset_biz_base_20251024.js";
import { getOneWmsHouseCenter, getOneWmsHouseRegion } from "@/assets/asset_biz_wms_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

import form_enum_list from "@/components/form_enum_list.vue";
import form_enum_radio_group from "@/components/form_enum_radio_group.vue";
import t_form_item_house_center_list from "@/components/wms/t_form_item_house_center_list.vue";
import t_form_item_house_region_cascader from "@/components/wms/t_form_item_house_region_cascader.vue";
import t_form_item_house_region_list from "@/components/wms/t_form_item_house_region_list.vue";
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
                {row.id}&nbsp;&nbsp;
                <b>【创建操作】</b>
                {row.createAction}&nbsp;&nbsp;
                <b>【展示权重】</b>
                {row.orderWeight}&nbsp;&nbsp;
            </p>
        </div>
    </div>
);

const table_columns = [
    { colKey: "centerName", title: "仓库中心", width: 150 },
    {
        colKey: "titleAbs",
        title: "库区全路径"
    },
    {
        colKey: "title",
        title: "库区信息",
        cell: (h, { row }) => {
            return (
                <span>
                    【名称】{row.title}
                    <p class="my_p_divider" />
                    【层级】第{row.level}级
                </span>
            );
        }
    },
    {
        colKey: "addressAbs",
        title: "库区地址",
        cell: (h, { row }) => {
            return (
                <span>
                    {row.centerAddr}
                    {row.addressAbs}
                </span>
            );
        }
    },
    {
        colKey: "manageEmployee",
        title: "负责人员",
        align: "right"
    },
    {
        colKey: "applyDepositFlagTitle",
        title: "入库申请",
        align: "left",
        width: 200,
        cell: (h, { row }) => {
            return (
                <span>
                    【接受申请】{row.applyDepositFlagTitle}
                    <p class="my_p_divider" />
                    【库管岗位】{row.stockManagePositionTitle}
                </span>
            );
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
    { colKey: "updateAction", title: "最后修改" },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const region_submit_model = ref({
    visible: false,
    addMode: false,
    centerAddr: null,
    regionParentAddr: null,
    submitData: {
        title: null,
        centerId: null,
        parentId: null,
        manageEmployeeId: null,
        applyDepositFlag: null,
        stockManagePositionId: null,
        address: null,
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

async function onShowRegionAddChild(parentId, storeCenterId) {
    region_submit_model.value.submitData = { status: globalConstDef.enableModel.Enabled };
    region_submit_model.value.submitData.centerId = storeCenterId;
    region_submit_model.value.submitData.parentId = parentId;

    getOneWmsHouseCenter(
        storeCenterId,
        response => {
            region_submit_model.value.centerAddr = response.data.address;
            region_submit_model.value.regionParentAddr = "";
        },
        () => {}
    );

    getOneWmsHouseRegion(
        parentId,
        response => {
            region_submit_model.value.regionParentAddr = response.data.addressAbs;
        },
        () => {}
    );

    region_submit_model.value.visible = true;
    region_submit_model.value.addMode = true;
}

async function onShowRegionAdd() {
    region_submit_model.value.submitData = {
        status: globalConstDef.enableModel.Enabled
    };

    if (form_query_data.value.storeCenterId) {
        region_submit_model.value.submitData.centerId = form_query_data.value.storeCenterId;

        getOneWmsHouseCenter(
            region_submit_model.value.submitData.centerId,
            response => {
                region_submit_model.value.centerAddr = response.data.address;
                region_submit_model.value.regionParentAddr = "";
            },
            () => {}
        );
    }

    region_submit_model.value.visible = true;
    region_submit_model.value.addMode = true;
}

async function onShowRegionEdit(editId) {
    region_submit_model.value.centerAddr = "";
    region_submit_model.value.regionParentAddr = "";
    region_submit_model.value.submitData = { id: editId };
    region_submit_model.value.addMode = false;

    getOneWmsHouseRegion(
        editId,
        response => {
            region_submit_model.value.centerAddr = response.data.centerAddr;
            region_submit_model.value.regionParentAddr = response.data.parentAddressAbs;
            region_submit_model.value.submitData = response.data;
            region_submit_model.value.visible = true;
        },
        () => {}
    );
}

const onSubmitRegionData = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/wms/houseRegion/add";
        if (region_submit_model.value.submitData.id > 0) {
            distUrl = "/api/biz/wms/houseRegion/change";
        }

        axiosPostJsonBody(distUrl, region_submit_model.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                region_submit_model.value.visible = false;
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

const onTableLineMenuHandler = data => {
    if ("修改信息" === data.content) {
        onShowRegionEdit(data.value);
    } else if ("添加下级" === data.content) {
        onShowRegionAddChild(data.value.id, data.value.centerId);
    }
};

const form_query_data = ref({
    storeCenterId: null,
    parentId: null,
    status: null,
    manageEmployeeId: null,
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
        "/api/biz/wms/houseRegion/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            storeCenterId: form_query_data.value.storeCenterId,
            parentId: form_query_data.value.parentId,
            status: form_query_data.value.status,
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
                <t_form_item_house_center_list
                    label="仓库中心"
                    v-model="form_query_data.storeCenterId"
                    @change="form_query_data.parentId = null"
                    :showFilter="true"
                />
                <t_form_item_house_region_cascader
                    label="仓库库区"
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
                    :widthPx="160"
                />
                <t_form_item_employee
                    label="负责人员"
                    v-model="form_query_data.manageEmployeeId"
                    :showFilter="true"
                />
                <t-button theme="primary" type="submit">开始查询</t-button>
            </t-form>
        </div></t-card
    >
    <t-card header-bordered :style="{ margin: '5px' }" id="data_table">
        <template #header>
            <div>
                <t-button theme="primary" variant="outline" @click="onShowRegionAdd()">
                    <template #icon><AddIcon /></template>
                    库区
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
                    :options="[
                        { content: '修改信息', value: row.id, divider: true },
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
        id="region_submit_model"
        width="40%"
        v-model:visible="region_submit_model.visible"
        header="库区信息"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
    >
        <t-form
            :rules="region_submit_model.rules"
            :data="region_submit_model.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitRegionData"
        >
            <t_form_item_house_center_list
                label="仓库中心"
                help="*必填"
                v-model="region_submit_model.submitData.centerId"
                @change="region_submit_model.submitData.parentId = null"
                @valueChange="v => (region_submit_model.centerAddr = v?.address ?? '')"
                :disabled="!region_submit_model.addMode"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <t_form_item_house_region_list
                label="上级库区"
                help="*必填"
                v-model="region_submit_model.submitData.parentId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :centerId="region_submit_model.submitData.centerId"
                :externalOption="[{ id: -1, title: '### 无上级库区目(一级) ###' }]"
                @valueChange="v => (region_submit_model.regionParentAddr = v?.addressAbs ?? '')"
            />
            <t-form-item label="库区名称" name="库区名称" help="*必填">
                <t-input placeholder="库区名称" v-model="region_submit_model.submitData.title" />
            </t-form-item>
            <t_form_item_employee
                label="库区负责人"
                help="选填"
                v-model="region_submit_model.submitData.manageEmployeeId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :externalOption="[{ title: '### 无负责人员 ###', id: -1 }]"
            />
            <t-form-item label="库区地址" name="库区地址" help="选填, 该地址直接作为收发地址">
                <t-input
                    placeholder="库区地址"
                    :label="
                        (region_submit_model?.centerAddr ?? '') +
                        (region_submit_model?.regionParentAddr ?? '')
                    "
                    v-model="region_submit_model.submitData.address"
                />
            </t-form-item>
            <form_enum_radio_group
                label="接收入库申请"
                help="*必填"
                v-model="region_submit_model.submitData.applyDepositFlag"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.yesOrNo"
            />
            <t_form_item_position_list
                label="库管岗位"
                help="*必填, 该岗位人员负责确认审核入库单(库调)及取消、审批、执行等动作"
                v-model="region_submit_model.submitData.stockManagePositionId"
                :status="globalConstDef.enableModel.Enabled.toString()"
                :externalOption="[{ title: '---继承上级配置---', id: -1 }]"
            />
            <t-form-item label="展示权重" name="展示权重" help="不填写则默认现有数据最低权重">
                <t-input
                    placeholder="展示权重"
                    v-model="region_submit_model.submitData.orderWeight"
                />
            </t-form-item>
            <form_enum_radio_group
                label="是否启用"
                help="*必填"
                v-model="region_submit_model.submitData.status"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="region_submit_model.submitData.remark" />
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
