<script setup lang="ts">
import { ref, watch } from 'vue';
import type { GroupDetails, Person } from '../types';
import { useWheelSegments } from '../composables/useWheelSegments';
import { useWheelAnimation } from '../composables/useWheelAnimation';
import { useSelectionDialog } from '../composables/useSelectionDialog';
import WheelSVG from './WheelSVG.vue';

const props = defineProps<{ group?: GroupDetails }>();
const emit = defineEmits(['updated']);

const availablePeople = ref<Person[]>([]);

// Use composables for organized state management
const { weights, totalWeight, wheelSegments } = useWheelSegments(availablePeople);

const {
  animating,
  highlightedIndex,
  animationDone,
  selectedPerson,
  spinWheel,
  resetAnimation,
} = useWheelAnimation(availablePeople, weights, totalWeight);

const {
  dialogRef,
  openDialog,
  handleSelect,
  handleAbsent,
  handleCancel,
} = useSelectionDialog(
  selectedPerson,
  availablePeople,
  resetAnimation,
  spinWheel,
  () => emit('updated')
);

watch(
  () => props.group,
  (group) => updateAvailablePeople(group),
  { immediate: true, deep: true }
);

function updateAvailablePeople(group?: GroupDetails) {
  if (!group) {
    availablePeople.value = [];
    return;
  }
  availablePeople.value = group.respectEarlySelection
    ? group.people.filter((p) => !p.isSelected)
    : group.people;
}

async function handleSpin() {
  await spinWheel();
  if (animationDone.value) {
    openDialog();
  }
}
</script>

<template>
  <div>
    <WheelSVG
      v-if="availablePeople.length"
      :segments="wheelSegments"
      :highlighted-index="highlightedIndex"
      :animating="animating"
      @spin="handleSpin"
    />
    <dialog ref="dialogRef">
      <div v-if="selectedPerson">
        <h2>Selected Person</h2>
        <p>
          <strong>{{ selectedPerson.name }}</strong>
          <span v-if="selectedPerson.weight > 1">(Weight: {{ selectedPerson.weight }})</span>
        </p>
        <div class="dialog-actions">
          <button @click="handleAbsent">Absent</button>
          <button @click="() => handleSelect(group)">Select</button>
          <button @click="handleCancel">Cancel</button>
        </div>
      </div>
      <div v-else>
        <p>No available person to select.</p>
        <button @click="handleCancel">Close</button>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.dialog-actions {
  margin-top: 16px;
}
</style>
