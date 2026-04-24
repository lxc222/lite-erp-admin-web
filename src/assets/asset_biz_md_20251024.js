import { MessagePlugin } from "tdesign-vue-next";

import {
    axiosPostJson,
    axiosPostJsonBody,
    axiosPostJsonCallback,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";
import { message_plugin_config } from "@/assets/asset_biz_base_20251024.js";

export function loadMdMaterialCatalogList(queryData, invokeSucc, invokeFail) {
    if (!queryData) {
        invokeFail({ succ: false, tipMsg: "请求失败: 参数不能为空" });
        return;
    }

    axiosPostJsonBody("/api/biz/md/materialCatalog/list", queryData, function (response) {
        if (isAjaxRspSucc(response)) {
            invokeSucc(response.data);
        } else {
            MessagePlugin.error({
                ...message_plugin_config,
                content: response.data.tipMsg
            });

            invokeFail(response.data);
        }
    });
}

export function oneMaterialById(itemId, invokeSucc, invokeFail) {
    if (!itemId || itemId <= 0) {
        invokeFail({ succ: false, tipMsg: "请求失败: 参数不能为空" });
        return;
    }

    axiosPostJson(
        "/api/biz/md/material/oneById",
        {
            materialId: itemId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                invokeSucc(response.data);
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });

                invokeFail(response.data);
            }
        }
    );
}

export function oneSpecMaterialById(itemId, invokeSucc, invokeFail) {
    if (!itemId || itemId <= 0) {
        invokeFail({ succ: false, tipMsg: "请求失败: 参数不能为空" });
        return;
    }

    axiosPostJsonCallback(
        "/api/biz/md/specMaterial/oneById",
        {
            itemId: itemId
        },
        function (response) {
            invokeSucc(response.data);
        },
        function (response) {
            MessagePlugin.error({
                ...message_plugin_config,
                content: response.data.tipMsg
            });

            invokeFail(response.data);
        }
    );
}
