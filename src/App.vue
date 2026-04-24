<script setup>
import { onMounted } from "vue";
import Cookies from "js-cookie";

import page_tpl_title from "@/components/page_tpl_title.vue";
import page_tpl_menu from "@/components/page_tpl_menu.vue";
import page_tpl_footer from "@/components/page_tpl_footer.vue";
import { globalLoginData, loadLoginDataAll } from "@/assets/asset_biz_base_20251024.js";

onMounted(async () => {
    loadLoginDataAll(globalLoginData);

    let url = Cookies.get("last_clicked_menu_url");
    console.log("url:", url);
    if (url && url != "/html/index.html") {
        window.location.href = url + "?t=" + new Date().getTime();
    }
});
</script>

<template>
    <t-layout>
        <page_tpl_title v-model="globalLoginData" />
        <t-layout>
            <page_tpl_menu v-model="globalLoginData" />
            <t-layout>
                <t-content> </t-content>
                <page_tpl_footer v-model="globalLoginData" />
            </t-layout>
        </t-layout>
    </t-layout>
</template>

<style scoped></style>
