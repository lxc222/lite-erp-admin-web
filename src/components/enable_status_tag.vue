<script setup>
import enable_status_tag from "@/components/enable_status_tag.vue";

import { globalConstDef } from "@/assets/common_data_20251024.js";
import { globalLoginData } from "@/assets/asset_biz_base_20251024.js";

defineProps({
    status: {
        type: [Number, String],
        default: undefined
    }
});
</script>

<template>
    <t-tag
        theme="primary"
        shape="round"
        variant="outline"
        v-if="status === globalConstDef.enableModel.Enabled"
    >
        <template #icon>
            <t-icon name="check" />
        </template>
        启用中
    </t-tag>
    <t-tag theme="success" shape="round" variant="outline" v-else>
        <template #icon>
            <t-icon name="close" />
        </template>
        未启用
    </t-tag>
</template>
