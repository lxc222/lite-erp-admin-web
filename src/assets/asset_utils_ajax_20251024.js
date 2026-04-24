import axios from "axios";

axios.defaults.headers["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
axios.defaults.withCredentials = true;

export function jumpToLoginWebPage() {
    window.location.href = "/html/pc/md/account_login.html?t=" + new Date().getTime();
}

export function isAjaxRspSucc(response) {
    return response && response.data && response.data.succ;
}
export function ajaxPageDataParse(ajaxData, rstDataVueRef) {
    rstDataVueRef.value.pageData = ajaxData.pageData;
    rstDataVueRef.value.page = {
        pageNo: ajaxData.pageNo,
        pageSize: ajaxData.pageSize,
        totalNum: ajaxData.totalNum,
        totalPage: ajaxData.totalPage
    };
}
export function axiosGetJson(url, fnInvoke) {
    axios
        .get(url, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
        .then(response => {
            ajaxRspParse(response, fnInvoke);
        })
        .catch(error => {
            ajaxRspCatch(error, fnInvoke);
        });
}

export function axiosPostJson(url, paramObj, fnInvoke) {
    axios
        .post(url, paramObj, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
        .then(response => {
            // console.log("请求成功:", response);
            ajaxRspParse(response, fnInvoke);
        })
        .catch(error => {
            ajaxRspCatch(error, fnInvoke);
        });
}

export function axiosPostJsonCallback(url, paramObj, invokeSucc, invokeFail) {
    axiosPostJson(url, paramObj, function (response) {
        if (isAjaxRspSucc(response)) {
            invokeSucc(response);
        } else {
            invokeFail(response);
        }
    });
}

export function axiosPostJsonBody(url, paramObj, fnInvoke) {
    axios
        .post(url, paramObj, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            ajaxRspParse(response, fnInvoke);
        })
        .catch(error => {
            ajaxRspCatch(error, fnInvoke);
        });
}

export function axiosPostJsonBodyCallback(url, paramObj, invokeSucc, invokeFail) {
    axiosPostJsonBody(url, paramObj, function (response) {
        if (isAjaxRspSucc(response)) {
            invokeSucc(response);
        } else {
            invokeFail(response);
        }
    });
}

function ajaxRspParse(response, fnInvoke) {
    if (!response || !response.data) {
        const response2 = { data: { succ: false, tipMsg: "系统异常" } };
        fnInvoke(response2);
    } else if (!response.data.succ) {
        if ("02000000" == response.data.code) {
            jumpToLoginWebPage();
        } else {
            fnInvoke(response);
        }
    } else {
        fnInvoke(response);
    }
}

function ajaxRspCatch(error, fnInvoke) {
    console.error("请求失败:", error);
    const response = {
        data: { succ: false, tipMsg: "请求失败: " + (error.message || "网络错误") }
    };
    fnInvoke(response);
}
