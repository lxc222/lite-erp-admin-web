<script setup lang="jsx">
import { ref, onMounted } from "vue";

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
import table_with_pagination from "@/components/table_with_pagination.vue";
import form_enum_list from "@/components/form_enum_list.vue";
import form_enum_radio_group from "@/components/form_enum_radio_group.vue";
import enable_status_tag from "@/components/enable_status_tag.vue";

const table_columns = [
    { colKey: "id", title: "#ID" },
    { colKey: "title", title: "货品名称" },
    { colKey: "code", title: "货品编码" },
    {
        colKey: "costPrice",
        title: "成本￥",
        align: "right",
        cell: (h, { row }) => {
            return <span>￥{row.costPrice}</span>;
        }
    },
    {
        colKey: "salePrice",
        title: "建议售价￥",
        align: "right",
        cell: (h, { row }) => {
            return <span>￥{row.salePrice}</span>;
        }
    },
    {
        colKey: "memberPrice",
        title: "会员售价￥",
        align: "right",
        cell: (h, { row }) => {
            return <span>￥{row.memberPrice}</span>;
        }
    },
    { colKey: "stock", title: "剩余库存", align: "right" },
    { colKey: "saleStatusTitle", title: "销售状态" },
    { colKey: "ware2MaterialTypeStr", title: "类型" },
    {
        colKey: "materialList",
        title: "物料信息",
        cell: (h, { row }) => {
            if (!row.materialList) {
                return <span>无</span>;
            } else {
                let jsx = [];
                for (let i = 0; i < row.materialList.length; i++) {
                    let item = row.materialList[i];
                    jsx.push(
                        <span>
                            {item.title} x {item.num}
                        </span>
                    );
                    if (i < row.materialList.length - 1) {
                        jsx.push(<br />);
                    }
                }

                return jsx;
            }
        }
    },
    { colKey: "remark", title: "备注" },
    { colKey: "createAction", title: "创建操作" },
    { colKey: "updateAction", title: "最后修改" },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const ware_deduct_model = ref({
    visible: false,
    submitData: {
        wareId: null,
        stock: null,
        remark: null
    },
    rules: {}
});
async function showWareConsume(editId) {
    ware_deduct_model.value.submitData = { wareId: editId };
    ware_deduct_model.value.visible = true;
}

const submitWareConsume = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        ware_deduct_model.value.visible = false;
        let distUrl = "/api/biz/o2o/ware/consume";
        axiosPostJson(distUrl, ware_deduct_model.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
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
        });
    } else {
        // console.log("Validate Errors: ", firstError, validateResult);
        MessagePlugin.error(firstError);
    }
};

const ware_deposit_model = ref({
    visible: false,
    submitData: {
        wareId: null,
        stock: null,
        remark: null
    },
    rules: {}
});
async function showWareDeposit(editId) {
    ware_deposit_model.value.submitData = { wareId: editId };
    ware_deposit_model.value.visible = true;
}

