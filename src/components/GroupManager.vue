<script setup lang="ts">
import { ref } from 'vue';
import GroupSelection from './GroupSelection.vue';
import CreateGroupDialog from './CreateGroupDialog.vue';
import EditGroupDialog from './EditGroupDialog.vue';
import DeleteGroupDialog from './DeleteGroupDialog.vue';
import ResetSelectionsDialog from './ResetSelectionsDialog.vue';
import type { GroupDetails } from '../types';
import { fetchGroups, invalidateGroupsCache } from '../requests/requests';

const createDialogRef = ref<InstanceType<typeof CreateGroupDialog>>();
const editDialogRef = ref<InstanceType<typeof EditGroupDialog>>();
const deleteDialogRef = ref<InstanceType<typeof DeleteGroupDialog>>();
const resetSelectionsDialogRef = ref<InstanceType<typeof ResetSelectionsDialog>>();

const selectedGroup = ref<GroupDetails>();
const groupSelectionRef = ref<InstanceType<typeof GroupSelection>>();
const groups = ref<GroupDetails[]>([]);

async function loadGroups() {
  invalidateGroupsCache();
  groups.value = await fetchGroups();
  selectedGroup.value = undefined;
}

function handleGroupSelected(group: GroupDetails) {
  selectedGroup.value = group;
}

function openEditDialog() {
  editDialogRef.value?.openDialog();
}

function openDeleteDialog() {
  deleteDialogRef.value?.openDialog();
}

function openCreateDialog() {
  createDialogRef.value?.openDialog();
}

function openResetSelectionsDialog() {
  resetSelectionsDialogRef.value?.openDialog();
}

loadGroups();
</script>

<template>
  <div>
    <h1>Group Manager</h1>
    <div style="margin-bottom: 16px;">
      <button @click="openCreateDialog">Create Group</button>
      <button @click="openEditDialog" :disabled="!selectedGroup">Edit Group</button>
      <button @click="openDeleteDialog" :disabled="!selectedGroup">Delete Group</button>
      <button @click="openResetSelectionsDialog" :disabled="!selectedGroup">Reset Selections</button>
    </div>
    <GroupSelection
      ref="groupSelectionRef"
      :groups="groups"
      @group-selected="handleGroupSelected"
      @refresh="loadGroups"
    />
    <CreateGroupDialog ref="createDialogRef" @closed="loadGroups" />
    <EditGroupDialog
      ref="editDialogRef"
      :group="selectedGroup"
      @updated="loadGroups"
      @closed="loadGroups"
    />
    <DeleteGroupDialog
      ref="deleteDialogRef"
      :group="selectedGroup"
      @deleted="loadGroups"
      @closed="loadGroups"
    />
    <ResetSelectionsDialog
      ref="resetSelectionsDialogRef"
      :group="selectedGroup"
      @reset="loadGroups"
      @closed="loadGroups"
    />
  </div>
</template>
