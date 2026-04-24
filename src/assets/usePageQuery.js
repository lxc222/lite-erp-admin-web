import { ref } from "vue";
import { LoadingPlugin } from "tdesign-vue-next";
import { axiosPostJsonBody, isAjaxRspSucc } from "@/assets/asset_utils_ajax_20251024.js";

/**
 * 分页查询 Hook
 * @param {string} apiPath - API 路径
 * @param {object} options - 配置选项
 * @returns {object} - 返回查询数据和查询方法
 */
export function usePageQuery(apiPath, options = {}) {
    const {
        pageNo = 1,
        pageNum = 10,
        immediate = false,
        onSuccess = null,
        onError = null
    } = options;

    const form_query_data = ref({
        page: {
            pageNo: pageNo,
            pageSize: pageNum,
            totalNum: 0,
            totalPage: 0
        },
        pageData: []
    });

    const loading = ref(false);

    function query(resetPage = true) {
        if (resetPage) {
            form_query_data.value.page.pageNo = 1;
        }

        loading.value = true;
        LoadingPlugin(true);

        axiosPostJsonBody(
            apiPath,
            {
                pageNo: form_query_data.value.page.pageNo,
                pageSize: form_query_data.value.page.pageSize
            },
            response => {
                loading.value = false;
                LoadingPlugin(false);

                if (response?.data?.succ) {
                    form_query_data.value.pageData = response.data.data?.list || [];
                    form_query_data.value.page.totalNum = response.data.data?.total || 0;
                    form_query_data.value.page.totalPage = Math.ceil(
                        form_query_data.value.page.totalNum / form_query_data.value.page.pageSize
                    );
                    onSuccess?.(response);
                } else {
                    onError?.(response);
                }
            }
        );

        return false;
    }

    function resetPagination() {
        form_query_data.value.page.pageNo = 1;
    }

    function goToPage(pageNo) {
        form_query_data.value.page.pageNo = pageNo;
        query(false);
    }

    return {
        form_query_data,
        loading,
        query,
        resetPagination,
        goToPage
    };
}
