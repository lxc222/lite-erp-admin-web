<script setup lang="jsx">
import { onMounted, ref } from "vue";

const thisModel = defineModel();

import { MessagePlugin, LoadingPlugin } from "tdesign-vue-next";
import { AddIcon } from "tdesign-icons-vue-next";
import {
    ajaxPageDataParse,
    axiosPostJson,
    axiosPostJsonBody,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";

import { message_plugin_config } from "@/assets/asset_biz_base_20251024.js";
import table_with_pagination from "@/components/table_with_pagination.vue";

const table_line_expanded_row_keys = ref([""]);

const onTableLineExpandChange = (value, params) => {
    table_line_expanded_row_keys.value = value;
};

const onTableLineExpandedViewTpl = (h, { row }) => (
    <div>
        <div class="more-detail">
            <p class="content">
                <b>【ID】</b>
                {row.id}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>【创建操作】</b>
                {row.createAction}
            </p>
        </div>
    </div>
);

const table_columns = [
    { colKey: "title", title: "会员名称" },
    {
        colKey: "phone",
        title: "手机号"
    },
    {
        colKey: "pointNum",
        title: "积分(点)",
        align: "right",
        cell: (h, { row }) => {
            return <span>{row.pointNum}点</span>;
        }
    },
    {
        colKey: "money",
        title: "储值￥",
        align: "right",
        cell: (h, { row }) => {
            return <span>￥{row.money}</span>;
        }
    },
    {
        colKey: "wareDiscount",
        title: "货品折扣",
        align: "right",
        cell: (h, { row }) => {
            return <span>{row.wareDiscount}折</span>;
        }
    },
    {
        colKey: "processItemDiscount",
        title: "服务折扣",
        align: "right",
        cell: (h, { row }) => {
            return <span>{row.processItemDiscount}折</span>;
        }
    },
    { colKey: "remark", title: "备注" },
    { colKey: "updateAction", title: "最后修改" },
    { colKey: "refOperation", title: "关联操作", width: 120 }
];

const customer_add_model = ref({
    visible: false,
    submitData: {
        id: null,
        title: null,
        phone: null,
        email: null,
        wareDiscount: null,
        processItemDiscount: null,
        remark: null
    },
    rules: {
        phone: [
            { required: true, message: "手机号*必填", type: "error", trigger: "blur" },
            {
                required: true,
                message: "手机号*必填",
                type: "error",
                trigger: "change"
            }
        ]
    }
});

async function showCustomerAdd() {
    customer_add_model.value.submitData = {};
    customer_add_model.value.visible = true;
}

async function showCustomerEdit(editId) {
    customer_add_model.value.visible = true;
    axiosPostJson(
        "/api/biz/o2o/member/one",
        {
            item_id: editId
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                customer_add_model.value.submitData = response.data.data;
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );
}

const point_consume_model = ref({
    visible: false,
    submitData: {
        memberId: null,
        pointNum: null,
        remark: null
    },
    rules: {}
});
async function showPointConsume(editId) {
    point_consume_model.value.submitData = { memberId: editId };
    point_consume_model.value.visible = true;
}

const submitPointConsume = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        point_consume_model.value.visible = false;
        let distUrl = "/api/biz/o2o/memberPoint/consume";
        axiosPostJsonBody(distUrl, point_consume_model.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                MessagePlugin.info({
                    content: response.data.data,
                    duration: 3000,
                    closeBtn: true,
                    placement: "center",
                    onClose: function () {}
                });
            }
        });
    } else {
        // console.log("Validate Errors: ", firstError, validateResult);
        MessagePlugin.error(firstError);
    }
};

const point_deposit_model = ref({
    visible: false,
    submitData: {
        memberId: null,
        pointNum: null,
        remark: null
    },
    rules: {}
});
async function showPointDeposit(editId) {
    point_deposit_model.value.submitData = { memberId: editId };
    point_deposit_model.value.visible = true;
}

