<script setup>
import { ref, onMounted, useAttrs } from "vue";

import { MessagePlugin } from "tdesign-vue-next";

import { parseIntFromStr } from "@/assets/asset_utils_base_20251024.js";
import { axiosPostJsonBody, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";

const model = defineModel();
const emit = defineEmits(["click", "active"]);

const attrs = useAttrs();

const showIcon = ref(true);
const showLine = ref(true);
const data_list = ref([]);
async function onLoadData() {
    data_list.value = [];

    let statusAttr = !attrs.status ? null : attrs.status;
    axiosPostJsonBody(
        "/api/biz/md/materialCatalog/listForCascader",
        {
            status: statusAttr
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                data_list.value = response.data.data;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

function onSelectClick(e) {
    // console.log(e);
    // console.log(e.node.actived);
    // const nodeValue = e.node.value;
    // setTimeout(() => {
    //     emit("click", nodeValue);
    // }, 0);
}

function onSelectChange(e) {
    console.log("change: " + e);
}

function onSelectActive(e) {
    // console.log("active:" + e + "|");
    let realNum = parseIntFromStr(e, -1);
    setTimeout(() => {
        emit("active", realNum);
    }, 0);
}

onMounted(() => {
    onLoadData();
});
</script>

<template>
    <t-tree
        activable
        hover
        :data="data_list"
        :line="showLine"
        :icon="showIcon"
        :expandLevel="0"
        :expandAll="false"
        @click="onSelectClick"
        @change="onSelectChange"
        @active="onSelectActive"
    ></t-tree>
</template>

<style scoped></style>
