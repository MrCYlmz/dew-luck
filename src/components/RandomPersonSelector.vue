<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import type { GroupDetails, Person } from '../types';
import { selectPerson } from '../requests/requests';

const props = defineProps<{ group?: GroupDetails }>();
const emit = defineEmits(['updated']);

const dialogRef = ref<HTMLDialogElement>();
const availablePeople = ref<Person[]>([]);
const selectedPerson = ref<Person>();
const wheelRef = ref<SVGSVGElement>();
const animating = ref(false);
const highlightedIndex = ref<number>();
const animationDone = ref(false);

const weights = computed(() => availablePeople.value.map(p => Math.max(1, p.weight)));
const totalWeight = computed(() => weights.value.reduce((a, b) => a + b, 0));
const wheelSegments = computed(() => {
  let startAngle = 0;
  return availablePeople.value.map((person, idx) => {
    const angle = (weights.value[idx] / totalWeight.value) * 2 * Math.PI;
    const segment = {
      person,
      startAngle,
      endAngle: startAngle + angle,
      idx,
    };
    startAngle += angle;
    return segment;
  });
});

watch(
  () => props.group,
  (group) => updateAvailablePeople(group),
  { immediate: true, deep: true }
);

function updateAvailablePeople(group?: GroupDetails) {
  if (!group) {
    availablePeople.value = [];
    selectedPerson.value = undefined;
    return;
  }
  availablePeople.value = group.respectEarlySelection
    ? group.people.filter(p => !p.isSelected)
    : group.people;
  selectedPerson.value = undefined;
}



function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle - Math.PI / 2),
    y: cy + r * Math.sin(angle - Math.PI / 2),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    'Z'
  ].join(' ');
}

function getRandomSelectedIndex(weightsArr: number[], totalWeight: number): number {
  let rnd = Math.random() * totalWeight;
  for (let i = 0; i < weightsArr.length; i++) {
    if (rnd < weightsArr[i]) {
      return i;
    }
    rnd -= weightsArr[i];
  }
  return 0;
}

async function animateWheelSpin(totalSegments: number, steps: number, setHighlight: (idx: number) => void) {
  let delay = 20;
  for (let i = 0; i <= steps; i++) {
    setHighlight(i % totalSegments);
    await new Promise(res => setTimeout(res, delay));
    if (i > totalSegments * 1) delay += 6;
    if (i > totalSegments * 2) delay += 10;
  }
}

async function spinWheel() {
  if (animating.value || availablePeople.value.length === 0) return;
  animating.value = true;
  highlightedIndex.value = undefined;
  animationDone.value = false;

  const weightsArr = weights.value;
  const selectedIdx = getRandomSelectedIndex(weightsArr, totalWeight.value);

  const totalSegments = availablePeople.value.length;
  const rounds = 3;
  const steps = rounds * totalSegments + selectedIdx;

  await animateWheelSpin(totalSegments, steps, idx => highlightedIndex.value = idx);

  highlightedIndex.value = selectedIdx;
  selectedPerson.value = availablePeople.value[selectedIdx];
  animating.value = false;
  animationDone.value = true;
  await nextTick();
  dialogRef.value?.showModal();
}

function handleWheelCenterClick() {
  if (!animating.value) spinWheel();
}

function closeDialog() {
  dialogRef.value?.close();
  selectedPerson.value = undefined;
  animationDone.value = false;
  highlightedIndex.value = undefined;
}

async function handleSelect() {
  if (!props.group || !selectedPerson.value) return;
  await selectPerson(props.group.id, selectedPerson.value.name);
  closeDialog();
  emit('updated');
}

function handleAbsent() {
  if (!selectedPerson.value) return;
  availablePeople.value = availablePeople.value.filter(p => p.name !== selectedPerson.value?.name);
  closeDialog();
  spinWheel();
}

function handleCancel() {
  closeDialog();
}
</script>

<template>
  <div>
    <div v-if="availablePeople.length" class="wheel-container">
      <svg
        ref="wheelRef"
        width="320"
        height="320"
        viewBox="0 0 320 320"
        class="wheel-svg"
        @click="handleWheelCenterClick"
      >
        <g>
          <template v-for="segment in wheelSegments" :key="segment.idx">
            <path
              :d="describeArc(160, 160, 140, segment.startAngle, segment.endAngle)"
              :fill="highlightedIndex === segment.idx ? '#ffd700' : `hsl(${segment.idx * 360 / availablePeople.length}, 70%, 60%)`"
              :stroke="highlightedIndex === segment.idx ? '#ff9800' : '#fff'"
              stroke-width="2"
              class="wheel-segment"
            />
            <text
              :x="polarToCartesian(160, 160, 100, (segment.startAngle + segment.endAngle) / 2).x"
              :y="polarToCartesian(160, 160, 100, (segment.startAngle + segment.endAngle) / 2).y"
              text-anchor="middle"
              alignment-baseline="middle"
              font-size="14"
              fill="#222"
              :style="{ fontWeight: highlightedIndex === segment.idx ? 'bold' : 'normal' }"
              class="wheel-label"
            >
              {{ segment.person.name }}
            </text>
          </template>
        </g>
        <circle
          cx="160"
          cy="160"
          r="50"
          fill="#eee"
          stroke="#888"
          stroke-width="3"
        />
        <text
          x="160"
          y="160"
          text-anchor="middle"
          alignment-baseline="middle"
          font-size="18"
          fill="#333"
          font-weight="bold"
          pointer-events="none"
        >
          {{ animating ? 'Spinning...' : 'Spin' }}
        </text>
      </svg>
    </div>
    <dialog ref="dialogRef">
      <div v-if="selectedPerson">
        <h2>Selected Person</h2>
        <p>
          <strong>{{ selectedPerson.name }}</strong>
          <span v-if="selectedPerson.weight > 1">(Weight: {{ selectedPerson.weight }})</span>
        </p>
        <div class="dialog-actions">
          <button @click="handleAbsent">Absent</button>
          <button @click="handleSelect">Select</button>
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
.wheel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 24px 0;
}

.wheel-svg {
  user-select: none;
  cursor: pointer;
}

.wheel-segment {
  transition: fill 0.2s, stroke 0.2s;
}

.dialog-actions {
  margin-top: 16px;
}

.wheel-label {
  pointer-events: none;
}
</style>
