<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import type { GroupDetails } from '@/types.ts';
import { createGroup } from '@/requests/requests.ts';
import GroupForm from '../GroupForm.vue';

const props = defineProps<{
  group?: GroupDetails;
}>();
const emit = defineEmits(['closed']);

const dialogRef = ref<HTMLDialogElement | null>(null);

const form = reactive<{
  name: string;
  respectEarlySelection: boolean;
  isWeightedSelection: boolean;
  people: { name: string; weight: number; isSelected: boolean }[];
}>({
  name: '',
  respectEarlySelection: false,
  isWeightedSelection: false,
  people: [],
});

function openDialog() {
  if (props.group) {
    // Copy all data from selected group except name (name stays empty)
    form.name = '';
    form.respectEarlySelection = props.group.respectEarlySelection;
    form.isWeightedSelection = props.group.people.some((p) => p.weight !== 1);
    form.people = props.group.people.map((p) => ({
      name: p.name,
      weight: p.weight,
      isSelected: false, // Reset selection status for new group
    }));
    dialogRef.value?.showModal();
  }
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

watch(
  () => form.isWeightedSelection,
  (val) => {
    if (!val) {
      form.people.forEach((p) => (p.weight = 1));
    }
  }
);

async function handleSubmit() {
  await createGroup({
    name: form.name,
    respectEarlySelection: form.respectEarlySelection,
    people: form.people.map((p) => ({
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
