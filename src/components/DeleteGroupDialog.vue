<script setup lang="ts">
import { ref } from 'vue';
import { deleteGroup } from '../requests/requests';
import type { GroupDetails } from '../types';

const props = defineProps<{
  group?: GroupDetails;
}>();
const emit = defineEmits(['deleted', 'closed']);

const dialogRef = ref<HTMLDialogElement>();

function openDialog() {
  dialogRef.value?.showModal();
}

function closeDialog() {
  dialogRef.value?.close();
  emit('closed');
}

async function handleDelete() {
  if (!props.group) return;
  await deleteGroup(props.group.id);
  closeDialog();
  emit('deleted');
}

defineExpose({ openDialog, closeDialog });
</script>

<template>
  <dialog ref="dialogRef">
    <form @submit.prevent="handleDelete">
      <h2>Delete Group</h2>
      <p>Are you sure you want to delete the group <strong>{{ props.group?.name }}</strong>?</p>
      <div style="margin-top: 16px;">
        <button type="submit">Delete</button>
        <button type="button" @click="closeDialog">Cancel</button>
      </div>
    </form>
  </dialog>
</template>

