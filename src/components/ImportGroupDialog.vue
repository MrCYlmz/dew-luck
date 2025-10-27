<script setup lang="ts">
import { ref } from 'vue';
import type { GroupCreateRequest } from '../types';
import { createGroup } from '../requests/requests';

const emit = defineEmits(['imported', 'closed']);

const dialogRef = ref<HTMLDialogElement>();
const groupToImport = ref<GroupCreateRequest | null>(null);

function openDialog(group: GroupCreateRequest) {
  groupToImport.value = group;
  dialogRef.value?.showModal();
}

function closeDialog() {
  dialogRef.value?.close();
  groupToImport.value = null;
  emit('closed');
}

async function handleImport() {
  if (!groupToImport.value) return;

  await createGroup(groupToImport.value);
  closeDialog();
  emit('imported');
}

defineExpose({ openDialog, closeDialog });
</script>

<template>
  <dialog ref="dialogRef">
    <form @submit.prevent="handleImport">
      <h2>Import Shared Group</h2>
      <p>Do you want to import this group?</p>

      <div v-if="groupToImport" class="group-details">
        <div class="detail-row">
          <strong>Name:</strong> {{ groupToImport.name }}
        </div>
        <div class="detail-row">
          <strong>Respect Early Selection:</strong> {{ groupToImport.respectEarlySelection ? 'Yes' : 'No' }}
        </div>
        <div>
          <strong>People ({{ groupToImport.people.length }}):</strong>
          <ul class="people-list">
            <li v-for="person in groupToImport.people" :key="person.name">
              {{ person.name }} (weight: {{ person.weight }}<template v-if="groupToImport.respectEarlySelection">, selected: {{ person.isSelected ? 'Yes' : 'No' }}</template>)
            </li>
          </ul>
        </div>
      </div>

      <div class="actions">
        <button type="submit">Import</button>
        <button type="button" @click="closeDialog">Cancel</button>
      </div>
    </form>
  </dialog>
</template>

<style scoped>
.group-details {
  margin-top: 16px;
  margin-bottom: 16px;
}

.detail-row {
  margin-bottom: 12px;
}

.people-list {
  margin-top: 8px;
  margin-left: 20px;
}

.actions {
  margin-top: 16px;
}
</style>
