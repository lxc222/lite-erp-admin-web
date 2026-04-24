<script setup lang="jsx">
import { onMounted, ref } from "vue";

import { MessagePlugin } from "tdesign-vue-next";
import { ShareIcon } from "tdesign-icons-vue-next";

import {
    axiosPostJson,
    jumpToLoginWebPage,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";

const captcha_url = ref("/web/open/biz/pub/captcha");

async function onTenantRegist() {
    var that = this;
    axiosPostJson(
        "/api/open/biz/md/tenant/registTenant",
        {
            title: regist_data.value.regist_tenant_name,
            email: regist_data.value.regist_tenant_email,
            code: regist_data.value.regist_tenant_code
        },
        function (response) {
            console.info(response);
            if (!isAjaxRspSucc(response)) {
                onCaptchaClick();
                MessagePlugin.success({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                MessagePlugin.success({
                    content: response.data.tipMsg,
                    duration: 3000,
                    closeBtn: true,
                    placement: "center",
                    onClose: function () {
                        jumpToLoginWebPage();
                    }
                });
            }
        }
    );
}

function onCaptchaClick() {
    captcha_url.value = "/web/open/biz/pub/captcha?t=" + new Date().getTime();
}

const regist_data = ref({
    regist_tenant_name: "",
    regist_tenant_email: "",
    regist_tenant_code: ""
});

const onReset = () => {
    regist_data.value.regist_tenant_name = "";
    regist_data.value.regist_tenant_email = "";
    regist_data.value.regist_tenant_code = "";
};

const onSubmit = ({ validateResult, firstError }) => {
    if (validateResult === true) {
        onTenantRegist();
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
        <t-card title="商户注册" header-bordered :style="{ width: '500px' }">
            <t-form ref="form" :data="regist_data" @reset="onReset" @submit="onSubmit">
                <t-form-item label="商户名称" name="商户名称" help="*必填">
                    <t-input v-model="regist_data.regist_tenant_name" clearable placeholder="">
                    </t-input>
                </t-form-item>
                <t-form-item
                    label="联系邮箱"
                    name="联系邮箱"
                    help="*必填，建议使用QQ邮箱，方便加入QQ群获取支持"
                >
                    <t-input
                        v-model="regist_data.regist_tenant_email"
                        clearable
                        placeholder="用于激活，请输入正确"
                    >
                    </t-input>
                </t-form-item>
                <t-form-item label="验证码" name="验证码" help="*必填">
                    <t-input
                        v-model="regist_data.regist_tenant_code"
                        clearable
                        placeholder="请输入下面验证码"
                    >
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
                        <t-button theme="primary" type="submit" block>注 册</t-button>
                        <t-button theme="default" variant="base" type="reset">重 置</t-button>
                    </t-space>
                </t-form-item>
            </t-form>
            <template #footer>
                <t-space>
                    <span>
                        <t-button variant="text" shape="square"> <ShareIcon /> </t-button>
                        <t-link theme="danger" hover="underline" @click="jumpToLoginWebPage">
                            已有账号，直接登入
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
