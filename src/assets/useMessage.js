import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next';

/**
 * 消息提示工具函数
 */

/**
 * 显示成功消息
 * @param {string} content - 消息内容
 * @param {object} options - 配置选项
 */
export function showSuccess(content, options = {}) {
    const { duration = 2000, placement = 'center' } = options;
    MessagePlugin.success({
        content,
        duration,
        placement,
        ...options
    });
}

/**
 * 显示错误消息
 * @param {string} content - 消息内容
 * @param {object} options - 配置选项
 */
export function showError(content, options = {}) {
    const { duration = 3000, placement = 'center', closeBtn = true } = options;
    MessagePlugin.error({
        content,
        duration,
        placement,
        closeBtn,
        ...options
    });
}

/**
 * 显示警告消息
 * @param {string} content - 消息内容
 * @param {object} options - 配置选项
 */
export function showWarning(content, options = {}) {
    const { duration = 2500, placement = 'center' } = options;
    MessagePlugin.warning({
        content,
        duration,
        placement,
        ...options
    });
}

/**
 * 显示信息消息
 * @param {string} content - 消息内容
 * @param {object} options - 配置选项
 */
export function showInfo(content, options = {}) {
    const { duration = 2000, placement = 'center' } = options;
    MessagePlugin.info({
        content,
        duration,
        placement,
        ...options
    });
}

/**
 * 处理 API 响应并显示相应消息
 * @param {object} response - API 响应对象
 * @param {object} options - 配置选项
 * @returns {boolean} - 是否成功
 */
export function handleApiResponse(response, options = {}) {
    const {
        successMsg = '操作成功',
        errorMsg = '操作失败',
        showSuccessMsg = true,
        onSuccess = null,
        onError = null
    } = options;

    if (response?.data?.succ) {
        if (showSuccessMsg) {
            showSuccess(successMsg);
        }
        onSuccess?.(response);
        return true;
    } else {
        const msg = response?.data?.tipMsg || errorMsg;
        showError(msg);
        onError?.(response);
        return false;
    }
}

/**
 * 显示确认对话框
 * @param {string} title - 标题
 * @param {string} content - 内容
 * @param {Function} onConfirm - 确认回调
 * @param {object} options - 配置选项
 */
export function showConfirm(title, content, onConfirm, options = {}) {
    const {
        confirmText = '确定',
        cancelText = '取消',
        onCancel = null,
        closeOnOverlayClick = false
    } = options;

    const dialog = DialogPlugin.confirm({
        header: title,
        body: content,
        confirmBtn: confirmText,
        cancelBtn: cancelText,
        closeOnOverlayClick,
        onConfirm: () => {
            dialog.hide();
            onConfirm?.();
        },
        onCancel: () => {
            dialog.hide();
            onCancel?.();
        }
    });

    return dialog;
}

/**
 * 显示删除确认对话框
 * @param {Function} onConfirm - 确认回调
 * @param {string} itemName - 要删除的项名称
 */
export function showDeleteConfirm(onConfirm, itemName = '') {
    const content = itemName ? `确定要删除 "${itemName}" 吗？` : '确定要删除吗？';
    return showConfirm('确认删除', content, onConfirm, {
        confirmText: '删除',
        cancelText: '取消'
    });
}

/**
 * 显示警告确认对话框
 * @param {string} content - 警告内容
 * @param {Function} onConfirm - 确认回调
 */
export function showWarningConfirm(content, onConfirm) {
    return showConfirm('确认操作', content, onConfirm, {
        confirmText: '确定',
        cancelText: '取消'
    });
}
