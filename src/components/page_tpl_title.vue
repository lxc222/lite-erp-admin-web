<script setup>
import { onMounted, ref } from "vue";
import Cookies from "js-cookie";

const thisModel = defineModel();

import { MessagePlugin } from "tdesign-vue-next";
import {
    axiosGetJson,
    axiosPostJson,
    jumpToLoginWebPage,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";
import { jumpToIndexWebPage } from "@/assets/asset_biz_base_20251024.js";

function logoutAccount() {
    axiosGetJson("/api/biz/md/account/logout", function (response) {
        if (isAjaxRspSucc(response)) {
            jumpToLoginWebPage();
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

const passwdChangeData = ref({
    visible: false,
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
});

function showPasswdChangeDlg() {
    passwdChangeData.value = {};
    passwdChangeData.value.visible = true;
}

function changePasswd() {
    passwdChangeData.value.visible = false;
    axiosPostJson(
        "/api/biz/md/account/editMyPassword",
        passwdChangeData.value,
        function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                MessagePlugin.info({
                    content: "操作成功, 3S后请重新登入",
                    duration: 3000,
                    closeBtn: false,
                    placement: "center",
                    onClose: function () {
                        logoutAccount();
                        jumpToLoginWebPage();
                    }
                });
            }
        }
    );
}

function refreshPage() {
    const url = Cookies.get("last_clicked_menu_url");
    if (url) {
        window.location.href = url + "?t=" + new Date().getTime();
    }
}

const accountMenuClickHandler = data => {
    if (data.value == 2) {
        showPasswdChangeDlg();
    } else if (data.value == 3) {
        logoutAccount();
    }
};

onMounted(() => {});
</script>

<template>
    <t-header>
        <t-head-menu value="item1" expand-type="popup">
            <template #logo>
                <img width="136" class="logo" src="/images/menu_logo_hover.png" alt="logo" />
            </template>
            <t-menu-item value="item_home" @click="jumpToIndexWebPage">
                <i class="icon-home"></i> 首页
            </t-menu-item>
            <t-menu-item value="item_refreshPage" @click="refreshPage">
                <i class="icon-refresh"></i> 刷新
            </t-menu-item>
            <t-submenu value="item_solution">
                <template #title>
                    <span>解决方案</span>
                </template>
                <t-menu-item value="item3">使用帮助&反馈</t-menu-item>
            </t-submenu>
            <template #operations>
                <t-card :bordered="false" size="small">
                    <i class="icon-anchor"></i>
                    {{ thisModel._login_session_.tenantName }} ( 平台编码：{{
                        thisModel._login_session_.tenantCode
                    }}
                    )
                </t-card>
                <t-card :bordered="false" size="small">
                    <i class="icon-time"></i>
                    本次登入：{{ thisModel._login_session_.loginTimeStr }}
                </t-card>
                <t-dropdown
                    :min-column-width="202"
                    :hideAfterItemClick="true"
                    placement="bottom-right"
                    trigger="hover"
                    @click="accountMenuClickHandler"
                >
                    <t-button variant="text">
                        <span>
                            <i class="icon-arrow-right"></i>
                            {{ thisModel._login_session_.loginName }} (
                            {{ thisModel._login_session_.loginAccount }})
                        </span>
                        <template #suffix>
                            <t-icon name="chevron-down" size="16" />
                        </template>
                    </t-button>
                    <t-dropdown-menu>
                        <t-dropdown-item :value="2" :divider="true">
                            <i class="icon-lock"></i>&nbsp;&nbsp;&nbsp;&nbsp;修改密码
                        </t-dropdown-item>
                        <t-dropdown-item :value="3">
                            <i class="icon-arrow-right"></i>&nbsp;&nbsp;&nbsp;&nbsp;登出账号
                        </t-dropdown-item>
                    </t-dropdown-menu>
                </t-dropdown>
            </template>
        </t-head-menu>
    </t-header>

    <t-dialog
        id="passwdChangeData"
        :closeBtn="false"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
        v-model:visible="passwdChangeData.visible"
        header="修改密码"
        :on-confirm="changePasswd"
        :on-cancel="() => (passwdChangeData.visible = false)"
        :on-close-btn-click="() => (passwdChangeData.visible = false)"
    >
        <t-form>
            <t-form-item label="当前密码" name="当前密码">
                <t-input
                    type="password"
                    placeholder="当前密码"
                    v-model="passwdChangeData.oldPassword"
                />
            </t-form-item>
            <t-form-item label="新密码" name="新密码">
                <t-input
                    type="password"
                    placeholder="新密码"
                    v-model="passwdChangeData.newPassword"
                />
            </t-form-item>
            <t-form-item label="确认新密码" name="确认新密码">
                <t-input
                    type="password"
                    placeholder="确认新密码"
                    v-model="passwdChangeData.confirmPassword"
                />
            </t-form-item>
        </t-form>
    </t-dialog>
</template>

<style scoped></style>
