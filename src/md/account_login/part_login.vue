<script setup>
import { onMounted, ref } from "vue";

import { MessagePlugin } from "tdesign-vue-next";
import { ThumbUpIcon, ChatIcon, ShareIcon } from "tdesign-icons-vue-next";

import { axiosPostJson, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";
import { jumpToIndexWebPage } from "@/assets/asset_biz_base_20251024.js";

const captcha_original_url = "/web/open/biz/pub/captcha";

const captcha_url = ref(captcha_original_url);
function onCaptchaClick() {
    captcha_url.value = captcha_original_url + "?t=" + new Date().getTime();
}

const login_data = ref({
    login_account: "",
    login_passwd: "",
    code: ""
});

function jumpToRegistWebPage() {
    window.location.href = "/html/pc/md/tenant_regist.html?t=" + new Date().getTime();
}

async function onAccountLogin() {
    axiosPostJson(
        "/api/open/biz/md/account/login",
        {
            account: login_data.value.login_account,
            passwd: login_data.value.login_passwd,
            code: login_data.value.code
        },
        function (response) {
            console.info(response);
            if (!isAjaxRspSucc(response)) {
                onCaptchaClick();
                MessagePlugin.error({
                    content: response.data.tipMsg,
                    duration: 5000,
                    closeBtn: true,
                    placement: "center",
                    onClose: function () {}
                });
            } else {
                jumpToIndexWebPage();
            }
        }
    );
}

const onReset = () => {
    login_data.value.login_account = "";
    login_data.value.login_passwd = "";
    login_data.value.code = "";
};

const onSubmit = ({ validateResult, firstError }) => {
    if (validateResult === true) {
        onAccountLogin();
    } else {
        // console.log("Validate Errors: ", firstError, validateResult);
        MessagePlugin.warning({
            content: firstError,
            duration: 3000,
            closeBtn: true,
            placement: "center",
            onClose: function () {}
        });
    }
};

onMounted(() => {
    setInterval(onCaptchaClick, 60000);
});
</script>

<template>
    <div class="centered-container">
        <t-card title="账户登入" header-bordered :style="{ width: '500px' }">
            <t-form ref="form" :data="login_data" @reset="onReset" @submit="onSubmit">
                <t-form-item label="登入账户" name="商户名称" help="*必填">
                    <t-input
                        v-model="login_data.login_account"
                        clearable
                        placeholder="连续失败5次会锁定账户"
                    >
                    </t-input>
                </t-form-item>
                <t-form-item label="登入密码" name="登入密码" help="*必填">
                    <t-input
                        v-model="login_data.login_passwd"
                        type="password"
                        clearable
                        placeholder="账户对应的密码"
                    >
                    </t-input>
                </t-form-item>
                <t-form-item label="验证码" name="验证码" help="*必填">
                    <t-input v-model="login_data.code" clearable placeholder="请输入下面验证码">
                    </t-input>
                </t-form-item>
                <t-form-item label="">
                    <t-image
                        id="captcha"
                        :src="captcha_url"
                        @click="onCaptchaClick"
                        style="margin-left: 10px; width: 135px; height: 40px; cursor: pointer"
                    />
                </t-form-item>
                <t-form-item>
                    <t-space>
                        <t-button theme="primary" type="submit" block>登 入</t-button>
                        <t-button theme="default" variant="base" type="reset">重 置</t-button>
                    </t-space>
                </t-form-item>
            </t-form>
            <template #footer>
                <t-space>
                    <span>
                        <t-button variant="text" shape="square"> <ShareIcon /> </t-button>
                        <t-link theme="danger" hover="underline" @click="jumpToRegistWebPage">
                            没有账号，现在注册
                        </t-link>
                    </span>
                </t-space>
            </template>
        </t-card>
    </div>
</template>

<style scoped>
.centered-container {
    display: flex;
    justify-content: center; /* 水平居中 */
    align-items: center; /* 垂直居中 */
    height: 100vh; /* 视窗高度 */
    width: 100vw; /* 视窗宽度 */
    margin-top: -100px;
}
</style>
