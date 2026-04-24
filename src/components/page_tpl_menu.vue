<script setup>
import { ref, onMounted, computed } from "vue";
import Cookies from "js-cookie";

const thisModel = defineModel();

import { LoadingPlugin } from "tdesign-vue-next";
import { axiosGetJson, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";
import { jumpToIndexWebPage } from "@/assets/asset_biz_base_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

const menuData = ref({
    defaultMenuValue: "item1",
    expanded: [],
    menuCollapsed: false,
    menu_list: {},
    menuTitle: computed(() => (menuData.value.menuCollapsed ? "" : "森博软件")),
    iconName: computed(() =>
        menuData.value.menuCollapsed ? "chevron-right-double" : "chevron-left-double"
    )
});

const onMenuChangeCollapsed = () => {
    menuData.value.menuCollapsed = !menuData.value.menuCollapsed;
};

const onMenuChangeHandler = active => {
    Cookies.set("last_clicked_menu_url", active, { expires: 365, path: "/" });
    if (active.indexOf("/html") == 0) {
        LoadingPlugin(true);
        window.location.href = active + "?t=" + new Date().getTime();
    } else {
        LoadingPlugin(true);
        jumpToIndexWebPage();
    }
};

const onMenuExpandHandler = expanded => {
    const last_clicked_menu_group = expanded.join(",");

    if (last_clicked_menu_group) {
        Cookies.set("last_clicked_menu_group", last_clicked_menu_group, {
            expires: 365,
            path: "/"
        });
    }
};

async function onLoadMenuList() {
    axiosGetJson("/api/open/biz/md/pub/getAccountMenu", function (response) {
        // console.info(response);
        if (!isAjaxRspSucc(response)) {
            menuData.value.menu_list = [];
        } else {
            menuData.value.menu_list = response.data.data;
        }
    });
}

onMounted(async () => {
    onLoadMenuList();

    const lastMenuUrl = Cookies.get("last_clicked_menu_url");
    menuData.value.defaultMenuValue = lastMenuUrl || "";

    const lastMenuGroup = Cookies.get("last_clicked_menu_group");
    menuData.value.expanded = lastMenuGroup ? lastMenuGroup.split(",") : [];

    console.log("lastMenuUrl:", lastMenuUrl);
    console.log("lastMenuGroup:", lastMenuGroup);
});
</script>

<template>
    <t-aside style="border-top: 1px solid var(--component-border)">
        <t-menu
            :collapsed="menuData.menuCollapsed"
            @change="onMenuChangeHandler"
            @expand="onMenuExpandHandler"
            :expandMutex="false"
            :value="menuData.defaultMenuValue"
            v-model:expanded="menuData.expanded"
        >
            <template #logo>
                <t-space>
                    <span
                        style="text-align: center; font-weight: bold"
                        @click="onMenuChangeCollapsed"
                    >
                        <i class="icon-circle-blank"></i>
                        <i class="icon-circle-blank"></i>
                        {{ menuData.menuTitle }}
                    </span>
                </t-space>
            </template>
            <t-menu-item value="/html/index.html">
                <template #icon> <i class="icon-home"></i>&nbsp;&nbsp; </template>
                系统首页
            </t-menu-item>
            <t-submenu :value="item.value" mode="popup" v-for="item in menuData.menu_list">
                <template #icon>
                    <i :class="item.icon ? item.icon : 'icon-circle-blank'"></i>&nbsp;&nbsp;
                </template>
                <template #title>
                    <span> {{ item.label }}</span>
                </template>
                <template v-if="item.children" v-for="tm in item.children">
                    <template v-if="tm.children">
                        <t-submenu :value="tm.value" mode="popup" :expandMutex="false">
                            <template #icon>
                                <i :class="tm.icon ? tm.icon : 'icon-circle-blank'"></i>&nbsp;&nbsp;
                            </template>
                            <template #title>
                                <span> {{ tm.label }}</span>
                            </template>
                            <t-menu-item
                                :value="tm2.url"
                                v-if="tm.children"
                                v-for="tm2 in tm.children"
                            >
                                <template #icon>
                                    <i :class="tm2.icon ? tm2.icon : 'icon-circle-blank'"></i
                                    >&nbsp;&nbsp;
                                </template>
                                {{ tm2.label }}
                            </t-menu-item>
                        </t-submenu>
                    </template>
                    <template v-else>
                        <t-menu-item :value="tm.url">
                            <template #icon>
                                <i :class="tm.icon ? tm.icon : 'icon-circle-blank'"></i>&nbsp;&nbsp;
                            </template>
                            {{ tm.label }}
                        </t-menu-item>
                    </template>
                </template>
            </t-submenu>
            <template #operations>
                <t-button variant="text" shape="square" @click="onMenuChangeCollapsed">
                    <template #icon><t-icon :name="menuData.iconName" size="20px" /></template>
                </t-button>
            </template>
        </t-menu>
    </t-aside>
</template>

<style scoped></style>
