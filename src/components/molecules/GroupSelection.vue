<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { GroupDetails } from '@/types';
import RandomPersonSelector from "./RandomPersonSelector.vue";

const props = defineProps<{
  groups: GroupDetails[];
}>();

const selectedGroupId = ref<string>();

const selectedGroup = computed(() =>
  props.groups.find(g => g.id === selectedGroupId.value)
);

const emit = defineEmits(['group-selected', 'refresh']);

watch(
  selectedGroup,
  (group) => emit('group-selected', group)
);
</script>

<template>
  <div>
    <label>
      Select Group:
      <select v-model="selectedGroupId">
        <option disabled value="">-- Select a group --</option>
        <option v-for="group in props.groups" :key="group.id" :value="group.id">
          {{ group.name }}
        </option>
      </select>
    </label>

    <div v-if="selectedGroup" style="margin-top: 16px;">
      <h3>Group Details</h3>
      <p><strong>Name:</strong> {{ selectedGroup.name }}</p>
      <p><strong>Respect Early Selection:</strong> {{ selectedGroup.respectEarlySelection ? 'Yes' : 'No' }}</p>
      <RandomPersonSelector
          :group="selectedGroup"
          @updated="emit('refresh')"
          style="margin-left: 16px;"
      />
    </div>
  </div>
</template>