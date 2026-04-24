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
import t_form_item_delivery_vehicle_type from "@/components/tms/t_form_item_delivery_vehicle_type.vue";
import t_form_item_delivery_vehicle_spec from "@/components/tms/t_form_item_delivery_vehicle_spec.vue";

import enable_status_tag from "@/components/enable_status_tag.vue";

const time_range_list = ref([]);

function onLoadTimeRangeDate() {
    let distUrl = "/api/biz/tms/deliveryTimeRange/list";
    axiosPostJsonBody(
        distUrl,
        {
            status: globalConstDef.enableModel.Enabled
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                for (let i = 0; i < response.data.data.length; i++) {
                    time_range_list.value.push({
                        label:
                            response.data.data[i].beginDate + "~" + response.data.data[i].endDate,
                        value: response.data.data[i].id
                    });
                }
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

const table_line_expanded_row_keys = ref([""]);

const onTableLineExpandChange = (value, params) => {
    table_line_expanded_row_keys.value = value;
    // console.log("onTableLineExpandChange", value, params);
};

const onTableLineExpandedViewTpl = (h, { row }) => (
    <div>
        {/* {row.items.map((field, index) => (
            <div class="more-detail" key={index}>
                <p class="content">
                    <b>【子物料-{index + 1}】</b>
                    {field.materialSpecDetail} x {field.materialNum}&nbsp;{field.unit}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 物料编码：
                    {field.materialCode}
                </p>
            </div>
        ))} */}
        <div class="more-detail">
            <p class="content">
                <b>【ID】&nbsp;</b>
                {row.id}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【创建操作】&nbsp;</b>
                {row.createAction}
            </p>
        </div>
    </div>
);

const table_columns = [
    {
        colKey: "title",
        title: "名称",
        cell: (h, { row }) => {
            return <span>{row.title}</span>;
        }
    },
    {
        colKey: "license",
        title: "车辆号牌",
        cell: (h, { row }) => {
            let jsx = [];
            jsx.push(<span>【品牌】{row.brand}</span>);
            jsx.push(<p class="my_p_divider" />);
            jsx.push(<span>【号牌】{row.license}</span>);
            return jsx;
        }
    },
    {
        colKey: "cargoVolumeLength",
        title: "装载特征",
        children: [
            {
                colKey: "maxLoadWeight",
                title: "最大载重",
                cell: (h, { row }) => {
                    return <span>{row.maxLoadWeight} KG</span>;
                }
            },
            {
                colKey: "cargoVolumeLength",
                title: "载货空间",
                cell: (h, { row }) => {
                    let jsx = [];
                    jsx.push(<span>【长】{row.cargoVolumeLength} 米</span>);
                    jsx.push(<p class="my_p_divider" />);
                    jsx.push(<span>【宽】{row.cargoVolumeWidth} 米</span>);
                    jsx.push(<p class="my_p_divider" />);
                    jsx.push(<span>【高】{row.cargoVolumeHigh} 米</span>);
                    return jsx;
                }
            },
            {
                colKey: "supportManualLoadTitle",
                title: "装卸人工服务",
                cell: (h, { row }) => {
                    let jsx = [];
                    jsx.push(<span>【装车】{row.supportManualLoadTitle}</span>);
                    jsx.push(<p class="my_p_divider" />);
                    jsx.push(<span>【卸车】{row.supportManualUnloadTitle}</span>);
                    return jsx;
                }
            }
        ]
    },
    {
        colKey: "timeRangeTitles",
        title: "接单时段",
        width: 150,
        cell: (h, { row }) => {
            let jsx = [];
            for (let i = 0; i < row.timeRangeTitles.length; i++) {
                jsx.push(<span>{row.timeRangeTitles[i]}</span>);
                if (i < row.timeRangeTitles.length - 1) {
                    jsx.push(<p class="my_p_divider" />);
                }
            }
            return jsx;
        }
    },
    { colKey: "vehicleTypeTitle", title: "归属车型" },
    { colKey: "vehicleSpecTitle", title: "归属规格" },
    {
        colKey: "statusTitle",
        title: "是否启用",
        width: 115,
        cell: (h, { row }) => {
            return <enable_status_tag status={row.status} />;
        }
    },
    { colKey: "remark", title: "备注" },
    { colKey: "updateAction", title: "最后修改" },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const data_submit = ref({
    visible: false,
    addMode: false,
    submitData: {
        id: null,
        title: null,
        brand: null,
        license: null,
        status: null,
        maxLoadWeight: null,
        cargoVolumeLength: null,
        cargoVolumeWidth: null,
        cargoVolumeHigh: null,
        vehicleTypeId: null,
        vehicleSpecId: null,
        supportManualLoad: null,
        supportManualUnload: null,
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
    data_submit.value.submitData = { status: globalConstDef.enableModel.Enabled };
    data_submit.value.visible = true;
    data_submit.value.addMode = true;
}

async function onShowEditDlg(editId) {
    data_submit.value.submitData = {};
    data_submit.value.addMode = false;
    axiosPostJson(
        "/api/biz/tms/selfVehicle/oneById",
        {
            itemId: editId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                data_submit.value.submitData = response.data.data;
                data_submit.value.visible = true;
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
        let distUrl = "/api/biz/tms/selfVehicle/add";
        if (data_submit.value.submitData.id > 0) {
            distUrl = "/api/biz/tms/selfVehicle/change";
        }

        axiosPostJsonBody(distUrl, data_submit.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                data_submit.value.visible = false;
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
    brand: null,
    license: null,
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
        "/api/biz/tms/selfVehicle/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            status: form_query_data.value.status,
            title: form_query_data.value.title,
            brand: form_query_data.value.brand,
            license: form_query_data.value.license
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
    onLoadTimeRangeDate();
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
                <t-form-item label="车辆品牌" name="车辆品牌">
                    <t-input v-model="form_query_data.brand" :clearable="true"></t-input>
                </t-form-item>
                <t-form-item label="车辆名称" name="车辆名称">
                    <t-input v-model="form_query_data.title" :clearable="true"></t-input>
                </t-form-item>
                <t-form-item label="车牌号码" name="车牌号码">
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
                    运输车辆
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
        id="data_submit"
        v-model:visible="data_submit.visible"
        header="运输车辆"
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
            :rules="data_submit.rules"
            :data="data_submit.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitDataData"
        >
            <t-form-item label="车辆名称" name="车辆名称" help="*必填">
                <t-input
                    placeholder="如：1车队1号车"
                    v-model="data_submit.submitData.title"
                    :clearable="true"
                />
            </t-form-item>
            <t-form-item label="车辆品牌" name="车辆品牌" help="*必填">
                <t-input
                    placeholder="车辆品牌"
                    v-model="data_submit.submitData.brand"
                    :clearable="true"
                />
            </t-form-item>
            <t-form-item label="车牌号码" name="车牌号码" help="*必填">
                <t-input
                    placeholder="车牌号码"
                    v-model="data_submit.submitData.license"
                    :clearable="true"
                /> </t-form-item
            ><t-form-item label="最大载重" name="最大载重" help="*必填">
                <t-input
                    suffix="KG"
                    type="number"
                    placeholder="最大载重"
                    v-model="data_submit.submitData.maxLoadWeight"
                    :clearable="true"
                />
            </t-form-item>
            <t-form-item label="装载长度" name="装载长度" help="*必填">
                <t-input
                    suffix="米"
                    type="number"
                    placeholder="最大装载容积长度"
                    v-model="data_submit.submitData.cargoVolumeLength"
                    :clearable="true"
                />
            </t-form-item>
            <t-form-item label="装载宽度" name="装载宽度" help="*必填">
                <t-input
                    suffix="米"
                    type="number"
                    placeholder="最大装载容积宽度"
                    v-model="data_submit.submitData.cargoVolumeWidth"
                    :clearable="true"
                />
            </t-form-item>
            <t-form-item label="装载高度" name="装载高度" help="*必填">
                <t-input
                    suffix="米"
                    type="number"
                    placeholder="最大装载容积高度"
                    v-model="data_submit.submitData.cargoVolumeHigh"
                    :clearable="true"
                />
            </t-form-item>
            <t_form_item_delivery_vehicle_type
                label="归属车型"
                help="*必填"
                v-model="data_submit.submitData.vehicleTypeId"
            />
            <t_form_item_delivery_vehicle_spec
                label="归属规格"
                help="*必填"
                v-model="data_submit.submitData.vehicleSpecId"
            />
            <form_enum_radio_group
                label="是否启用"
                help="*必填"
                v-model="data_submit.submitData.status"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input
                    placeholder="备注信息"
                    v-model="data_submit.submitData.remark"
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
