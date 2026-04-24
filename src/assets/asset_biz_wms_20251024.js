import { MessagePlugin } from "tdesign-vue-next";

import {
    axiosPostJson,
    axiosPostJsonBody,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";
import { message_plugin_config } from "@/assets/asset_biz_base_20251024.js";

export function loadWmsHouseCenterList(statusAttr, invokeSucc, invokeFail) {
    axiosPostJsonBody(
        "/api/biz/wms/houseCenter/list",
        {
            status: statusAttr
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

export function loadWmsHouseRegionList(queryData, invokeSucc, invokeFail) {
    if (!queryData) {
        invokeFail({ succ: false, tipMsg: "请求失败: 参数不能为空" });
        return;
    }

    axiosPostJsonBody("/api/biz/wms/houseRegion/list", queryData, function (response) {
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

export function getOneWmsHouseCenter(centerId, invokeSucc, invokeFail) {
    if (!centerId || centerId < 1) {
        invokeFail({ succ: false, tipMsg: "请求失败: 参数不能为空" });
        return;
    }

    axiosPostJson(
        "/api/biz/wms/houseCenter/oneById",
        {
            itemId: centerId
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

export function getOneWmsHouseRegion(regionId, invokeSucc, invokeFail) {
    if (!regionId || regionId < 1) {
        invokeFail({ succ: false, tipMsg: "请求失败: 参数不能为空" });
        return;
    }

    axiosPostJson(
        "/api/biz/wms/houseRegion/oneById",
        {
            itemId: regionId
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

export function loadWmsHouseRackList(queryData, invokeSucc, invokeFail) {
    if (!queryData) {
        invokeFail({ succ: false, tipMsg: "请求失败: 参数不能为空" });
        return;
    }

    axiosPostJsonBody("/api/biz/wms/houseRack/list", queryData, function (response) {
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

export function getOneWmsHouseRack(rackId, invokeSucc, invokeFail) {
    if (!rackId || rackId < 1) {
        invokeFail({ succ: false, tipMsg: "请求失败: 参数不能为空" });
        return;
    }

    axiosPostJson(
        "/api/biz/wms/houseRack/oneById",
        {
            itemId: rackId
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

export function loadWmsBatchGroupList(queryData, invokeSucc, invokeFail) {
    if (!queryData) {
        invokeFail({ succ: false, tipMsg: "请求失败: 参数不能为空" });
        return;
    }

    axiosPostJsonBody("/api/biz/wms/stockBatchGroup/list", queryData, function (response) {
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

export function getOneWmsStockGroup(groupId, invokeSucc, invokeFail) {
    if (!groupId || groupId < 1) {
        invokeFail({ succ: false, tipMsg: "请求失败: 参数不能为空" });
        return;
    }

    axiosPostJson(
        "/api/biz/wms/stockBatchGroup/oneById",
        {
            itemId: groupId
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

export function getOneWmsStockBatch(batchNo, invokeSucc, invokeFail) {
    if (!batchNo || typeof batchNo !== "string" || batchNo.trim().length === 0) {
        invokeFail({ succ: false, tipMsg: "请求失败: 参数不能为空" });
        return;
    }

    axiosPostJson(
        "/api/biz/wms/stockCenter/oneByBatchId",
        {
            batchId: batchNo
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
