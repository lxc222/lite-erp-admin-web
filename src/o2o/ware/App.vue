<script setup>
import { onMounted, ref } from "vue";

import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

import page_tpl_frame from "@/components/page_tpl_frame.vue";
import page_content from "@/o2o/ware/page_content.vue";

onMounted(async () => {});
</script>
<template>
    <page_tpl_frame>
        <page_content v-model="globalLoginData" />
    </page_tpl_frame>
</template>

<style scoped></style>
