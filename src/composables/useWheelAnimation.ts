import { ref, type Ref } from 'vue';
import type { Person } from '../types';
import { getRandomWeightedIndex } from '../utils/weightedSelection';
import {
  ANIMATION_INITIAL_DELAY,
  ANIMATION_DELAY_INCREMENT_PHASE1,
  ANIMATION_DELAY_INCREMENT_PHASE2,
  ANIMATION_ROUNDS,
} from '../components/wheelConstants';


async function animateWheelSpin(
  totalSegments: number,
  steps: number,
  setHighlight: (idx: number) => void
): Promise<void> {
  let delay = ANIMATION_INITIAL_DELAY;
  for (let i = 0; i <= steps; i++) {
    setHighlight(i % totalSegments);
    await new Promise((res) => setTimeout(res, delay));
    if (i > totalSegments * 1) delay += ANIMATION_DELAY_INCREMENT_PHASE1;
    if (i > totalSegments * 2) delay += ANIMATION_DELAY_INCREMENT_PHASE2;
  }
}


export function useWheelAnimation(
  availablePeople: Ref<Person[]>,
  weights: Ref<number[]>,
  totalWeight: Ref<number>
) {
  const animating = ref(false);
  const highlightedIndex = ref<number>();
  const animationDone = ref(false);
  const selectedPerson = ref<Person>();


  async function spinWheel(): Promise<void> {
    if (animating.value || availablePeople.value.length === 0) return;

    animating.value = true;
    highlightedIndex.value = undefined;
    animationDone.value = false;

    const selectedIdx = getRandomWeightedIndex(
      weights.value,
      totalWeight.value
    );

    const totalSegments = availablePeople.value.length;
    const steps = ANIMATION_ROUNDS * totalSegments + selectedIdx;

    await animateWheelSpin(totalSegments, steps, (idx) => {
      highlightedIndex.value = idx;
    });

    highlightedIndex.value = selectedIdx;
    selectedPerson.value = availablePeople.value[selectedIdx];
    animating.value = false;
    animationDone.value = true;
  }


  function resetAnimation(): void {
    selectedPerson.value = undefined;
    animationDone.value = false;
    highlightedIndex.value = undefined;
  }

  return {
    animating,
    highlightedIndex,
    animationDone,
    selectedPerson,
    spinWheel,
    resetAnimation,
  };
}
