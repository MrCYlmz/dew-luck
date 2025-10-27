<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import type { GroupCreateRequest } from '@/types.ts';
import { createGroup } from '@/requests/requests.ts';
import GroupForm from '../GroupForm.vue';

const emit = defineEmits(['closed']);

const dialogRef = ref<HTMLDialogElement | null>(null);

const form = reactive<GroupCreateRequest & { isWeightedSelection: boolean }>({
  name: '',
  respectEarlySelection: false,
  isWeightedSelection: false,
  people: [],
});

function openDialog() {
  resetForm();
  dialogRef.value?.showModal();
}

function closeDialog() {
  dialogRef.value?.close();
  emit('closed');
}

function addPerson() {
  form.people.push({ name: '', weight: 1, isSelected: false });
}

function removePerson(idx: number) {
  form.people.splice(idx, 1);
}

function resetForm() {
  form.name = '';
  form.respectEarlySelection = false;
  form.isWeightedSelection = false;
  form.people = [];
}

watch(
  () => form.isWeightedSelection,
  (val) => {
    if (!val) {
      form.people.forEach(p => p.weight = 1);
    }
  }
);

async function handleSubmit() {
  await createGroup({
    name: form.name,
    respectEarlySelection: form.respectEarlySelection,
    isWeightedSelection: form.isWeightedSelection,
    people: form.people.map(p => ({
      name: p.name,
      weight: form.isWeightedSelection ? p.weight : 1,
      isSelected: false,
    })),
  } as any);
  closeDialog();
}
defineExpose({ openDialog, closeDialog });
</script>

<template>
  <div>
    <dialog ref="dialogRef">
      <GroupForm
        :form="form"
        :isEdit="false"
        @addPerson="addPerson"
        @removePerson="removePerson"
        @submit="handleSubmit"
        @cancel="closeDialog"
      />
    </dialog>
  </div>
</template>
