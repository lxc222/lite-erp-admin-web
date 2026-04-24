import { ref } from "vue";
import { LoadingPlugin } from "tdesign-vue-next";
import { axiosPostJsonBody } from "@/assets/asset_utils_ajax_20251024.js";
import { handleApiResponse } from "./useMessage.js";

/**
 * 表单提交 Hook - 统一处理表单提交逻辑
 * @param {string} apiPath - API 路径
 * @param {object} options - 配置选项
 * @returns {object} - 返回提交方法和状态
 */
export function useFormSubmit(apiPath, options = {}) {
    const {
        successMsg = "保存成功",
        errorMsg = "保存失败",
        onSuccess = null,
        onError = null,
        transformData = null,
        validate = null
    } = options;

    const submitting = ref(false);

    async function submit(formData) {
        // 自定义验证
        if (validate) {
            const valid = validate(formData);
            if (!valid) return false;
        }

        submitting.value = true;
        LoadingPlugin(true);

        const data = transformData ? transformData(formData) : formData;

        return new Promise(resolve => {
            axiosPostJsonBody(apiPath, data, response => {
                submitting.value = false;
                LoadingPlugin(false);

                const success = handleApiResponse(response, {
                    successMsg,
                    errorMsg,
                    onSuccess: () => {
                        onSuccess?.(response);
                        resolve(true);
                    },
                    onError: () => {
                        onError?.(response);
                        resolve(false);
                    }
                });

                if (!success) {
                    resolve(false);
                }
            });
        });
    }

    return {
        submitting,
        submit
    };
}

/**
 * 带确认的表单提交 Hook
 * @param {string} apiPath - API 路径
 * @param {string} confirmTitle - 确认标题
 * @param {string} confirmContent - 确认内容
 * @param {object} options - 配置选项
 */
export function useConfirmSubmit(apiPath, confirmTitle, confirmContent, options = {}) {
    const {
        successMsg = "操作成功",
        errorMsg = "操作失败",
        onSuccess = null,
        onError = null,
        transformData = null
    } = options;

    const submitting = ref(false);

    async function submit(formData) {
        const confirmed = await new Promise(resolve => {
            const dialog = DialogPlugin.confirm({
                header: confirmTitle,
                body: confirmContent,
                confirmBtn: "确定",
                cancelBtn: "取消",
                onConfirm: () => {
                    dialog.hide();
                    resolve(true);
                },
                onCancel: () => {
                    dialog.hide();
                    resolve(false);
                }
            });
        });

        if (!confirmed) return false;

        submitting.value = true;
        LoadingPlugin(true);

        const data = transformData ? transformData(formData) : formData;

        return new Promise(resolve => {
            axiosPostJsonBody(apiPath, data, response => {
                submitting.value = false;
                LoadingPlugin(false);

                const success = handleApiResponse(response, {
                    successMsg,
                    errorMsg,
                    onSuccess: () => {
                        onSuccess?.(response);
                        resolve(true);
                    },
                    onError: () => {
                        onError?.(response);
                        resolve(false);
                    }
                });

                if (!success) {
                    resolve(false);
                }
            });
        });
    }

    return {
        submitting,
        submit
    };
}

import { DialogPlugin } from "tdesign-vue-next";

/**
 * 批量操作 Hook
 * @param {string} apiPath - API 路径
 * @param {object} options - 配置选项
 */
export function useBatchOperation(apiPath, options = {}) {
    const {
        idField = "id",
        successMsg = "操作成功",
        errorMsg = "操作失败",
        onSuccess = null,
        confirmTitle = "确认操作",
        confirmContent = "确定要执行此操作吗？",
        requireConfirm = true
    } = options;

    const operating = ref(false);

    async function operate(ids, extraParams = {}) {
        if (!ids || (Array.isArray(ids) && ids.length === 0)) {
            return false;
        }

        const idList = Array.isArray(ids) ? ids : [ids];

        // 确认对话框
        if (requireConfirm) {
            const confirmed = await new Promise(resolve => {
                const dialog = DialogPlugin.confirm({
                    header: confirmTitle,
                    body: confirmContent,
                    confirmBtn: "确定",
                    cancelBtn: "取消",
                    onConfirm: () => {
                        dialog.hide();
                        resolve(true);
                    },
                    onCancel: () => {
                        dialog.hide();
                        resolve(false);
                    }
                });
            });

            if (!confirmed) return false;
        }

        operating.value = true;
        LoadingPlugin(true);

        const params = {
            [idField.endsWith("s") ? idField : idField + "s"]: idList,
            ...extraParams
        };

        return new Promise(resolve => {
            axiosPostJsonBody(apiPath, params, response => {
                operating.value = false;
                LoadingPlugin(false);

                const success = handleApiResponse(response, {
                    successMsg,
                    errorMsg,
                    onSuccess: () => {
                        onSuccess?.(response);
                        resolve(true);
                    }
                });

                if (!success) {
                    resolve(false);
                }
            });
        });
    }

    return {
        operating,
        operate
    };
}
