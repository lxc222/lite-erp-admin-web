<script setup lang="jsx">
import { ref, watch, onMounted } from "vue";

const thisModel = defineModel();

import { MessagePlugin } from "tdesign-vue-next";
import { AddIcon, CloseIcon, EditIcon } from "tdesign-icons-vue-next";

import {
    axiosPostJson,
    axiosPostJsonBody,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";

import { getOneWmsHouseRack } from "@/assets/asset_biz_wms_20251024.js";

const table_columns = [
    {
        colKey: "rackTitleWhole",
        title: "库位信息",
        align: "left",
        cell: (h, { row }) => {
            let jsx = [];
            jsx.push(<span>【库位编号】{row.rackTitle}</span>);
            jsx.push(<p class="my_p_divider" />);
            jsx.push(<span>【仓库中心】{row.centerTitle}</span>);
            jsx.push(<p class="my_p_divider" />);
            jsx.push(<span>【归属仓库】{row.houseTitleWithRegion}</span>);
            return jsx;
        }
    },
    {
        colKey: "num",
        title: "物料数量",
        width: 120,
        align: "right"
    },
    { colKey: "refOperation", align: "left", width: 210, title: "关联操作" }
];

const deduct_drawer_model = ref({
    visible: false,
    rack_data_list: [],
    rack_data_map: {},
    adjustOrderId: null,
    stockNum: null,
    rackStockSum: 0,
    centerId: null,
    regionId: null
});

function doSubmitRackAll() {
    let param = {
        orderId: deduct_drawer_model.value.adjustOrderId,
        remark: null,
        rackId2NumMap: deduct_drawer_model.value.rack_data_map
    };

    axiosPostJsonBody("/api/biz/wms/stockAdjust/submitById", param, function (response) {
        if (isAjaxRspSucc(response)) {
            MessagePlugin.info({
                content: response.data.data,
                duration: 3000,
                closeBtn: true,
                placement: "center",
                onClose: function () {}
            });

            deduct_drawer_model.value.visible = false;
        } else {
            MessagePlugin.error({
                content: response.data.tipMsg,
                duration: 3000,
                closeBtn: true,
                placement: "center",
                onClose: function () {}
            });
        }
    });
}

const rack_new_input_model = ref({
    addMode: false,
    visible: false,
    rackId: null,
    num: null
});

function onShowRackNewAdd() {
    onLoadStockRackData(deduct_drawer_model.value.adjustOrderId);

    rack_new_input_model.value = {
        addMode: true,
        visible: true
    };
}

function onSubmitRackNew() {
    if (!rack_new_input_model.value.rackId || rack_new_input_model.value.rackId < 1) {
        MessagePlugin.error({
            content: "请选择库位编号",
            duration: 3000,
            closeBtn: true,
            placement: "center",
            onClose: function () {}
        });
        return;
    }

    if (!rack_new_input_model.value.num || rack_new_input_model.value.num < 1) {
        MessagePlugin.error({
            content: "请输入物料数量",
            duration: 3000,
            closeBtn: true,
            placement: "center",
            onClose: function () {}
        });
        return;
    }

    onDeleteRackExit(rack_new_input_model.value.rackId);

    getOneWmsHouseRack(
        rack_new_input_model.value.rackId,
        response => {
            let rackVo = response.data;
            deduct_drawer_model.value.rack_data_map[rack_new_input_model.value.rackId] =
                rack_new_input_model.value.num;

            deduct_drawer_model.value.rack_data_list.push({
                rackId: rack_new_input_model.value.rackId,
                centerTitle: rackVo.centerTitle,
                houseTitleWithRegion: rackVo.houseTitleWithRegion,
                rackTitle: rackVo.title,
                rackTitleWhole:
                    rackVo.centerTitle + "/" + rackVo.houseTitleWithRegion + "/" + rackVo.title,
                num: rack_new_input_model.value.num
            });

            rack_new_input_model.value.visible = false;

            var totalStockNum = 0;
            deduct_drawer_model.value.rack_data_list.forEach(function (item, index) {
                totalStockNum += deduct_drawer_model.value.rack_data_map[item.rackId];
            });

            deduct_drawer_model.value.rackStockSum = totalStockNum;
        },
        () => {}
    );
}

function onDeleteRackExit(rackId) {
    var mapNum = deduct_drawer_model.value.rack_data_map[rackId];
    if (mapNum) {
        delete deduct_drawer_model.value.rack_data_map[rackId];
        deduct_drawer_model.value.rack_data_list = deduct_drawer_model.value.rack_data_list.filter(
            item => item.rackId !== rackId
        );
    }
}

function onChangeRackExit(rackId) {
    var mapNum = deduct_drawer_model.value.rack_data_map[rackId];
    if (mapNum) {
        rack_new_input_model.value = {
            addMode: false,
            visible: true,
            rackId: rackId,
            num: mapNum
        };
    }
}

watch(
    thisModel,
    (newVal, oldVal) => {
        const visible = newVal.visible;
        if (visible) {
            deduct_drawer_model.value.visible = true;
        } else {
            deduct_drawer_model.value.visible = false;
        }

        deduct_drawer_model.value.rack_data_list = [];
        deduct_drawer_model.value.rack_data_map = {};
        deduct_drawer_model.value.adjustOrderId = newVal.adjustOrderId;
        deduct_drawer_model.value.stockNum = newVal.stockNum;
        deduct_drawer_model.value.rackStockSum = 0;
        deduct_drawer_model.value.centerId = newVal.centerId;
        deduct_drawer_model.value.regionId = newVal.regionId;
    },
    { immediate: true, deep: true }
);

const stock_rack_data_list = ref([]);

async function onLoadStockRackData(adjustOrderId) {
    stock_rack_data_list.value = [];

    if (!adjustOrderId || adjustOrderId < 1) {
        return;
    }

    axiosPostJson(
        "/api/biz/wms/stockAdjust/getStockRackById",
        { orderId: adjustOrderId },
        function (response) {
            if (isAjaxRspSucc(response)) {
                stock_rack_data_list.value = response.data.data;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

onMounted(async () => {});
</script>
<template>
    <t-drawer
        id="deduct_drawer_model"
        v-model:visible="deduct_drawer_model.visible"
        size="40%"
        placement="right"
        :closeBtn="true"
        :cancelBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
    >
        <template #header> 出库执行 </template>
        <template #footer>
            <t-button theme="primary" shape="round" type="button" @click="doSubmitRackAll">
                提交所有
            </t-button>
        </template>
        <t-card headerBordered :style="{ margin: '0px' }" id="data_table">
            <template #header>
                <div>
                    <t-button
                        theme="primary"
                        shape="round"
                        variant="outline"
                        @click="onShowRackNewAdd()"
                    >
                        <template #icon><AddIcon /></template>
                        新增出库
                    </t-button>
                </div>
                <div style="float: right; font-weight: bold">
                    <span>应出库数量：{{ deduct_drawer_model.stockNum }}</span>
                </div>
            </template>
            <template #footer>当前总数：{{ deduct_drawer_model.rackStockSum }}</template>
            <t-table
                row-key="index"
                :data="deduct_drawer_model.rack_data_list"
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
                    <t-button
                        theme="danger"
                        shape="round"
                        variant="outline"
                        @click="onDeleteRackExit(row.rackId)"
                    >
                        <template #icon><CloseIcon />删除</template>
                    </t-button>
                    &nbsp;&nbsp;
                    <t-button
                        theme="primary"
                        shape="round"
                        variant="outline"
                        @click="onChangeRackExit(row.rackId)"
                    >
                        <template #icon><EditIcon />修改</template>
                    </t-button>
                </template>
            </t-table>
        </t-card>
    </t-drawer>
    <t-dialog
        id="rack_new_input_model"
        v-model:visible="rack_new_input_model.visible"
        header="操作库位"
        width="50%"
        :closeBtn="true"
        :cancelBtn="null"
        confirmBtn="提交"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
        @confirm="onSubmitRackNew"
    >
        <t-form :data="rack_new_input_model" requiredMarkPosition="right">
            <t-form-item label="关联库位" name="关联库位" help="*必填">
                <t-select
                    v-model="rack_new_input_model.rackId"
                    :clearable="true"
                    :filterable="true"
                >
                    <t-option
                        v-for="item in stock_rack_data_list"
                        :key="item.rackId"
                        :label="
                            item.rackTitle +
                            '(架) | 库存:' +
                            item.stockNum +
                            ' | ' +
                            item.centerTitle +
                            '/' +
                            item.houseTitleWithRegion +
                            '(仓)'
                        "
                        :value="item.rackId"
                    />
                </t-select>
            </t-form-item>
            <t-form-item label="物料数量" name="物料数量" help="*必填，请输入大于0的整数">
                <t-input
                    v-model="rack_new_input_model.num"
                    :clearable="true"
                    type="number"
                ></t-input>
            </t-form-item>
        </t-form>
    </t-dialog>
</template>

<style scoped></style>
