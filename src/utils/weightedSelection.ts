export function getRandomWeightedIndex(
  weights: number[],
  totalWeight: number
): number {
  let rnd = Math.random() * totalWeight;
  for (let i = 0; i < weights.length; i++) {
    if (rnd < weights[i]) {
      return i;
    }
    rnd -= weights[i];
  }
  return 0;
}
