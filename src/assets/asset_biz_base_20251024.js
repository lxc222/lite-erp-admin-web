import { ref } from "vue";
import Cookies from "js-cookie";
import { isAjaxRspSucc, axiosGetJson } from "@/assets/asset_utils_ajax_20251024.js";

export const message_plugin_config = {
    duration: 3000,
    closeBtn: true,
    placement: "center",
    onClose: () => {}
};

export function jumpToIndexWebPage() {
    Cookies.set("last_clickd_menu_url", "/html/index.html", { expires: 365, path: "/" });
    window.location.href = "/html/index.html?t=" + new Date().getTime();
}
export function loadLoginSession(setData) {
    axiosGetJson("/api/open/biz/md/account/loginSession", function (response) {
        if (isAjaxRspSucc(response)) {
            setData(response.data.data);
        }
    });
}

export function loadAuthCode(setData) {
    axiosGetJson("/api/open/biz/md/pub/getAuth", function (response) {
        if (isAjaxRspSucc(response)) {
            setData(response.data.data);
        }
    });
}

export function loadBaseBizData(setData) {
    axiosGetJson("/api/open/biz/erp/commonData", function (response) {
        if (!isAjaxRspSucc(response)) {
            setData({});
        } else {
            setData(response.data.data);
        }
    });
}

export const globalLoginData = ref({
    _login_session_: {}
});

export function loadLoginDataAll(dataRef) {
    loadLoginSession(function (data) {
        dataRef.value._login_session_ = data;
    });

    loadAuthCode(function (data) {
        dataRef.value.authCodes = data;
    });

    loadBaseBizData(function (data) {
        dataRef.value.commonData = data;
    });
}
