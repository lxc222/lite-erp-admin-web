<script setup>
import { onMounted } from "vue";
import { MessagePlugin } from "tdesign-vue-next";
import { axiosGetJson, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";

const thisModel = defineModel();

function trig_heartbeat() {
    axiosGetJson("/api/open/biz/md/pub/heartbeat", function (response) {
        if (!isAjaxRspSucc(response)) {
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

onMounted(() => {
    setInterval(trig_heartbeat, 10000);
});
</script>

<template>
    <t-footer style="padding: 0px">
        <t-card :bordered="false">
            Copyright @ {{ new Date().getFullYear() }} All Rights Reserved
        </t-card>
    </t-footer>
</template>

<style scoped></style>
