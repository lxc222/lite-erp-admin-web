import { ref } from "vue";
import { axiosPostJsonBody } from "@/assets/asset_utils_ajax_20251024.js";

/**
 * 下拉选择数据 Hook - 用于统一处理下拉框数据加载
 * @param {string} apiPath - API 路径
 * @param {object} options - 配置选项
 * @returns {object} - 返回数据列表和加载方法
 */
export function useSelectData(apiPath, options = {}) {
    const {
        immediate = true,
        params = {},
        labelField = "name",
        valueField = "id",
        transform = null
    } = options;

    const data_list = ref([]);
    const loading = ref(false);

    async function loadData(extraParams = {}) {
        loading.value = true;
        const finalParams = { ...params, ...extraParams };

        return new Promise(resolve => {
            axiosPostJsonBody(apiPath, finalParams, response => {
                loading.value = false;
                if (response?.data?.succ) {
                    let list = response.data.data || [];

                    // 数据转换
                    if (transform) {
                        list = transform(list);
                    } else {
                        // 默认转换：添加 label 和 value 字段
                        list = list.map(item => ({
                            ...item,
                            label: item[labelField],
                            value: item[valueField]
                        }));
                    }

                    data_list.value = list;
                    resolve(list);
                } else {
                    data_list.value = [];
                    resolve([]);
                }
            });
        });
    }

    if (immediate) {
        loadData();
    }

    return {
        data_list,
        loading,
        loadData
    };
}

/**
 * 带缓存的下拉选择数据 Hook
 * @param {string} apiPath - API 路径
 * @param {string} cacheKey - 缓存键名
 * @param {object} options - 配置选项
 */
const cacheMap = new Map();

export function useCachedSelectData(apiPath, cacheKey, options = {}) {
    const {
        labelField = "name",
        valueField = "id",
        transform = null,
        cacheTime = 5 * 60 * 1000 // 默认缓存5分钟
    } = options;

    const data_list = ref([]);
    const loading = ref(false);

    async function loadData(forceRefresh = false) {
        // 检查缓存
        if (!forceRefresh && cacheMap.has(cacheKey)) {
            const cached = cacheMap.get(cacheKey);
            if (Date.now() - cached.time < cacheTime) {
                data_list.value = cached.data;
                return cached.data;
            }
        }

        loading.value = true;
        return new Promise(resolve => {
            axiosPostJsonBody(apiPath, {}, response => {
                loading.value = false;
                if (response?.data?.succ) {
                    let list = response.data.data || [];

                    if (transform) {
                        list = transform(list);
                    } else {
                        list = list.map(item => ({
                            ...item,
                            label: item[labelField],
                            value: item[valueField]
                        }));
                    }

                    data_list.value = list;

                    // 存入缓存
                    cacheMap.set(cacheKey, {
                        data: list,
                        time: Date.now()
                    });

                    resolve(list);
                } else {
                    data_list.value = [];
                    resolve([]);
                }
            });
        });
    }

    // 清除缓存
    function clearCache() {
        cacheMap.delete(cacheKey);
    }

    return {
        data_list,
        loading,
        loadData,
        clearCache
    };
}

/**
 * 清空所有缓存
 */
export function clearAllSelectCache() {
    cacheMap.clear();
}
