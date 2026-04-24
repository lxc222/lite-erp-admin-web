<script setup lang="jsx">
import { ref, watch, onMounted } from "vue";

const thisModel = defineModel();

import { SearchIcon } from "tdesign-icons-vue-next";
import { MessagePlugin } from "tdesign-vue-next";

import {
    axiosPostJson,
    axiosPostJsonBody,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";
import { message_plugin_config } from "@/assets/asset_biz_base_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";
import { getOneWmsHouseCenter } from "@/assets/asset_biz_wms_20251024.js";

import form_enum_radio_group from "@/components/form_enum_radio_group.vue";
import t_form_item_merchant from "@/components/md/t_form_item_merchant.vue";
import t_form_item_employee from "@/components/md/t_form_item_employee.vue";
import form_stock_unit_ratio from "@/components/wms/form_stock_unit_ratio.vue";
import form_spec_material from "@/components/md/form_spec_material.vue";
import t_form_item_house_center_list from "@/components/wms/t_form_item_house_center_list.vue";
import t_form_item_house_region_list from "@/components/wms/t_form_item_house_region_list.vue";
import t_form_item_stock_adjust_time_range from "@/components/wms/t_form_item_stock_adjust_time_range.vue";
import form_stock_group_list from "@/components/wms/form_stock_group_list.vue";
import material_deduct from "@/wms/stock_center/material_deduct.vue";

const table_columns = [
    {
        colKey: "materialTitle",
        title: "物料",
        cell: (h, { row }) => {
            return (
                <span>
                    {row.materialTitle} / {row.materialSpecValueTxt}
                </span>
            );
        }
    },
    { colKey: "specMaterialCode", title: "物料编码" },
    {
        colKey: "saleNum",
        title: "销售数量",
        width: 120,
        cell: (h, { row }) => {
            return (
                <span>
                    {row.saleNum} {row.saleUnitTitle}
                </span>
            );
        }
    },
    {
        colKey: "checkNumSaleUnit",
        title: "发货数量",
        align: "center",
        children: [
            {
                colKey: "checkNumSaleUnit",
                title: "采购单位",
                children: [
                    {
                        colKey: "checkNumSaleUnit",
                        title: "实收",
                        width: 120,
                        cell: (h, { row }) => {
                            return (
                                <span>
                                    {row.checkNumSaleUnit} {row.saleUnitTitle}
                                </span>
                            );
                        }
                    },
                    {
                        colKey: "checkNumSaleUnitLoss",
                        title: "报损",
                        width: 120,
                        cell: (h, { row }) => {
                            return (
                                <span>
                                    {row.checkNumSaleUnitLoss} {row.saleUnitTitle}
                                </span>
                            );
                        }
                    }
                ]
            },
            {
                colKey: "checkNumStockUnit",
                title: "库存单位",
                children: [
                    {
                        colKey: "checkNumStockUnit",
                        title: "实收",
                        width: 120,
                        cell: (h, { row }) => {
                            return (
                                <span>
                                    {row.checkNumStockUnit} {row.stockUnitTitle}
                                </span>
                            );
                        }
                    },
                    {
                        colKey: "checkNumStockUnitLoss",
                        title: "报损",
                        width: 120,
                        cell: (h, { row }) => {
                            return (
                                <span>
                                    {row.checkNumStockUnitLoss} {row.stockUnitTitle}
                                </span>
                            );
                        }
                    }
                ]
            },
            {
                colKey: "checkNumMaterialUnit",
                title: "基本单位",
                children: [
                    {
                        colKey: "checkNumMaterialUnit",
                        title: "实收",
                        width: 120,
                        cell: (h, { row }) => {
                            return (
                                <span>
                                    {row.checkNumMaterialUnit} {row.materialUnitTitle}
                                </span>
                            );
                        }
                    },
                    {
                        colKey: "checkNumMaterialUnitLoss",
                        title: "报损",
                        width: 120,
                        cell: (h, { row }) => {
                            return (
                                <span>
                                    {row.checkNumMaterialUnitLoss} {row.materialUnitTitle}
                                </span>
                            );
                        }
                    }
                ]
            }
        ]
    },
    {
        colKey: "stockNumLoss",
        title: "出库库数量(基本单位)",
        align: "center",
        children: [
            { colKey: "stockNumLoss", title: "出库报损", width: 120 },
            { colKey: "stockNumDone", title: "已出库", width: 120 },
            { colKey: "stockNumDoing", title: "出库中", width: 120 }
        ]
    },
    { colKey: "refOperation", title: "关联操作" }
];

const detail_show_model = ref({
    visible: false,
    orderId: null,
    listData: [],
    rules: {}
});

watch(
    thisModel,
    (newVal, oldVal) => {
        // console.log("onShowOrderDetail", newVal);
        const visible = newVal.visible;
        const orderId = newVal.orderId;
        if (!orderId || orderId < 1) {
            // MessagePlugin.error({
            //     content: "无法加载订单",
            //     duration: 3000,
            //     closeBtn: true,
            //     placement: "center",
            //     onClose: function () {}
            // });
            return;
        }

        detail_show_model.value.orderId = orderId;
        onLoadOrderItem();
        detail_show_model.value.visible = visible;
    },
    { immediate: true, deep: true }
);

function onShowTableLineMenu(row) {
    if (row.operateFlag.deductStock || row.operateFlag.checkWare) {
        return true;
    } else {
        return false;
    }
}
function onBuildTableLineMenu(row) {
    let menus = [];

    if (row.operateFlag.deductStock) {
        menus.push({
            content: "物料出库",
            action: "deductStock",
            value: row,
            divider: true
        });
    }

    if (row.operateFlag.checkWare) {
        menus.push({
            content: "开始发货",
            action: "checkWare",
            value: row,
            divider: true
        });
    }

    return menus;
}

const onTableLineMenuHandler = data => {
    if ("deductStock" === data.action) {
        onSubmitDeduct(data.value);
    } else if ("checkWare" === data.action) {
        onShowCheckData(data.value);
    } else {
        MessagePlugin.error({
            content: "未知操作选项",
            duration: 3000,
            closeBtn: true,
            placement: "center",
            onClose: function () {}
        });
    }
};

const deduct_submit_model = ref({
    visible: false,
    bizEmployeeId: null,
    refBizOrderNo: null,
    specMaterialId: null,
    stockUnitRatioId: null
});

function onSubmitDeduct(row) {
    // console.log("onSubmitDeduct", JSON.stringify(row));
    deduct_submit_model.value = {
        visible: true,
        bizEmployeeId: null,
        refBizOrderNo: row.id,
        specMaterialId: row.specMaterialId,
        stockUnitRatioId: row.stockUnitRatioId
    };
}

const check_submit_model = ref({
    visible: false,
    submitData: {
        orderNo: null,
        itemId: null,
        checkNum: null,
        checkNumLoss: null
    }
});

function onShowCheckData(row) {
    check_submit_model.value.submitData = {
        orderNo: row.orderNo,
        itemId: row.id,
        checkNum: null,
        checkNumLoss: null
    };

    check_submit_model.value.visible = true;
}

function onSubmitCheckData() {
    axiosPostJsonBody(
        "/api/biz/scm/purchaseOrderItem/checkNum",
        check_submit_model.value.submitData,
        function (response) {
            if (isAjaxRspSucc(response)) {
                MessagePlugin.info({
                    ...message_plugin_config,
                    content: response.data.data
                });
                check_submit_model.value.visible = false;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

function onLoadOrderItem() {
    if (!detail_show_model.value.orderId || detail_show_model.value.orderId < 1) {
        return;
    }

    axiosPostJson(
        "/api/biz/scm/saleOrderItem/listOrderItem",
        {
            orderId: detail_show_model.value.orderId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                detail_show_model.value.listData = response.data.data;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

onMounted(async () => {
    onLoadOrderItem();
});
</script>
<template>
    <t-drawer
        id="detail_show_model"
        v-model:visible="detail_show_model.visible"
        size="100%"
        placement="right"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
    >
        <template #header>
            物料列表 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <t-button theme="primary" variant="outline" shape="round" @click="onLoadOrderItem">
                <template #icon><SearchIcon /></template>
                刷新
            </t-button></template
        >
        <t-card header-bordered :style="{ margin: '5px' }" id="data_table">
            <t-table
                row-key="id"
                :data="detail_show_model.listData"
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
                        :minColumnWidth="150"
                        v-if="onShowTableLineMenu(row)"
                    >
                        <t-button theme="success" shape="round">
                            相关操作&nbsp;
                            <span><i class="icon-chevron-down"></i></span>
                        </t-button>
                    </t-dropdown>
                </template>
            </t-table>
        </t-card>
    </t-drawer>

    <material_deduct
        :bizEmployeeId="deduct_submit_model.bizEmployeeId"
        :refBizOrderNo="deduct_submit_model.refBizOrderNo"
        :specMaterialId="deduct_submit_model.specMaterialId"
        :stockUnitRatioId="deduct_submit_model.stockUnitRatioId"
        v-model="deduct_submit_model"
        dstUrl="/api/biz/scm/saleOrderItem/deductStock"
    />

    <t-dialog
        id="check_submit_model"
        v-model:visible="check_submit_model.visible"
        header="收货信息"
        width="30%"
        :closeBtn="true"
        :cancelBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
        @confirm="onSubmitCheckData"
    >
        <t-form :data="check_submit_model.submitData" requiredMarkPosition="right">
            <t-form-item label="实收数量" name="实收数量" help="*必填">
                <t-input
                    placeholder="实收数量"
                    suffix="采购单位"
                    type="number"
                    v-model="check_submit_model.submitData.checkNum"
                />
            </t-form-item>
            <t-form-item
                label="报损数量"
                name="报损数量"
                type="number"
                help="*必填，收货过程中造成的损失，不入库"
            >
                <t-input
                    placeholder="报损数量"
                    suffix="采购单位"
                    v-model="check_submit_model.submitData.checkNumLoss"
                />
            </t-form-item>
        </t-form>
    </t-dialog>
</template>

<style scoped></style>
