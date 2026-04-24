import { MessagePlugin } from "tdesign-vue-next";

import { axiosPostJsonBody, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";
import { message_plugin_config } from "@/assets/asset_biz_base_20251024.js";

export function loadScmSaleRelationList(queryData, invokeSucc, invokeFail) {
    if (!queryData) {
        invokeFail({ succ: false, tipMsg: "请求失败: 参数不能为空" });
        return;
    }

    axiosPostJsonBody("/api/biz/scm/saleRelation/list", queryData, function (response) {
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
