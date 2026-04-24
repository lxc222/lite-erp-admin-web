<script setup>
import { ref, onMounted, useAttrs, watch } from "vue";

import { MessagePlugin } from "tdesign-vue-next";

import { axiosPostJsonBody, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";

defineProps({
    label: {
        type: String,
        required: true
    }
});

const model = defineModel();
// const emit = defineEmits(["change"]);

const attrs = useAttrs();

const data_list = ref([]);
async function onLoadData() {
    let statusAttr = !attrs.status ? null : attrs.status;
    let supplierTypeAttr = !attrs.supplierType ? null : attrs.supplierType;
    axiosPostJsonBody(
        "/api/biz/scm/supplier/list",
        {
            status: statusAttr,
            supplierType: supplierTypeAttr
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                data_list.value = response.data.data;
            } else {
                data_list.value = [];
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

function onSelectChange() {
    setTimeout(() => {
        // let supplierType = null;
        // if (model.value) {
        //     supplierType = data_map.value[model.value].type;
        // }
        // emit("change", supplierType);
    }, 0);
}

const styleStr = ref("");

onMounted(() => {
    if (attrs.widthPx) {
        styleStr.value =
            "min-width: " + attrs.widthPx + "px !important; width: " + attrs.widthPx + "px";
    } else {
        styleStr.value = "";
    }

    onLoadData();
});
</script>

<template>
    <t-form-item :label="label" :name="label" :help="attrs.help" :style="styleStr">
        <t-checkbox-group
            v-model="model"
            @change="onSelectChange"
            :disabled="attrs.disabled ? true : false"
        >
            <t-space direction="vertical" v-if="attrs.direction == 'vertical'">
                <t-checkbox
                    v-for="item in data_list"
                    :key="item.id"
                    :label="
                        item.title +
                        ' / ' +
                        item.phone +
                        ' / ' +
                        item.typeStr +
                        '【' +
                        item.statusTitle +
                        '】'
                    "
                    :value="item.id"
                />
            </t-space>
            <t-checkbox
                v-else
                v-for="item in data_list"
                :key="item.id"
                :label="
                    item.title +
                    ' / ' +
                    item.phone +
                    ' / ' +
                    item.typeStr +
                    '【' +
                    item.statusTitle +
                    '】'
                "
                :value="item.id"
            />
        </t-checkbox-group>
    </t-form-item>
</template>

<style scoped></style>
