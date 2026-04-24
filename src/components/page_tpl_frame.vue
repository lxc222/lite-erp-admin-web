<script setup>
import { onMounted, ref } from "vue";

import { globalLoginData, loadLoginDataAll } from "@/assets/asset_biz_base_20251024.js";

import page_tpl_title from "@/components/page_tpl_title.vue";
import page_tpl_menu from "@/components/page_tpl_menu.vue";
import page_tpl_footer from "@/components/page_tpl_footer.vue";

onMounted(async () => {
    loadLoginDataAll(globalLoginData);
});
</script>
<template>
    <t-layout>
        <page_tpl_title v-model="globalLoginData" />
        <t-layout>
            <page_tpl_menu v-model="globalLoginData" />
            <t-layout>
                <t-content>
                    <t-watermark
                        :removable="false"
                        :movable="false"
                        layout="hexagonal"
                        :watermarkContent="[{ text: '森博软件 SenBor', fontSize: 20 }]"
                        :y="200"
                        :x="300"
                        :width="200"
                        :height="150"
                    >
                        <slot></slot>
                    </t-watermark>
                </t-content>
                <page_tpl_footer v-model="globalLoginData" />
            </t-layout>
        </t-layout>
    </t-layout>
</template>

<style scoped></style>
