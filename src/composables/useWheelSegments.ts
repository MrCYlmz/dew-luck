import { computed, type Ref } from 'vue';
import type { Person } from '../types';

export interface WheelSegment {
  person: Person;
  startAngle: number;
  endAngle: number;
  idx: number;
}


export function useWheelSegments(availablePeople: Ref<Person[]>) {
  const weights = computed(() =>
    availablePeople.value.map((p) => Math.max(1, p.weight))
  );

  const totalWeight = computed(() =>
    weights.value.reduce((a, b) => a + b, 0)
  );

  const wheelSegments = computed<WheelSegment[]>(() => {
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

  return {
    weights,
    totalWeight,
    wheelSegments,
  };
}