const submitPointDeposit = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        point_deposit_model.value.visible = false;
        let distUrl = "/api/biz/o2o/memberPoint/deposit";
        axiosPostJsonBody(distUrl, point_deposit_model.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                MessagePlugin.info({
                    content: response.data.data,
                    duration: 3000,
                    closeBtn: true,
                    placement: "center",
                    onClose: function () {}
                });
            }
        });
    } else {
        // console.log("Validate Errors: ", firstError, validateResult);
        MessagePlugin.error(firstError);
    }
};

const wallet_consume_model = ref({
    visible: false,
    submitData: {
        memberId: null,
        consumeNum: null,
        remark: null
    },
    rules: {}
});
async function showWalletConsume(editId) {
    wallet_consume_model.value.submitData = { memberId: editId };
    wallet_consume_model.value.visible = true;
}

const submitWalletConsume = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        wallet_consume_model.value.visible = false;
        let distUrl = "/api/biz/o2o/wallet/consume";
        axiosPostJsonBody(distUrl, wallet_consume_model.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                MessagePlugin.info({
                    content: response.data.data,
                    duration: 3000,
                    closeBtn: true,
                    placement: "center",
                    onClose: function () {}
                });
            }
        });
    } else {
        // console.log("Validate Errors: ", firstError, validateResult);
        MessagePlugin.error(firstError);
    }
};

const wallet_deposit_model = ref({
    visible: false,
    submitData: {
        memberId: null,
        buyNum: null,
        giveNum: null,
        remark: null
    },
    rules: {}
});

async function showWalletDeposit(editId) {
    wallet_deposit_model.value.submitData = { memberId: editId };
    wallet_deposit_model.value.visible = true;
}

const submitWalletDeposit = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/o2o/wallet/deposit";
        axiosPostJsonBody(distUrl, wallet_deposit_model.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                wallet_deposit_model.value.visible = false;
                MessagePlugin.info({
                    content: response.data.data,
                    duration: 3000,
                    closeBtn: true,
                    placement: "center",
                    onClose: function () {}
                });
            }
        });
    } else {
        // console.log("Validate Errors: ", firstError, validateResult);
        MessagePlugin.error(firstError);
    }
};

const memberClickHandler = data => {
    if ("修改会员" === data.content) {
        showCustomerEdit(data.value);
    } else if ("积分扣减" === data.content) {
        showPointConsume(data.value);
    } else if ("积分充值" === data.content) {
        showPointDeposit(data.value);
    } else if ("储值扣减" === data.content) {
        showWalletConsume(data.value);
    } else if ("储值充值" === data.content) {
        showWalletDeposit(data.value);
    } else {
    }
};

const onSubmitCustomer = ({ validateResult, firstError, e }) => {
    e.preventDefault();
    if (validateResult === true) {
        let distUrl = "/api/biz/o2o/member/add";
        if (customer_add_model.value.submitData.id > 0) {
            distUrl = "/api/biz/o2o/member/change";
        }

        axiosPostJsonBody(distUrl, customer_add_model.value.submitData, function (response) {
            if (!isAjaxRspSucc(response)) {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            } else {
                customer_add_model.value.visible = false;
                MessagePlugin.info({
                    content: response.data.data,
                    duration: 3000,
                    closeBtn: true,
                    placement: "center",
                    onClose: function () {}
                });
            }
        });
    } else {
        // console.log("Validate Errors: ", firstError, validateResult);
        MessagePlugin.error(firstError);
    }
};

const form_query_data = ref({
    phone: null,
    page: {
        pageNo: 1,
        pageSize: 10,
        totalNum: 0,
        totalPage: 0
    },
    pageData: []
});

function onQueryFormData(resetPage) {
    if (resetPage) {
        form_query_data.value.page.pageNo = 1;
    }

    LoadingPlugin(true);
    axiosPostJsonBody(
        "/api/biz/o2o/member/page",
        {
            pageNo: form_query_data.value.page.pageNo,
            pageSize: form_query_data.value.page.pageSize,
            phone: form_query_data.value.phone,
            status: form_query_data.value.status
        },
        function (response) {
            LoadingPlugin(false);
            if (isAjaxRspSucc(response)) {
                ajaxPageDataParse(response.data.data, form_query_data);

                MessagePlugin.success({
                    ...message_plugin_config,
                    content: "数据加载完成"
                });
            } else {
                MessagePlugin.error({
                    ...message_plugin_config,
                    content: response.data.tipMsg
                });
            }
        }
    );

    return false;
}

