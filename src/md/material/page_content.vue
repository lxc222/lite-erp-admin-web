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
import { oneMaterialById } from "@/assets/asset_biz_md_20251024.js";
import { message_plugin_config } from "@/assets/asset_biz_base_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

import dialog_barcode_128 from "@/components/dialog_barcode_128.vue";
import form_enum_list from "@/components/form_enum_list.vue";
import form_enum_radio_group from "@/components/form_enum_radio_group.vue";
import form_material_unit from "@/components/md/form_material_unit.vue";
import t_form_item_material_catelog_list from "@/components/md/t_form_item_material_catelog_list.vue";
import t_form_item_material_catelog_tree from "@/components/md/t_form_item_material_catelog_tree.vue";

import enable_status_tag from "@/components/enable_status_tag.vue";

const table_columns = [
    {
        colKey: "title",
        title: "名称&编码",
        width: "250",
        cell: (h, { row }) => {
            return (
                <span>
                    【名称】{row.title}
                    <p class="my_p_divider" />
                    【编码】
                    <span style="font-weight:bold" onClick={() => onShowQrCodeDlg(row.code)}>
                        {row.code}
                    </span>
                </span>
            );
        }
    },
    {
        colKey: "materialPackTypeStr",
        title: "物料属性",
        cell: (h, { row }) => {
            let jsx = [];
            jsx.push(<span>【打包类型】{row.materialPackTypeStr}</span>);
            jsx.push(<p class="my_p_divider" />);
            jsx.push(<span>【生产类型】{row.materialProduceTypeStr}</span>);

            return jsx;
        }
    },
    { colKey: "unitName", title: "基本单位", width: "80px" },
    { colKey: "catalogName", title: "类目" },
    {
        colKey: "specTitlesSelect",
        title: "关联规格",
        cell: (h, { row }) => {
            if (!row.specTitlesSelect) {
                return <span>无规格</span>;
            } else {
                let jsx = [];
                for (let i = 0; i < row.specTitlesSelect.length; i++) {
                    let item = row.specTitlesSelect[i];
                    jsx.push(item);
                }

                let resultStr = jsx.join(" / ");
                return <span>{resultStr}</span>;
            }
        }
    },
    {
        colKey: "statusTitle",
        title: "启用状态",
        width: "110",
        cell: (h, { row }) => {
            return <enable_status_tag status={row.status} />;
        }
    },
    { colKey: "remark", title: "备注" },
    { colKey: "updateAction", title: "最后修改" },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const table_line_expanded_row_keys = ref([""]);

const onTableLineExpandChange = (value, params) => {
    table_line_expanded_row_keys.value = value;
};

const onTableLineExpandedViewTpl = (h, { row }) => (
    <div>
        {row.materialList.map((field, index) => (
            <div class="more-detail" key={index}>
                <p class="content">
                    <b>【子物料-{index + 1}】</b>
                    {field.title} x {field.num}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 物料编码：
                    {field.code}
                </p>
            </div>
        ))}
        <div class="more-detail">
            <p class="content">
                <b>ID#:&nbsp;</b>
                {row.id}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>创建操作:&nbsp;</b>
                {row.createAction}
            </p>
        </div>
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
                "/api/biz/md/material/enableOrDisable",
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
    specListAll: [],
    specListForce: [],
    specListOptional: [],
    materialSearchCode: null,
    submitData: {
        id: null,
        catalogId: null,
        title: null,
        // costPrice: null,
        status: null,
        materialPackType: null,
        materialProduceType: null,
        stockType: null,
        unitId: null,
        specTypeIdsForce: [],
        specTypeIdsOptional: [],
        remark: null,
        materialList: [],
        materialMap: {}
    },
    rules: {
        title: [
            { required: true, message: "物料名*必填", type: "error", trigger: "blur" },
            {
                required: true,
                message: "物料名*必填",
                type: "error",
                trigger: "change"
            }
        ]
    }
});

