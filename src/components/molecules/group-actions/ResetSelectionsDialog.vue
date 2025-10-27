<script setup lang="ts">
import { ref } from 'vue';
import type { GroupDetails } from '@/types.ts';
import { resetSelectionsOfGroup } from '@/requests/requests.ts';

const props = defineProps<{
  group?: GroupDetails;
}>();
const emit = defineEmits(['reset', 'closed']);

const dialogRef = ref<HTMLDialogElement>();

function openDialog() {
  dialogRef.value?.showModal();
}

function closeDialog() {
  dialogRef.value?.close();
  emit('closed');
}

async function handleReset() {
  if (!props.group) return;
  await resetSelectionsOfGroup(props.group.id);
  closeDialog();
  emit('reset');
}

defineExpose({ openDialog, closeDialog });
</script>

<template>
  <dialog ref="dialogRef">
    <div>
      <h3>Reset Selections</h3>
      <p>
        Are you sure you want to reset all selections for group
        <strong>{{ props.group?.name }}</strong>?
      </p>
      <div style="margin-top: 16px;">
        <button @click="handleReset">Yes, Reset</button>
        <button @click="closeDialog">Cancel</button>
      </div>
    </div>
  </dialog>
</template>

