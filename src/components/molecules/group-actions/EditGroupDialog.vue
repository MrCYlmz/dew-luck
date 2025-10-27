<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import type { GroupDetails } from '@/types.ts';
import { updateGroup } from '@/requests/requests.ts';
import GroupForm from '../GroupForm.vue';

const props = defineProps<{
  group?: GroupDetails;
}>();
const emit = defineEmits(['updated', 'closed']);

const dialogRef = ref<HTMLDialogElement>();

const form = reactive({
  name: '',
  respectEarlySelection: false,
  isWeightedSelection: false,
  people: [] as { name: string; weight: number; isSelected: boolean }[],
});

function openDialog() {
  if (props.group) {
    form.name = props.group.name;
    form.respectEarlySelection = props.group.respectEarlySelection;
    form.isWeightedSelection = props.group.people.some(p => p.weight !== 1);
    form.people = props.group.people.map(p => ({
      name: p.name,
      weight: p.weight,
      isSelected: p.isSelected,
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
      form.people.forEach(p => p.weight = 1);
    }
  }
);

async function handleSubmit() {
  if (!props.group) return;
  await updateGroup(props.group.id, {
    id: props.group.id,
    name: form.name,
    respectEarlySelection: form.respectEarlySelection,
    people: form.people.map(p => ({
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