async function onLoadMaterialSpecAll() {
    let distUrl = "/api/biz/md/materialSpecType/list";
    axiosPostJsonBody(
        distUrl,
        {
            status: globalConstDef.enableModel.Enabled
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                material_submit_data.value.specListAll = response.data.data;
                material_submit_data.value.specListForce = response.data.data;
                material_submit_data.value.specListOptional = response.data.data;
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

function onRefreshSpecList() {
    {
        let force = [];
        let optional = [];
        for (let i = 0; i < material_submit_data.value.specListAll.length; i++) {
            let item = material_submit_data.value.specListAll[i];
            if (material_submit_data.value.submitData.specTypeIdsOptional.indexOf(item.id) < 0) {
                force.push(item);
            }

            if (material_submit_data.value.submitData.specTypeIdsForce.indexOf(item.id) < 0) {
                optional.push(item);
            }
        }

        material_submit_data.value.specListForce = force;
        material_submit_data.value.specListOptional = optional;
    }
}

async function doShowMaterialAdd() {
    material_submit_data.value.submitData = {
        specTypeIdsForce: [],
        specTypeIdsOptional: []
    };

    material_submit_data.value.visible = true;
    material_submit_data.value.addMode = true;
}

async function doShowMaterialEdit(editId) {
    material_submit_data.value.addMode = false;
    material_submit_data.value.visible = true;

    oneMaterialById(
        editId,
        response => {
            material_submit_data.value.submitData = response.data;
            onRefreshSpecList();
        },
        response => {
            return;
        }
    );
}
const doSubmitMaterial = () => {
    if (material_submit_data.value.submitData.materialList) {
        for (let i = 0; i < material_submit_data.value.submitData.materialList.length; i++) {
            let code = material_submit_data.value.submitData.materialList[i]["code"];

            material_submit_data.value.submitData.materialList[i]["num"] =
                material_submit_data.value.submitData.materialMap[code];
        }
    }

    let distUrl = "/api/biz/md/material/add";
    if (material_submit_data.value.submitData.id) {
        distUrl = "/api/biz/md/material/change";
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

function doAddMaterialItem() {
    if (!material_submit_data.value.submitData.materialList) {
        material_submit_data.value.submitData.materialList = [];
        material_submit_data.value.submitData.materialMap = {};
    }

    axiosPostJson(
        "/api/biz/md/material/oneByCode",
        {
            materialCode: material_submit_data.value.materialSearchCode
        },
        function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                material_submit_data.value.materialSearchCode = "";
                if (!material_submit_data.value.submitData.materialMap[response.data.data.code]) {
                    material_submit_data.value.submitData.materialList.push({
                        title: response.data.data.title + "【" + response.data.data.unitName + "】",
                        code: response.data.data.code
                    });

                    material_submit_data.value.submitData.materialMap[response.data.data.code] = 1;
                } else {
                    material_submit_data.value.submitData.materialMap[response.data.data.code] =
                        material_submit_data.value.submitData.materialMap[response.data.data.code] +
                        1;
                }
            }
        }
    );
}

function doClearMaterialItem(code) {
    //alert(code);
    delete material_submit_data.value.submitData.materialMap[code];
    material_submit_data.value.submitData.materialList =
        material_submit_data.value.submitData.materialList.filter(item => item.code !== code);
}

const form_query_data = ref({
    title: null,
    code: null,
    status: null,
    materialPackType: null,
    unitId: null,
    categoryId: null,
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
        "/api/biz/md/material/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            title: form_query_data.value.title,
            status: form_query_data.value.status,
            code: form_query_data.value.code,
            materialPackType: form_query_data.value.materialPackType,
            unitId: form_query_data.value.unitId,
            categoryId: form_query_data.value.categoryId
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

function onMaterialCatalogTreeClick(nodeValue) {
    form_query_data.value.categoryId = nodeValue;
    onQueryFormData(true);
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
    onLoadMaterialSpecAll();
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
                    <t-input v-model="form_query_data.code" :clearable="true"></t-input>
                </t-form-item>
                <t-form-item label="物料名称" name="物料名称">
                    <t-input v-model="form_query_data.title" :clearable="true"></t-input>
                </t-form-item>
                <form_material_unit label="基本单位" v-model="form_query_data.unitId" />
                <form_enum_list
                    label="物料类型"
                    v-model="form_query_data.materialPackType"
                    v-if="globalLoginData.commonData"
                    :options="globalLoginData.commonData.materialPackType"
                    :widthPx="160"
                />
                <form_enum_list
                    label="是否启用"
                    v-model="form_query_data.status"
                    v-if="globalLoginData.commonData"
                    :options="globalLoginData.commonData.enableModel"
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
                    物料
                </t-button>
            </div>
        </template>
        <t-space>
            <t-card :style="{ padding: '5px 10px' }">
                <t_form_item_material_catelog_tree @active="onMaterialCatalogTreeClick" />
            </t-card>
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
        </t-space>
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
        header="物料编码"
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
        <template #header>物料信息</template>
        <t-form
            :rules="material_submit_data.rules"
            :data="material_submit_data.submitData"
            requiredMarkPosition="right"
        >
            <t_form_item_material_catelog_list
                label="物料类目"
                help="*必填，物料类目"
                v-model="material_submit_data.submitData.catalogId"
            />
            <form_enum_radio_group
                label="物料类型"
                help="*必填"
                v-model="material_submit_data.submitData.materialPackType"
                :disabled="!material_submit_data.addMode"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.materialPackType"
            />
            <form_enum_radio_group
                label="生产方式"
                help="*必填"
                v-model="material_submit_data.submitData.materialProduceType"
                :disabled="!material_submit_data.addMode"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.materialProduceType"
            />
            <t-form-item label="物料名称" name="物料名称" help="*必填，物料名称">
                <t-input placeholder="物料名称" v-model="material_submit_data.submitData.title" />
            </t-form-item>
            <form_material_unit
                label="基本单位"
                help="*必填"
                v-model="material_submit_data.submitData.unitId"
                :disabled="!material_submit_data.addMode"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
            <form_enum_radio_group
                label="是否启用"
                help="*必填"
                v-model="material_submit_data.submitData.status"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="material_submit_data.submitData.remark" />
            </t-form-item>
            <t-divider
                v-if="
                    material_submit_data.submitData.materialPackType ==
                    globalConstDef.materialPackType.PackAgain
                "
            >
                打包配置
            </t-divider>
            <t-form-item
                label="新增子物料"
                name="新增子物料"
                v-show="
                    material_submit_data.submitData.materialPackType ==
                    globalConstDef.materialPackType.PackAgain
                "
                help="*必填, 输入后请回车"
            >
                <t-input
                    :clearable="true"
                    v-model="material_submit_data.materialSearchCode"
                ></t-input>
                <template #statusIcon>
                    <t-button variant="dashed" @click="doAddMaterialItem">
                        <t-icon name="add" />
                    </t-button>
                </template>
            </t-form-item>
            <t-form-item
                label="子物料列表"
                name="子物料列表"
                v-show="
                    material_submit_data.submitData.materialPackType ==
                    globalConstDef.materialPackType.PackAgain
                "
            >
                <table>
                    <tr v-for="mi in material_submit_data.submitData.materialList">
                        <td>
                            <span>{{ mi.title }} / {{ mi.code }}</span>
                        </td>
                        <td>
                            <t-input-number
                                v-model="material_submit_data.submitData.materialMap[mi.code]"
                                :autoWidth="true"
                                :allowInputOverLimit="false"
                                :decimalPlaces="0"
                                style="margin-left: 16px"
                                size="small"
                                :max="100"
                                :min="1"
                            />
                        </td>
                        <td>
                            <t-link
                                theme="primary"
                                hover="color"
                                style="margin-left: 16px"
                                @click="doClearMaterialItem(mi.code)"
                            >
                                <i class="icon-remove"></i>
                            </t-link>
                        </td>
                    </tr>
                </table>
            </t-form-item>
            <t-divider>规格配置</t-divider>
            <t-form-item label="必选规格" name="必选规格" help="勾选物料关联规格">
                <t-select
                    v-model="material_submit_data.submitData.specTypeIdsForce"
                    :multiple="true"
                    @change="onRefreshSpecList"
                >
                    <t-option
                        v-for="item in material_submit_data.specListForce"
                        :key="item.id"
                        :label="item.title"
                        :value="item.id"
                    />
                </t-select>
            </t-form-item>
            <t-form-item label="可选规格" name="可选规格" help="勾选物料关联规格">
                <t-select
                    v-model="material_submit_data.submitData.specTypeIdsOptional"
                    :multiple="true"
                    @change="onRefreshSpecList"
                >
                    <t-option
                        v-for="item in material_submit_data.specListOptional"
                        :key="item.id"
                        :label="item.title"
                        :value="item.id"
                    />
                </t-select>
            </t-form-item>
        </t-form>
    </t-drawer>
</template>

<style scoped>
.more-detail {
    line-height: 22px;
    > p {
        display: inline-block;
        margin: 4px 0;
    }
}
</style>
