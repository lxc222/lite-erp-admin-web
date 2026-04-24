<script setup lang="jsx">
import { ref, watch, onMounted } from "vue";

const thisModel = defineModel();

import { MessagePlugin } from "tdesign-vue-next";

import {
    axiosPostJson,
    axiosPostJsonBody,
    isAjaxRspSucc
} from "@/assets/asset_utils_ajax_20251024.js";
import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

import form_enum_radio_group from "@/components/form_enum_radio_group.vue";

const auth_role_list = ref([]);
const auth_role_check_list = ref([]);
function onLoadAuthRoleList() {
    auth_role_list.value = [];
    axiosPostJsonBody(
        "/api/biz/md/authRole/list",
        {
            status: globalConstDef.enableModel.Enabled
        },
        function (response) {
            if (isAjaxRspSucc(response)) {
                auth_role_list.value = response.data.data;
                auth_role_list.value.forEach(item => {
                    auth_role_check_list.value.push({
                        label: item.title + " (" + item.statusTitle + ")",
                        value: item.id,
                        key: item.id
                    });
                });
            }
        }
    );
}

const submit_model = ref({
    visible: false,
    editModel: false,
    submitData: {
        id: null,
        accountType: null,
        title: null,
        phone: null,
        email: null,
        employeeNo: null,
        manageFlag: null,
        openAccountPasswdLogin: null,
        openAccountCodeLogin: null,
        openEmailCodeLogin: null,
        remark: null,
        roleIds: [],
        status: null
    }
});

function onSubmitData() {
    submit_model.value.submitData.accountType = globalConstDef.accountType.Employee;

    let dstUrl = "/api/biz/md/account/add";
    if (submit_model.value.submitData.id && submit_model.value.submitData.id > 0) {
        dstUrl = "/api/biz/md/account/change";
    }

    axiosPostJsonBody(dstUrl, submit_model.value.submitData, function (response) {
        if (!isAjaxRspSucc(response)) {
            MessagePlugin.error({
                content: response.data.tipMsg,
                duration: 3000,
                closeBtn: true,
                placement: "center",
                onClose: function () {}
            });
        } else {
            submit_model.value.visible = false;
            MessagePlugin.info({
                content: response.data.data,
                duration: 3000,
                closeBtn: true,
                placement: "center",
                onClose: function () {}
            });
        }
    });
}

function onChangeAuthRole() {
    // console.log(JSON.stringify(account_submit_model.value.submitData.roleIds));
}

watch(thisModel, (newVal, oldVal) => {
    const visible = newVal.visible;
    const itemId = newVal.itemId;
    if (visible) {
        submit_model.value.visible = true;
        if (itemId) {
            axiosPostJson(
                "/api/biz/md/account/oneById",
                {
                    accountId: itemId
                },
                function (response) {
                    if (isAjaxRspSucc(response)) {
                        submit_model.value.submitData = response.data.data;
                        submit_model.value.editModel = true;
                    } else {
                        MessagePlugin.error({
                            content: response.data.tipMsg,
                            duration: 3000,
                            closeBtn: true,
                            placement: "center",
                            onClose: function () {}
                        });
                    }
                }
            );
        }
    } else {
        submit_model.value.visible = false;
    }
});

onMounted(async () => {
    onLoadAuthRoleList();
});
</script>
<template>
    <t-drawer
        id="submit_model"
        v-model:visible="submit_model.visible"
        @confirm="onSubmitData"
        size="30%"
        placement="right"
        :closeBtn="true"
        :cancelBtn="null"
        confirmBtn="提交"
        :destroyOnClose="true"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
    >
        <template #header>人员账号</template>
        <t-form>
            <t-form-item
                label="账号名称"
                name="账号名称"
                help="*必填"
                v-show="submit_model.editModel"
            >
                <t-input
                    placeholder="账号名称"
                    v-model="submit_model.submitData.title"
                    :disabled="true"
                />
            </t-form-item>
            <t-form-item
                label="电话号码"
                name="电话号码"
                help="选填"
                v-show="submit_model.editModel"
            >
                <t-input
                    placeholder="电话号码"
                    v-model="submit_model.submitData.phone"
                    :disabled="true"
                />
            </t-form-item>
            <t-form-item
                label="联系邮箱"
                name="联系邮箱"
                help="*必填"
                v-show="submit_model.editModel"
            >
                <t-input
                    placeholder="联系邮箱"
                    v-model="submit_model.submitData.email"
                    :disabled="true"
                />
            </t-form-item>
            <t-form-item label="人员工号" name="人员工号" help="*必填">
                <t-input
                    placeholder="人员工号"
                    v-model="submit_model.submitData.employeeNo"
                    :disabled="submit_model.editModel"
                />
            </t-form-item>
            <form_enum_radio_group
                label="管理账号"
                help="*必填, 管理账号直接拥有所有权限"
                v-model="submit_model.submitData.manageFlag"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.yesOrNo"
            />
            <t-form-item
                label="授权角色"
                name="授权角色"
                help="*必填"
                v-show="submit_model.submitData.manageFlag != globalConstDef.enableModel.Enabled"
            >
                <t-checkbox-group
                    v-model:value="submit_model.submitData.roleIds"
                    @change="onChangeAuthRole"
                >
                    <t-space direction="vertical">
                        <t-checkbox
                            :key="item.key"
                            :label="item.label"
                            :value="item.value"
                            v-for="item in auth_role_check_list"
                        />
                    </t-space>
                </t-checkbox-group>
            </t-form-item>
            <form_enum_radio_group
                label="账户密码登入"
                help="*必填"
                v-model="submit_model.submitData.openAccountPasswdLogin"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.yesOrNo"
            />
            <form_enum_radio_group
                label="账户验证码登入"
                help="*必填"
                v-model="submit_model.submitData.openAccountCodeLogin"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.yesOrNo"
            />
            <form_enum_radio_group
                label="邮件验证码登入"
                help="*必填"
                v-model="submit_model.submitData.openEmailCodeLogin"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.yesOrNo"
            />
            <form_enum_radio_group
                label="是否启用"
                help="*必填"
                v-model="submit_model.submitData.status"
                v-if="globalLoginData.commonData"
                :options="globalLoginData.commonData.enableModel"
            />
            <t-form-item label="备注信息" name="备注信息" help="选填">
                <t-input placeholder="备注信息" v-model="submit_model.submitData.remark" />
            </t-form-item>
        </t-form>
    </t-drawer>
</template>

<style scoped></style>