const submitWareDeposit = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        ware_deposit_model.value.visible = false;
        let distUrl = "/api/biz/o2o/ware/deposit";
        axiosPostJson(distUrl, ware_deposit_model.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
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
        });
    } else {
        // console.log("Validate Errors: ", firstError, validateResult);
        MessagePlugin.error(firstError);
    }
};
async function showEnableOrDisable(editId) {
    const confirmDia = DialogPlugin.confirm({
        header: "可售状态切换",
        body: "调整货品可售状态",
        closeBtn: false,
        closeOnEscKeydown: false,
        destroyOnClose: true,
        closeOnOverlayClick: false,
        confirmBtn: "确认",
        cancelBtn: "关闭",
        onConfirm: ({ e }) => {
            confirmDia.hide();
            axiosPostJson(
                "/api/biz/o2o/ware/enableOrDisable",
                {
                    wareId: editId
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

const memberClickHandler = data => {
    if ("修改货品" === data.content) {
        showWareEdit(data.value);
    } else if ("启售/禁售" === data.content) {
        showEnableOrDisable(data.value);
    } else if ("货品出库" === data.content) {
        showWareConsume(data.value);
    } else if ("货品入库" === data.content) {
        showWareDeposit(data.value);
    } else {
    }
};

const ware_submit_model = ref({
    visible: false,
    submitData: {
        id: null,
        title: null,
        costPrice: null,
        salePrice: null,
        memberPrice: null,
        saleStatus: null,
        wareType: null,
        stockSaleType: null,
        remark: null,
        materialSearchCode: null,
        materialList: [],
        materialMap: {}
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

async function showWareAdd() {
    ware_submit_model.value.submitData = {};
    ware_submit_model.value.visible = true;
}

async function showWareEdit(editId) {
    ware_submit_model.value.visible = true;
    axiosPostJson(
        "/api/biz/o2o/ware/one",
        {
            id: editId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                ware_submit_model.value.submitData = response.data.data;
            }
        }
    );
}
const onSubmitWare = () => {
    //for循环 ware_submit_model.value.submitData.materialList
    if (ware_submit_model.value.submitData.materialList) {
        for (let i = 0; i < ware_submit_model.value.submitData.materialList.length; i++) {
            let code = ware_submit_model.value.submitData.materialList[i]["code"];

            ware_submit_model.value.submitData.materialList[i]["num"] =
                ware_submit_model.value.submitData.materialMap[code];
        }
    }

    let distUrl = "/api/biz/o2o/ware/addOrEdit";
    axiosPostJsonBody(distUrl, ware_submit_model.value.submitData, function (response) {
        if (!isAjaxRspSucc(response)) {
            MessagePlugin.error({
                ...message_plugin_config,
                content: response.data.tipMsg
            });
        } else {
            ware_submit_model.value.visible = false;
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

const form_query_data = ref({
    title: null,
    saleStatus: null,
    page: {
        pageNo: 1,
        pageSize: 10,
        totalNum: 0,
        totalPage: 0
    },
    pageData: []
});
function addMaterialItem() {
    if (!ware_submit_model.value.submitData.materialList) {
        ware_submit_model.value.submitData.materialList = [];
        ware_submit_model.value.submitData.materialMap = {};
    }

    axiosPostJson(
        "/api/biz/md/material/oneByCode",
        {
            materialCode: ware_submit_model.value.submitData.materialSearchCode
        },
        function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                ware_submit_model.value.submitData.materialSearchCode = "";
                if (!ware_submit_model.value.submitData.materialMap[response.data.data.code]) {
                    ware_submit_model.value.submitData.materialList.push({
                        title: response.data.data.title,
                        code: response.data.data.code
                    });

                    ware_submit_model.value.submitData.materialMap[response.data.data.code] = 1;
                } else {
                    ware_submit_model.value.submitData.materialMap[response.data.data.code] =
                        ware_submit_model.value.submitData.materialMap[response.data.data.code] + 1;
                }
            }
        }
    );
}

function clearMaterialItem(code) {
    //alert(code);
    delete ware_submit_model.value.submitData.materialMap[code];
    ware_submit_model.value.submitData.materialList =
        ware_submit_model.value.submitData.materialList.filter(item => item.code !== code);
}

function onQueryFormData(resetPage) {
    if (resetPage) {
        form_query_data.value.page.pageNo = 1;
    }

    LoadingPlugin(true);
    axiosPostJsonBody(
        "/api/biz/o2o/ware/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            title: form_query_data.value.title,
            saleStatus: form_query_data.value.saleStatus
        },
        function (response) {
            LoadingPlugin(false);
            if (isAjaxRspSucc(response)) {
                ajaxPageDataParse(response.data.data, form_query_data);
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
    <t-card :bordered="true" :style="{ margin: '5px' }" id="form_data">
        <div style="padding-top: 10px; padding-bottom: 10px">
            <t-form
                label-align="right"
                labelWidth="60px"
                :data="form_query_data"
                layout="inline"
                scroll-to-first-error="smooth"
                @submit="onQueryFormData(true)"
            >
                <t-form-item label="货品名称" name="货品名称">
                    <t-input v-model="form_query_data.title"></t-input>
                </t-form-item>
                <form_enum_list
                    label="启用状态"
                    v-model="form_query_data.saleStatus"
                    v-if="thisModel.commonData"
                    :options="thisModel.commonData.o2oWareSaleStatus"
                    :widthPx="160"
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
        @pageChange="onQueryFormData(false)"
        @pageSizeChange="onQueryFormData(false)"
    >
        <template #headerActions>
            <div>
                <t-button theme="primary" variant="outline" @click="showWareAdd()">
                    <template #icon><AddIcon /></template>
                    货品
                </t-button>
            </div>
        </template>
        <template #refOperation="{ row }">
            <t-dropdown
                :options="[
                    { content: '修改货品', value: row.id },
                    { content: '启售/禁售', value: row.id, divider: true },
                    { content: '货品入库', value: row.id },
                    { content: '货品出库', value: row.id }
                ]"
                @click="memberClickHandler"
            >
                <t-button theme="success" shape="round">
                    更多&nbsp;
                    <span><i class="icon-chevron-down"></i></span>
                </t-button>
            </t-dropdown>
        </template>
    </table_with_pagination>
    <t-dialog
        id="ware_submit_model"
        :closeBtn="true"
        :cancelBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
        width="40%"
        v-model:visible="ware_submit_model.visible"
        header="货品信息"
        @confirm="onSubmitWare"
    >
        <t-form
            :rules="ware_submit_model.rules"
            :data="ware_submit_model.submitData"
            requiredMarkPosition="right"
        >
            <t-form-item label="货品名称" name="货品名称" help="*必填，货品名称">
                <t-input placeholder="货品名称" v-model="ware_submit_model.submitData.title" />
            </t-form-item>
            <t-form-item label="成本单价" name="成本单价" help="*必填，(最高支持两位小数)">
                <t-input
                    placeholder="成本单价"
                    label="￥"
                    suffix="元"
                    type="number"
                    v-model="ware_submit_model.submitData.costPrice"
                />
            </t-form-item>
            <t-form-item label="售价单价" name="售价单价" help="*必填，(最高支持两位小数)">
                <t-input
                    label="￥"
                    suffix="元"
                    type="number"
                    placeholder="建议售价"
                    v-model="ware_submit_model.submitData.salePrice"
                />
            </t-form-item>
            <t-form-item label="会员单价" name="会员单价" help="*必填，(最高支持两位小数)">
                <t-input
                    label="￥"
                    suffix="元"
                    type="number"
                    placeholder="会员售价"
                    v-model="ware_submit_model.submitData.memberPrice"
                />
            </t-form-item>
            <form_enum_radio_group
                label="可售状态"
                help="*必填"
                v-model="ware_submit_model.submitData.saleStatus"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.o2oWareSaleStatus"
            />
            <form_enum_radio_group
                label="货品类型"
                help="*必填"
                v-model="ware_submit_model.submitData.wareType"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.o2oWareType"
            />
            <form_enum_radio_group
                label="库存管控"
                help="*必填"
                v-model="ware_submit_model.submitData.stockSaleType"
                v-if="thisModel.commonData"
                :options="thisModel.commonData.o2oWareSaleStockType"
            />
            <t-form-item label="新增物料" name="新增物料">
                <t-input
                    :clearable="true"
                    v-model="ware_submit_model.submitData.materialSearchCode"
                ></t-input>
                <template #statusIcon>
                    <t-button variant="dashed" @click="addMaterialItem">
                        <t-icon name="add" />
                    </t-button>
                </template>
            </t-form-item>
            <t-form-item label="物料列表" name="物料列表">
                <table>
                    <tr
                        v-if="ware_submit_model.submitData"
                        v-for="mi in ware_submit_model.submitData.materialList"
                    >
                        <td>
                            <span>{{ mi.title }} / {{ mi.code }}</span>
                        </td>
                        <td>
                            <t-input-number
                                :autoWidth="true"
                                :allowInputOverLimit="false"
                                :decimalPlaces="0"
                                style="margin-left: 16px"
                                v-model="ware_submit_model.submitData.materialMap[mi.code]"
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
                                @click="clearMaterialItem(mi.code)"
                            >
                                <i class="icon-remove"></i>
                            </t-link>
                        </td>
                    </tr>
                </table>
            </t-form-item>
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="ware_submit_model.submitData.remark" />
            </t-form-item>
        </t-form>
    </t-dialog>
    <t-dialog
        id="ware_deduct_model"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
        v-model:visible="ware_deduct_model.visible"
        header="货品出库"
    >
        <t-form
            :rules="ware_deduct_model.rules"
            :data="ware_deduct_model.submitData"
            requiredMarkPosition="right"
            @submit="submitWareConsume"
        >
            <t-form-item label="出库数量" name="出库数量" help="(输入整数，不支持小数)">
                <t-input placeholder="扣减数量" v-model="ware_deduct_model.submitData.stock" />
            </t-form-item>
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="ware_deduct_model.submitData.remark" />
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
        id="ware_deposit_model"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
        v-model:visible="ware_deposit_model.visible"
        header="货品入库"
    >
        <t-form
            :rules="ware_deposit_model.rules"
            :data="ware_deposit_model.submitData"
            requiredMarkPosition="right"
            @submit="submitWareDeposit"
        >
            <t-form-item label="入库数量" name="入库数量" help="(输入整数，不支持小数)">
                <t-input placeholder="充值数量" v-model="ware_deposit_model.submitData.stock" />
            </t-form-item>
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="ware_deposit_model.submitData.remark" />
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
