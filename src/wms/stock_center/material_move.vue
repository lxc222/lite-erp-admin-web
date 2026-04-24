<script setup lang="jsx">
import { ref, watch, onMounted } from "vue";

const thisModel = defineModel();

import { MessagePlugin } from "tdesign-vue-next";
import { AddIcon, CloseIcon, EditIcon } from "tdesign-icons-vue-next";

import { axiosPostJsonBody, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

import { getOneWmsHouseRack } from "@/assets/asset_biz_wms_20251024.js";

import t_form_item_house_rack_list from "@/components/wms/t_form_item_house_rack_list.vue";

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

const move_drawer_model = ref({
    visible: false,
    rack_data_list: [],
    rack_data_map: {},
    batchId: null,
    stockNum: null,
    rackStockSum: 0,
    centerId: null
});

function doSubmitRackAll() {
    let param = {
        batchId: move_drawer_model.value.batchId,
        rackId2NumMap: move_drawer_model.value.rack_data_map
    };

    axiosPostJsonBody("/api/biz/wms/stockCenter/batchMove", param, function (response) {
        if (isAjaxRspSucc(response)) {
            console.log("response", response.data.data);

            MessagePlugin.info({
                content: response.data.data,
                duration: 3000,
                closeBtn: true,
                placement: "center",
                onClose: function () {}
            });

            move_drawer_model.value.visible = false;
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
            move_drawer_model.value.rack_data_map[rack_new_input_model.value.rackId] =
                rack_new_input_model.value.num;

            move_drawer_model.value.rack_data_list.push({
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
            move_drawer_model.value.rack_data_list.forEach(function (item, index) {
                totalStockNum += move_drawer_model.value.rack_data_map[item.rackId];
            });

            move_drawer_model.value.rackStockSum = totalStockNum;
        },
        () => {}
    );
}

function onDeleteRackExit(rackId) {
    var mapNum = move_drawer_model.value.rack_data_map[rackId];
    if (mapNum) {
        delete move_drawer_model.value.rack_data_map[rackId];
        move_drawer_model.value.rack_data_list = move_drawer_model.value.rack_data_list.filter(
            item => item.rackId !== rackId
        );
    }
}

function onChangeRackExit(rackId) {
    var mapNum = move_drawer_model.value.rack_data_map[rackId];
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
            move_drawer_model.value.visible = true;
        } else {
            move_drawer_model.value.visible = false;
        }

        move_drawer_model.value.rack_data_list = [];
        move_drawer_model.value.rack_data_map = {};
        move_drawer_model.value.adjustOrderId = newVal.row.adjustOrderId;
        move_drawer_model.value.stockNum = newVal.row.stockNumBatch;
        move_drawer_model.value.rackStockSum = 0;
        move_drawer_model.value.centerId = newVal.row.centerId;
        move_drawer_model.value.batchId = newVal.row.batchId;
    },
    { immediate: true, deep: true }
);

onMounted(async () => {});
</script>
<template>
    <t-drawer
        id="move_drawer_model"
        v-model:visible="move_drawer_model.visible"
        size="40%"
        placement="right"
        :closeBtn="true"
        :cancelBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
    >
        <template #header> 入库执行 </template>
        <template #footer>
            <t-button theme="primary" shape="round" type="button" @click="doSubmitRackAll">
                提交所有
            </t-button>
        </template>
        <t-card header-bordered :style="{ margin: '5px' }" id="data_table">
            <template #header>
                <div>
                    <t-button
                        theme="primary"
                        shape="round"
                        variant="outline"
                        @click="onShowRackNewAdd()"
                    >
                        <template #icon><AddIcon /></template>
                        新增入库
                    </t-button>
                </div>
                <div style="float: right; font-weight: bold">
                    <span>应入库数量：{{ move_drawer_model.stockNum }}</span>
                </div>
            </template>
            <template #footer>当前总数：{{ move_drawer_model.rackStockSum }}</template>
            <t-table
                row-key="index"
                :data="move_drawer_model.rack_data_list"
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
            <t_form_item_house_rack_list
                label="关联库位"
                help="*必填"
                v-model="rack_new_input_model.rackId"
                :centerId="move_drawer_model.centerId"
                :status="globalConstDef.enableModel.Enabled.toString()"
            />
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