onMounted(async () => {
    onQueryFormData(true);
});
</script>
<template>
    <t-card id="query_form" :bordered="true" :style="{ margin: '5px' }">
        <div style="padding-top: 10px; padding-bottom: 10px">
            <t-form
                label-align="right"
                :data="form_query_data"
                layout="inline"
                scroll-to-first-error="smooth"
                @submit="onQueryFormData(true)"
            >
                <t-form-item label="会员电话" name="会员电话">
                    <t-input v-model="form_query_data.phone"></t-input>
                </t-form-item>
                <t-button theme="primary" type="submit">开始查询</t-button>
            </t-form>
        </div></t-card
    >

    <table_with_pagination
        :data="form_query_data.pageData"
        :columns="table_columns"
        :pagination="form_query_data.page"
        rowKey="id"
        :expandedRow="onTableLineExpandedViewTpl"
        :expandedRowKeys="table_line_expanded_row_keys"
        @expandChange="onTableLineExpandChange"
        @pageChange="onQueryFormData(false)"
        @pageSizeChange="onQueryFormData(false)"
    >
        <template #headerActions>
            <div>
                <t-button theme="primary" variant="outline" @click="showCustomerAdd()">
                    <template #icon><AddIcon /></template>
                    会员
                </t-button>
            </div>
        </template>
        <template #refOperation="{ row }">
            <t-dropdown
                :options="[
                    { content: '修改会员', value: row.id, divider: true },
                    { content: '积分充值', value: row.id },
                    { content: '积分扣减', value: row.id, divider: true },
                    { content: '储值充值', value: row.id },
                    { content: '储值扣减', value: row.id }
                ]"
                @click="memberClickHandler"
            >
                <t-button theme="success" shape="round">
                    更多&nbsp;
                    <span><i class="icon-chevron-down"></i></span>
                </t-button>
            </t-dropdown>
        </template>
    </table_with_pagination>
    <t-dialog
        id="customer_add_model"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
        v-model:visible="customer_add_model.visible"
        header="会员信息"
    >
        <t-form
            :rules="customer_add_model.rules"
            :data="customer_add_model.submitData"
            requiredMarkPosition="right"
            @submit="onSubmitCustomer"
        >
            <t-form-item label="会员名称" name="会员名称" help="*必填">
                <t-input placeholder="会员名称" v-model="customer_add_model.submitData.title" />
            </t-form-item>
            <t-form-item label="联系电话" name="联系电话" help="*必填">
                <t-input
                    placeholder="请确保电话真实性"
                    v-model="customer_add_model.submitData.phone"
                />
            </t-form-item>
            <t-form-item label="联系邮箱" name="联系邮箱" help="选填">
                <t-input placeholder="联系邮箱" v-model="customer_add_model.submitData.email" />
            </t-form-item>
            <t-form-item label="货品折扣" name="货品折扣" help="选填，95折请输入95">
                <t-input
                    placeholder="不填则不打折"
                    type="number"
                    suffix="折"
                    v-model="customer_add_model.submitData.wareDiscount"
                />
            </t-form-item>
            <t-form-item label="服务折扣" name="服务折扣" help="选填，95折请输入95">
                <t-input
                    placeholder="不填则不打折"
                    type="number"
                    suffix="折"
                    v-model="customer_add_model.submitData.processItemDiscount"
                />
            </t-form-item>
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="customer_add_model.submitData.remark" />
            </t-form-item>
            <t-form-item>
                <t-space size="small">
                    <t-button theme="default" variant="base" type="reset">重置</t-button>
                    <t-button theme="primary" type="submit">提交</t-button>
                </t-space>
            </t-form-item>
        </t-form>
    </t-dialog>
    <t-dialog
        id="point_consume_model"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
        v-model:visible="point_consume_model.visible"
        header="积分扣减"
    >
        <t-form
            :rules="point_consume_model.rules"
            :data="point_consume_model.submitData"
            requiredMarkPosition="right"
            @submit="submitPointConsume"
        >
            <t-form-item label="扣减数量" name="扣减数量" help="*必填, (输入整数，不支持小数)">
                <t-input
                    placeholder="扣减数量"
                    type="number"
                    suffix="积分"
                    v-model="point_consume_model.submitData.pointNum"
                />
            </t-form-item>
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="point_consume_model.submitData.remark" />
            </t-form-item>
            <t-form-item>
                <t-space size="small">
                    <t-button theme="default" variant="base" type="reset">重置</t-button>
                    <t-button theme="primary" type="submit">提交</t-button>
                </t-space>
            </t-form-item>
        </t-form>
    </t-dialog>
    <t-dialog
        id="point_deposit_model"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
        v-model:visible="point_deposit_model.visible"
        header="积分充值"
    >
        <t-form
            :rules="point_deposit_model.rules"
            :data="point_deposit_model.submitData"
            requiredMarkPosition="right"
            @submit="submitPointDeposit"
        >
            <t-form-item label="充值数量" name="充值数量" help="*必填, (输入整数，不支持小数)">
                <t-input
                    placeholder="充值数量"
                    type="number"
                    suffif="积分"
                    v-model="point_deposit_model.submitData.pointNum"
                />
            </t-form-item>
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="point_deposit_model.submitData.remark" />
            </t-form-item>
            <t-form-item>
                <t-space size="small">
                    <t-button theme="default" variant="base" type="reset">重置</t-button>
                    <t-button theme="primary" type="submit">提交</t-button>
                </t-space>
            </t-form-item>
        </t-form>
    </t-dialog>
    <t-dialog
        id="wallet_deposit_model"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
        v-model:visible="wallet_deposit_model.visible"
        header="储值充值"
    >
        <t-form
            :rules="wallet_deposit_model.rules"
            :data="wallet_deposit_model.submitData"
            requiredMarkPosition="right"
            @submit="submitWalletDeposit"
        >
            <t-form-item label="充值金额" name="充值金额" help="*必填, (最高支持两位小数)">
                <t-input
                    placeholder="充值金额"
                    type="number"
                    label="￥"
                    suffix="元"
                    v-model="wallet_deposit_model.submitData.buyNum"
                />
            </t-form-item>
            <t-form-item label="赠送金额" name="赠送金额" help="选填, (最高支持两位小数)">
                <t-input
                    placeholder="赠送金额"
                    type="number"
                    label="￥"
                    suffix="元"
                    v-model="wallet_deposit_model.submitData.giveNum"
                />
            </t-form-item>
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="wallet_deposit_model.submitData.remark" />
            </t-form-item>
            <t-form-item>
                <t-space size="small">
                    <t-button theme="default" variant="base" type="reset">重置</t-button>
                    <t-button theme="primary" type="submit">提交</t-button>
                </t-space>
            </t-form-item>
        </t-form>
    </t-dialog>
    <t-dialog
        id="wallet_consume_model"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
        v-model:visible="wallet_consume_model.visible"
        header="储值扣减"
    >
        <t-form
            :rules="wallet_consume_model.rules"
            :data="wallet_consume_model.submitData"
            requiredMarkPosition="right"
            @submit="submitWalletConsume"
        >
            <t-form-item label="扣减金额" name="扣减金额" help="*必填, (最高支持两位小数)">
                <t-input
                    placeholder="扣减金额"
                    type="number"
                    label="￥"
                    suffix="元"
                    v-model="wallet_consume_model.submitData.consumeNum"
                />
            </t-form-item>
            <t-form-item label="备注信息" name="备注信息">
                <t-input placeholder="备注信息" v-model="wallet_consume_model.submitData.remark" />
            </t-form-item>
            <t-form-item>
                <t-space size="small">
                    <t-button theme="default" variant="base" type="reset">重置</t-button>
                    <t-button theme="primary" type="submit">提交</t-button>
                </t-space>
            </t-form-item>
        </t-form>
    </t-dialog>
</template>

<style scoped></style>
