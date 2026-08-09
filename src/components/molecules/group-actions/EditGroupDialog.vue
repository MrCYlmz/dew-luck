<script setup lang="ts">
import { ref } from 'vue';
import type { GroupDetails } from '@/types.ts';
import { updateGroup } from '@/requests/requests.ts';
import { useGroupForm } from '@/composables/useGroupForm.ts';
import GroupForm from '../GroupForm.vue';

const props = defineProps<{
  group?: GroupDetails;
}>();
const emit = defineEmits(['updated', 'closed']);

const dialogRef = ref<HTMLDialogElement>();

const { form, addPerson, removePerson, loadFromGroup } = useGroupForm();

function openDialog() {
  if (props.group) {
    loadFromGroup(props.group);
    dialogRef.value?.showModal();
  }
}

function closeDialog() {
  dialogRef.value?.close();
  emit('closed');
}

async function handleSubmit() {
  if (!props.group) return;
  await updateGroup(props.group.id, {
    id: props.group.id,
    name: form.name,
    respectEarlySelection: form.respectEarlySelection,
    selectionStyle: form.selectionStyle,
    people: form.people.map(p => ({
      id: p.id,
      name: p.name,
      weight: form.isWeightedSelection ? p.weight : 1,
      isSelected: p.isSelected,
    })),
  });
  closeDialog();
  emit('updated');
}

defineExpose({ openDialog, closeDialog });
</script>

<template>
  <dialog ref="dialogRef">
    <GroupForm
      :form="form"
      :isEdit="true"
      @addPerson="addPerson"
      @removePerson="removePerson"
      @submit="handleSubmit"
      @cancel="closeDialog"
    />
  </dialog>
</template>
