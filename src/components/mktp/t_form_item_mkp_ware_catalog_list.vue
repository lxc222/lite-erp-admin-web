<script setup>
import { ref, onMounted, useAttrs } from "vue";

import { MessagePlugin } from "tdesign-vue-next";

import { axiosPostJsonBody, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";
import { message_plugin_config } from "@/assets/asset_biz_base_20251024.js";

defineProps({
    label: {
        type: String,
        required: true
    }
});

const model = defineModel();
const emit = defineEmits(["change"]);

const attrs = useAttrs();

const data_list = ref([]);
async function onLoadData() {
    data_list.value = [];

    let statusAttr = !attrs.status ? null : attrs.status;
    let distUrl = "/api/biz/mktp/wareCategory/list";
    axiosPostJsonBody(
        distUrl,
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

function onSelectChange() {
    emit("change");
}

onMounted(() => {
    onLoadData();
});
</script>

<template>
    <t-form-item :label="label" :name="label" :help="attrs.help">
        <t-select
            v-model="model"
            @change="onSelectChange"
            :clearable="true"
            :filterable="true"
            :disabled="attrs.disabled ? true : false"
        >
            <t-option key="无上级类目(一级)" label="--- 无上级类目(一级) ---" :value="-1" />
            <t-option
                v-for="item in data_list"
                :key="item.id"
                :label="item.titleAbs + '【' + item.statusTitle + '】'"
                :value="item.id"
            />
        </t-select>
    </t-form-item>
</template>

<style scoped></style>
