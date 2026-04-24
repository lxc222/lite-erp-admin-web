<script setup lang="jsx">
import { ref, onMounted, useAttrs, watch } from "vue";
import JsBarcode from "jsbarcode";

defineProps({
    header: {
        type: String,
        required: false,
        default: "条形码"
    }
});

const thisModel = defineModel();
const emit = defineEmits(["close"]);
const attrs = useAttrs();

const barcodeSvg = ref(null);
const dlgVisible = ref(false);
const barCode = ref("");

watch(
    [() => attrs.visible, () => attrs.barcode],
    ([newVisible, newBarcode], [oldVisible, oldBarCode]) => {
        // console.log("barcode_watch, newVisible", newVisible);
        // console.log("barcode_watch, newCode", newBarcode);
        barCode.value = newBarcode;
        dlgVisible.value = newVisible;

        _renderBarcode();
    },
    { deep: true }
);

function onCloseBtnClick() {
    emit("close");
}

async function _renderBarcode() {
    // console.log("_renderBarcode:", attrs.barcode);
    if (barcodeSvg.value && attrs.barcode) {
        try {
            JsBarcode(barcodeSvg.value, attrs.barcode, {
                format: "CODE128",
                lineColor: "#000",
                width: 2,
                height: 100,
                displayValue: true,
                fontSize: 20,
                textMargin: 10
            });
        } catch (error) {
            console.error("生成条形码失败:", error);
        }
    }
}

onMounted(() => {});
</script>

<template>
    <t-dialog
        :visible="dlgVisible"
        :header="header"
        width="50%"
        :closeBtn="true"
        :cancelBtn="null"
        :confirmBtn="null"
        :destroyOnClose="false"
        :closeOnEscKeydown="false"
        :closeOnOverlayClick="false"
        :confirmOnEnter="true"
        @closeBtnClick="onCloseBtnClick"
    >
        <div style="width: 100%; text-align: center">
            <svg ref="barcodeSvg"></svg>
        </div>
    </t-dialog>
</template>

<style scoped></style>
