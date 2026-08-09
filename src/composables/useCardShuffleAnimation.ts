import { ref, type Ref } from 'vue';
import type { Person } from '../types';
import { getRandomWeightedIndex } from '../utils/weightedSelection';
import { SHUFFLE_DURATION } from '../components/molecules/cardConstants';

export function useCardShuffleAnimation(
  availablePeople: Ref<Person[]>,
  weights: Ref<number[]>,
  totalWeight: Ref<number>
) {
  const animating = ref(false);
  const revealedIndex = ref<number>();
  const animationDone = ref(false);
  const selectedPerson = ref<Person>();

  async function spin(): Promise<void> {
    if (animating.value || availablePeople.value.length === 0) return;

    animating.value = true;
    revealedIndex.value = undefined;
    animationDone.value = false;

    const selectedIdx = getRandomWeightedIndex(
      weights.value,
      totalWeight.value
    );

    await new Promise((res) => setTimeout(res, SHUFFLE_DURATION));

    revealedIndex.value = selectedIdx;
    selectedPerson.value = availablePeople.value[selectedIdx];
    animating.value = false;
    animationDone.value = true;
  }

  function resetAnimation(): void {
    selectedPerson.value = undefined;
    animationDone.value = false;
    revealedIndex.value = undefined;
  }

  return {
    animating,
    revealedIndex,
    animationDone,
    selectedPerson,
    spin,
    resetAnimation,
  };
}
