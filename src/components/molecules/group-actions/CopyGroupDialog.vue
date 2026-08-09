<script setup lang="ts">
import { ref } from 'vue';
import type { GroupDetails } from '@/types.ts';
import { createGroup } from '@/requests/requests.ts';
import { useGroupForm } from '@/composables/useGroupForm.ts';
import GroupForm from '../GroupForm.vue';

const props = defineProps<{
  group?: GroupDetails;
}>();
const emit = defineEmits(['closed']);

const dialogRef = ref<HTMLDialogElement | null>(null);

const { form, addPerson, removePerson, loadFromPeople } = useGroupForm();

function openDialog() {
  if (props.group) {
    loadFromPeople('', props.group.respectEarlySelection, props.group.people, {
      regenerateIds: true,
      resetSelection: true,
    });
    dialogRef.value?.showModal();
  }
}

function closeDialog() {
  dialogRef.value?.close();
  emit('closed');
}

async function handleSubmit() {
  await createGroup({
    name: form.name,
    respectEarlySelection: form.respectEarlySelection,
    people: form.people.map((p) => ({
      id: p.id,
      name: p.name,
      weight: form.isWeightedSelection ? p.weight : 1,
      isSelected: false,
    })),
  });
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
