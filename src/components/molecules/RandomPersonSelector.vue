<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { GroupDetails, Person } from '@/types.ts';
import { DEFAULT_SELECTION_STYLE } from '@/types.ts';
import { useWheelSegments } from '@/composables/useWheelSegments.ts';
import { useWheelAnimation } from '@/composables/useWheelAnimation.ts';
import { useCardShuffleAnimation } from '@/composables/useCardShuffleAnimation.ts';
import { useSelectionDialog } from '@/composables/useSelectionDialog.ts';
import { useSadFaceEasterEgg } from '@/composables/useSadFaceEasterEgg.ts';
import { COLLECT_DURATION } from './cardConstants';
import WheelSVG from './WheelSVG.vue';
import CardShuffle from './CardShuffle.vue';
import SadFacePopups from './SadFacePopups.vue';

const props = defineProps<{ group?: GroupDetails }>();
const emit = defineEmits(['updated']);

const availablePeople = ref<Person[]>([]);

// Configured per group (create/edit), not toggled ad hoc here.
const mode = computed(() => props.group?.selectionStyle ?? DEFAULT_SELECTION_STYLE);

const { weights, totalWeight, wheelSegments } = useWheelSegments(availablePeople);

const wheelAnim = useWheelAnimation(availablePeople, weights, totalWeight);
const cardAnim = useCardShuffleAnimation(availablePeople, weights, totalWeight);

const activeAnim = computed(() => (mode.value === 'wheel' ? wheelAnim : cardAnim));
const animating = computed(() => activeAnim.value.animating.value);
const animationDone = computed(() => activeAnim.value.animationDone.value);
const selectedPerson = computed(() => activeAnim.value.selectedPerson.value);

const {
  confirmDialogRef,
  sadFaces,
  scheduleConfirm,
  cancelConfirm,
  closeConfirm,
  spawnSadFaces,
  dismissSadFace,
} = useSadFaceEasterEgg();

const {
  dialogRef,
  openDialog,
  handleSelect,
  handleAbsent,
  handleCancel,
} = useSelectionDialog(
  selectedPerson,
  availablePeople,
  () => activeAnim.value.resetAnimation(),
  () => activeAnim.value.spin(),
  () => emit('updated'),
  () => scheduleConfirm(selectedPerson.value)
);

async function handleConfirmYes() {
  closeConfirm();
  await handleSelect(props.group);
  spawnSadFaces();
}

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
  await activeAnim.value.spin();
  if (animationDone.value) {
    if (mode.value === 'cards') {
      await new Promise((res) => setTimeout(res, COLLECT_DURATION));
    }
    openDialog();
  }
}
</script>

<template>
  <div>
    <WheelSVG
      v-if="availablePeople.length && mode === 'wheel'"
      :segments="wheelSegments"
      :highlighted-index="wheelAnim.highlightedIndex.value"
      :animating="animating"
      @spin="handleSpin"
    />
    <CardShuffle
      v-if="availablePeople.length && mode === 'cards'"
      :people="availablePeople"
      :revealed-index="cardAnim.revealedIndex.value"
      :animating="animating"
      @spin="handleSpin"
    />
    <p class="sr-only" aria-live="polite">
      {{ animationDone && selectedPerson ? `Selected: ${selectedPerson.name}` : '' }}
    </p>
    <dialog ref="dialogRef" @close="cancelConfirm">
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
    <dialog ref="confirmDialogRef">
      <h2>Are you sure?</h2>
      <p>Are you sure you want to select <strong>{{ selectedPerson?.name }}</strong>?</p>
      <div class="dialog-actions">
        <button @click="handleConfirmYes">Yes</button>
        <button @click="closeConfirm">No</button>
      </div>
    </dialog>
    <SadFacePopups :faces="sadFaces" @dismiss="dismissSadFace" />
  </div>
</template>

<style scoped>
.dialog-actions {
  margin-top: 16px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
