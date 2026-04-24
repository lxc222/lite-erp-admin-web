<script setup>
import { ref, onMounted, watch } from "vue";
// defineProps({
//   title: {
//     type: String,
//     required: false,
//   },
//   msg: {
//     type: String,
//     required: true,
//   },
// });

const model = defineModel();
const emit = defineEmits(["close"]);

const dlg_tips_visiable = ref(false);

watch(model, async (newV, oldV) => {
  if (newV.show) {
    dlg_tips_visiable.value = true;
  } else {
    dlg_tips_visiable.value = false;
  }
});

function _close_click_() {
  dlg_tips_visiable.value = false;
  emit("close");
}

onMounted(() => {
  dlg_tips_visiable.value = false;
});
</script>

<template>
  <t-dialog
    placement="center"
    destroyOnClose
    :closeOnEscKeydown="false"
    :closeOnOverlayClick="false"
    v-model:visible="dlg_tips_visiable"
    :cancel-btn="null"
    :on-close="_close_click_"
    theme="info"
    :header="model.title"
    @confirm="_close_click_"
  >
    <p>{{ model.msg }}</p>
  </t-dialog>
</template>

<style scoped></style>
