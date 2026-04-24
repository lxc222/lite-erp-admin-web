<script setup lang="jsx">
import { onMounted, ref } from "vue";

const thisModel = defineModel();

import { AddIcon } from "tdesign-icons-vue-next";
import { MessagePlugin, LoadingPlugin, DialogPlugin } from "tdesign-vue-next";

import {
    ajaxPageDataParse,
    axiosPostJson,
    axiosPostJsonBody,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";
import { oneMaterialById, oneSpecMaterialById } from "@/assets/asset_biz_md_20251024.js";
import { message_plugin_config } from "@/assets/asset_biz_base_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

import dialog_barcode_128 from "@/components/dialog_barcode_128.vue";
import form_enum_list from "@/components/form_enum_list.vue";
import form_enum_radio_group from "@/components/form_enum_radio_group.vue";
import t_form_item_material from "@/components/md/t_form_item_material.vue";
import form_material_unit from "@/components/md/form_material_unit.vue";

import enable_status_tag from "@/components/enable_status_tag.vue";

const table_columns = [
    {
        colKey: "code",
        title: "规格编码",
        width: "250",
        align: "left",
        cell: (h, { row }) => {
            let jsx = [];
            jsx.push(
                <span>
                    【规格编码】
                    <span style="font-weight:bold" onClick={() => onShowQrCodeDlg(row.code)}>
                        {row.code}
                    </span>
                </span>
            );

            jsx.push(<p class="my_p_divider" />);
            jsx.push(<enable_status_tag status={row.status} />);

            return jsx;
        }
    },
    {
        colKey: "materialTitle",
        title: "物料基础",
        width: "250",
        cell: (h, { row }) => {
            return (
                <span>
                    【物料名称】{row.materialTitle}
                    <p class="my_p_divider" />
                    【物料编码】<span style="font-weight:bold">{row.materialCode}</span>
                    <p class="my_p_divider" />
                    【基本单位】{row.unitName} (基本)
                </span>
            );
        }
    },
    {
        colKey: "title",
        title: "规格详情",
        align: "center",
        children: [
            {
                colKey: "stockTypeTitle",
                title: "规格&库存",
                cell: (h, { row }) => {
                    let jsx = [];
                    jsx.push(<span>【库存方案】{row.stockTypeTitle}</span>);
                    jsx.push(
                        <div style="margin:5px;">
                            <t-divider style="margin:0px">规格详情</t-divider>
                        </div>
                    );

                    for (let i = 0; i < row.specValueTitleList.length; i++) {
                        jsx.push(
                            <span>
                                <p style="height: 2px;" />
                            </span>
                        );

                        jsx.push(<span>{row.specValueTitleList[i]}</span>);
                    }

                    return jsx;
                }
            },
            {
                colKey: "secureStockNum",
                title: "安全库存",
                align: "right",
                width: "120",
                cell: (h, { row }) => {
                    if (row.secureStockNum > 0) {
                        return (
                            <span>
                                {row.secureStockNum} {row.secureStockNumUnitTitle}
                            </span>
                        );
                    } else {
                        return <span>-</span>;
                    }
                }
            }
        ]
    },
    {
        colKey: "supplyInfo",
        title: "外供配置",
        align: "center",
        children: [
            {
                colKey: "supplyPrice",
                title: "￥建议单价",
                align: "right",
                width: "100",
                cell: (h, { row }) => {
                    if (row.supplyPrice) {
                        return <span class="table_column_money">￥{row.supplyPrice}</span>;
                    } else {
                        return <span>-</span>;
                    }
                }
            },
            { colKey: "supplyOpenStr", title: "外供?", width: "80px" }
        ]
    },
    { colKey: "remark", title: "备注" },
    { colKey: "updateAction", title: "最后修改", width: 125 },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const table_line_expanded_row_keys = ref([""]);

const onTableLineExpandChange = (value, params) => {
    table_line_expanded_row_keys.value = value;
    // console.log("onTableLineExpandChange", value, params);
};

const onTableLineExpandedViewTpl = (h, { row }) => (
    <div class="more-detail">
        <p class="content">
            <b>【ID】</b>
            {row.id}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <b>【物料类型】</b>
            {row.materialPackTypeStr}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <b>【生产类型】</b>
            {row.materialProduceTypeStr}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <b>【成本单价】</b>￥{row.costPrice}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <b>【创建操作】</b>
            {row.createAction}
        </p>
    </div>
);

async function doShowEnableOrDisable(editId) {
    const confirmDia = DialogPlugin.confirm({
        header: "可售状态切换",
        body: "调整物料可售状态",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();
            axiosPostJson(
                "/api/biz/md/specMaterial/enableOrDisable",
                {
                    materialId: editId
                },
                function (response) {
                    if (!isAjaxRspSucc(response)) {
                        MessagePlugin.error({
                            content: response.data.tipMsg,
                            duration: 3000,
                            closeBtn: true,
                            placement: "center",
                            onClose: function () {}
                        });
                    } else {
                        MessagePlugin.info({
                            content: response.data.data,
                            duration: 3000,
                            closeBtn: true,
                            placement: "center",
                            onClose: function () {}
                        });
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
    if ("修改物料" === data.content) {
        doShowMaterialEdit(data.value);
    } else if ("启用/停用" === data.content) {
        doShowEnableOrDisable(data.value);
    } else {
    }
};

const material_submit_data = ref({
    addMode: false,
    visible: false,
    stockTypeList: [],
    specVoList: [],
    specTypeIdsSelectForce: [],
    specTypeIdsSelectOptional: [],
    specTypeId2ValueVoMap: {},
    submitData: {
        id: null,
        materialId: null,
        costPrice: null,
        stockType: null,
        secureStockNum: null,
        secureStockNumUnitId: null,
        status: null,
        supplyOpen: null,
        supplyPrice: null,
        remark: null,
        specValueKeys: null,
        specType2ValueTitleMap: {}
    },
    rules: {
        materialId: [
            { required: true, message: "物料*必填", type: "error", trigger: "blur" },
            {
                required: true,
                message: "物料*必填",
                type: "error",
                trigger: "change"
            }
        ]
    }
});

async function onLoadSpecTypeList() {
    let distUrl = "/api/biz/md/materialSpecType/list";
    axiosPostJsonBody(
        distUrl,
        {
            status: globalConstDef.enableModel.Enabled
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                material_submit_data.value.specVoList = response.data.data;
            } else {
                MessagePlugin.error({
                    content: response.data.tipMsg,
                    duration: 2000,
                    closeBtn: true,
                    placement: "center",
                    onClose: function () {}
                });
            }
        }
    );
}

function getSpecTypeInfo(specId) {
    return material_submit_data.value.specVoList.filter(function (item) {
        return item.id == specId;
    })[0];
}

async function onLoadMaterialStockType(materialPackType) {
    // console.log("materialPackType", materialPackType);
    material_submit_data.value.stockTypeList = [];
    if (
        !thisModel.value.commonData ||
        !thisModel.value.commonData.materialPackTypeMap ||
        !materialPackType
    ) {
        console.log(
            "material_submit_data.stockTypeList1",
            material_submit_data.value.stockTypeList
        );
        return;
    }

    let map = thisModel.value.commonData.materialPackTypeMap[materialPackType];
    if (!map) {
        console.log(
            "material_submit_data.stockTypeList2",
            material_submit_data.value.stockTypeList
        );
        return;
    }

    material_submit_data.value.stockTypeList = map.stockTypes;
    console.log("material_submit_data.stockTypeList3", material_submit_data.value.stockTypeList);
    return;
}

async function doShowMaterialAdd() {
    material_submit_data.value.specTypeIdsSelectForce = [];
    material_submit_data.value.specTypeIdsSelectOptional = [];

    material_submit_data.value.submitData = {
        specType2ValueTitleMap: {},
        status: globalConstDef.enableModel.Enabled,
        supplyOpen: globalConstDef.yesOrNo.No
    };

    material_submit_data.value.visible = true;
    material_submit_data.value.addMode = true;
}

async function doShowMaterialEdit(editId) {
    material_submit_data.value.specTypeIdsSelectForce = [];
    material_submit_data.value.specTypeIdsSelectOptional = [];

    material_submit_data.value.submitData = {
        specType2ValueTitleMap: {}
    };

    material_submit_data.value.addMode = false;
    material_submit_data.value.visible = true;
    oneSpecMaterialById(
        editId,
        response => {
            material_submit_data.value.submitData = response.data;
            onMaterialSubmitSelected();
        },
        response => {
            return;
        }
    );
}

function onMaterialSubmitSelected() {
    if (!material_submit_data.value.submitData.materialId) {
        return;
    }

    oneMaterialById(
        material_submit_data.value.submitData.materialId,
        response => {
            onLoadMaterialStockType(response.data.materialPackType);
            material_submit_data.value.specTypeIdsSelectForce = response.data.specTypeIdsForce;
            material_submit_data.value.specTypeIdsSelectOptional =
                response.data.specTypeIdsOptional;

            material_submit_data.value.specTypeId2ValueVoMap = {};
            if (material_submit_data.value.specTypeIdsSelectForce) {
                for (let i = 0; i < material_submit_data.value.specTypeIdsSelectForce.length; i++) {
                    onLoadSpecValue(material_submit_data.value.specTypeIdsSelectForce[i]);
                }
            }

            if (material_submit_data.value.specTypeIdsSelectOptional) {
                for (
                    let i = 0;
                    i < material_submit_data.value.specTypeIdsSelectOptional.length;
                    i++
                ) {
                    onLoadSpecValue(material_submit_data.value.specTypeIdsSelectOptional[i]);
                }
            }
        },
        response => {
            return;
        }
    );
}

const doSubmitMaterial = () => {
    let distUrl = "/api/biz/md/specMaterial/add";
    if (material_submit_data.value.submitData.id) {
        distUrl = "/api/biz/md/specMaterial/change";
    }

    axiosPostJsonBody(distUrl, material_submit_data.value.submitData, function (response) {
        if (!isAjaxRspSucc(response)) {
            MessagePlugin.error({
                content: response.data.tipMsg,
                duration: 3000,
                closeBtn: true,
                placement: "center",
                onClose: function () {}
            });
        } else {
            material_submit_data.value.visible = false;
            MessagePlugin.info({
                content: response.data.data,
                duration: 3000,
                closeBtn: true,
                placement: "center",
                onClose: function () {}
            });
        }
    });
};

const onLoadSpecValue = specId => {
    //console.log("change: ", value, context.e.srcElement.value);
    if (!specId || specId == "") {
        return;
    }

    let distUrl = "/api/biz/md/materialSpecValue/list";
    axiosPostJsonBody(
        distUrl,
        {
            specId: specId,
            status: globalConstDef.enableModel.Enabled
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                material_submit_data.value.specTypeId2ValueVoMap[specId] = response.data.data;
            } else {
                MessagePlugin.error({
                    content: response.data.tipMsg,
                    duration: 2000,
                    closeBtn: true,
                    placement: "center",
                    onClose: function () {}
                });
            }
        }
    );
};

const form_query_data = ref({
    materialCode: null,
    status: null,
    supplyOpen: null,
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
        "/api/biz/md/specMaterial/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            materialTitle: form_query_data.value.materialTitle,
            materialCode: form_query_data.value.materialCode,
            status: form_query_data.value.status,
            supplyOpen: form_query_data.value.supplyOpen
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
                MessagePlugin.info({
                    content: response.data.tipMsg,
                    duration: 2000,
                    closeBtn: true,
                    placement: "center",
                    onClose: function () {}
                });
            }
        }
    );

    return false;
}

function onShowSpecValueAdd(specIdd, value) {
    // console.log("onShowSpecValueAdd: ", specIdd, value);
    let vo = getSpecTypeInfo(specIdd);
    const confirmDia = DialogPlugin.confirm({
        header: "确认",
        body: "新增规格详情：" + vo.title + " : " + value,
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();
            axiosPostJsonBody(
                "/api/biz/md/materialSpecValue/add",
                {
                    specId: specIdd,
                    title: value,
                    status: globalConstDef.enableModel.Enabled,
                    remark: "添加物料详情新增"
                },
                function (response) {
                    if (!isAjaxRspSucc(response)) {
                        MessagePlugin.error({
                            content: response.data.tipMsg,
                            duration: 3000,
                            closeBtn: true,
                            placement: "center",
                            onClose: function () {}
                        });
                    } else {
                        onLoadSpecValue(specIdd);
                        material_submit_data.value.submitData.specType2ValueTitleMap[specIdd] =
                            value;

                        MessagePlugin.info({
                            content: response.data.data,
                            duration: 3000,
                            closeBtn: true,
                            placement: "center",
                            onClose: function () {}
                        });
                    }
                }
            );
        },
        onClose: ({ e, trigger }) => {
            confirmDia.hide();
        }
    });
}

const qrcode_show_model = ref({
    visiable: false,
    code: ""
});

function onShowQrCodeDlg(code) {
    qrcode_show_model.value = {
        visiable: true,
        code: code
    };
}

onMounted(async () => {
    onLoadSpecTypeList();
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
                <t-form-item label="物料编码" name="物料编码">
                    <t-input v-model="form_query_data.materialCode" :clearable="true"></t-input>
                </t-form-item>
                <form_enum_list
                    label="是否外供"
                    v-model="form_query_data.supplyOpen"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.yesOrNo"
                    :widthPx="160"
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
                <t-button theme="primary" variant="outline" @click="doShowMaterialAdd()">
                    <template #icon><AddIcon /></template>
                    规格物料
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
            resizable
            size="medium"
            :showHeader="true"
            cell-empty-content="-"
        >
            <template #refOperation="{ row }">
                <t-dropdown
                    :options="[
                        { content: '修改物料', value: row.id },
                        { content: '启用/停用', value: row.id, divider: true }
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
    <dialog_barcode_128
        header="规格编码"
        :visible="qrcode_show_model.visiable"
        :barcode="qrcode_show_model.code"
        @close="qrcode_show_model.visiable = false"
    />
    <t-drawer
        id="material_submit_data"
        v-model:visible="material_submit_data.visible"
        @confirm="doSubmitMaterial"
        size="50%"
        placement="right"
        :closeBtn="true"
        :cancelBtn="null"
        confirmBtn="提交物料"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
    >
        <template #header>规格物料</template>
        <t-form
            :rules="material_submit_data.rules"
            :data="material_submit_data.submitData"
            requiredMarkPosition="right"
        >
            <t-divider>基础配置</t-divider>
            <t_form_item_material
                label="关联物料"
                help="*必填"
                v-model="material_submit_data.submitData.materialId"
                @change="onMaterialSubmitSelected"
                :disabled="!material_submit_data.addMode"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <t-form-item label="成本单价" name="成本单价￥" help="*必填(最高支持两位小数)">
                <t-input
                    label="￥"
                    suffix="元"
                    type="number"
                    placeholder="成本单价"
                    v-model="material_submit_data.submitData.costPrice"
                />
            </t-form-item>
            <form_enum_radio_group
                label="库存方案"
                help="*必填，物料自身的库存方案"
                v-show="material_submit_data.submitData.materialId"
                v-model="material_submit_data.submitData.stockType"
                :disabled="!material_submit_data.addMode"
                :options="material_submit_data.stockTypeList"
            />
            <t-form-item
                label="安全库存"
                name="安全库存"
                help="*必填，仓储中心总库存低于该值告警, 数量按照基本单位计算"
            >
                <t-input
                    type="number"
                    placeholder="不关注安全库存的请填写0"
                    suffix="基本单位"
                    v-model="material_submit_data.submitData.secureStockNum"
                />
            </t-form-item>
            <form_material_unit
                label="安全库存单位"
                v-show="
                    material_submit_data.submitData.secureStockNum &&
                    material_submit_data.submitData.secureStockNum > 0
                "
                v-model="material_submit_data.submitData.secureStockNumUnitId"
                help="*必填，库存会计算成基本单位计算，请保证库存单位均可转换成基本单位，否则不准"
            />
            <form_enum_radio_group
                label="是否启用"
                help="*必填"
                v-model="material_submit_data.submitData.status"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input
                    :maxlength="100"
                    :allowInputOverMax="false"
                    show-limit-number
                    placeholder="备注信息"
                    v-model="material_submit_data.submitData.remark"
                />
            </t-form-item>
            <t-divider>规格详细</t-divider>
            <template v-for="specId in material_submit_data.specTypeIdsSelectForce">
                <t-form-item
                    :label="'【规格】' + getSpecTypeInfo(specId).title"
                    :name="'【规格】' + getSpecTypeInfo(specId).title"
                    help="*必填, 输入值+回车直接添加新规格详情"
                >
                    <t-select
                        v-model="material_submit_data.submitData.specType2ValueTitleMap[specId]"
                        creatable
                        filterable
                        @create="val => onShowSpecValueAdd(specId, val)"
                    >
                        <t-option
                            v-for="item in material_submit_data.specTypeId2ValueVoMap[specId]"
                            :key="item.id"
                            :label="item.title"
                            :value="item.title"
                        />
                    </t-select>
                </t-form-item>
            </template>
            <template v-for="specId in material_submit_data.specTypeIdsSelectOptional">
                <t-form-item
                    :label="'【规格】' + getSpecTypeInfo(specId).title"
                    :name="'【规格】' + getSpecTypeInfo(specId).title"
                    help="选填写"
                >
                    <t-select
                        v-model="material_submit_data.submitData.specType2ValueTitleMap[specId]"
                        creatable
                        filterable
                        @create="val => onShowSpecValueAdd(specId, val)"
                    >
                        <t-option
                            v-for="item in material_submit_data.specTypeId2ValueVoMap[specId]"
                            :key="item.id"
                            :label="item.title"
                            :value="item.title"
                        />
                    </t-select>
                </t-form-item>
            </template>
            <t-divider>销售配置</t-divider>
            <form_enum_radio_group
                label="是否对外销售"
                help="*必填"
                v-model="material_submit_data.submitData.supplyOpen"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.yesOrNo"
            />
            <t-form-item
                label="最低销售单价"
                name="最低销售单价"
                help="*必填，(最高支持两位小数)"
                v-show="material_submit_data.submitData.supplyOpen == globalConstDef.yesOrNo.Yes"
            >
                <t-input
                    label="￥"
                    suffix="元"
                    type="number"
                    placeholder="最低销售单价￥"
                    v-model="material_submit_data.submitData.supplyPrice"
                />
            </t-form-item>
        </t-form>
    </t-drawer>
</template>

<style scoped>
.money-show {
    font-weight: bold;
}
.more-detail {
    line-height: 22px;
    > p {
        display: inline-block;
        margin: 4px 0;
    }
}
</style>
