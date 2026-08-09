<script setup lang="ts">
import { ref, computed, watch, onUnmounted, type ComponentPublicInstance } from 'vue';
import type { Person } from '@/types.ts';
import {
  COLLECT_DURATION,
  FLIP_DURATION,
  CARD_WIDTH,
  CARD_HEIGHT,
  CARD_RADIUS,
  CARD_GAP,
  CARD_BACK_COLOR,
  CARD_BACK_PATTERN_COLOR,
  CARD_BORDER_COLOR,
  CARD_FACE_COLOR,
  CARD_FACE_TEXT_COLOR,
  CARD_REVEALED_GLOW_COLOR,
} from './cardConstants';

const props = defineProps<{
  people: Person[];
  revealedIndex?: number;
  animating: boolean;
}>();

const emit = defineEmits<{
  spin: [];
}>();

const fanEl = ref<HTMLElement>();
const cardEls = ref<(HTMLElement | null)[]>([]);
const centerOffsets = ref<{ x: number; y: number }[]>([]);

function setCardRef(el: Element | ComponentPublicInstance | null, idx: number) {
  cardEls.value[idx] = el as HTMLElement | null;
}

function measureCenterOffsets() {
  const fan = fanEl.value;
  if (!fan) return;
  const fanRect = fan.getBoundingClientRect();
  const centerX = fanRect.left + fanRect.width / 2;
  const centerY = fanRect.top + fanRect.height / 2;
  centerOffsets.value = props.people.map((_, idx) => {
    const el = cardEls.value[idx];
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return {
      x: centerX - (rect.left + rect.width / 2),
      y: centerY - (rect.top + rect.height / 2),
    };
  });
}

const collecting = ref(false);
let collectTimer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => props.animating,
  (animating) => {
    clearTimeout(collectTimer);
    if (animating) {
      // Vue watchers flush before the DOM updates, so the cards are still
      // laid out at rest here — exactly the positions we need to measure.
      measureCenterOffsets();
      collecting.value = true;
      collectTimer = setTimeout(() => {
        collecting.value = false;
      }, COLLECT_DURATION);
    } else {
      collecting.value = false;
    }
  }
);

const releasing = ref(false);
let releaseTimer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => props.revealedIndex,
  (revealedIndex) => {
    clearTimeout(releaseTimer);
    if (revealedIndex !== undefined) {
      releasing.value = true;
      releaseTimer = setTimeout(() => {
        releasing.value = false;
      }, COLLECT_DURATION);
    } else {
      releasing.value = false;
    }
  }
);

onUnmounted(() => {
  clearTimeout(collectTimer);
  clearTimeout(releaseTimer);
});

const phase = computed<'idle' | 'collecting' | 'shuffling' | 'releasing' | 'revealed'>(() => {
  if (props.revealedIndex !== undefined) return releasing.value ? 'releasing' : 'revealed';
  if (collecting.value) return 'collecting';
  if (props.animating) return 'shuffling';
  return 'idle';
});

function handleShuffle() {
  if (!props.animating) {
    emit('spin');
  }
}

// How far card `idx` sits from the fanned row's center, so it can be
// translated there to form a pile.

function isFaceUp(idx: number): boolean {
  if (phase.value === 'revealed') return idx === props.revealedIndex;
  return phase.value === 'idle';
}

function isWinner(idx: number): boolean {
  return phase.value === 'revealed' && idx === props.revealedIndex;
}

function positionStyle(idx: number) {
  const collected = phase.value === 'collecting' || phase.value === 'shuffling';
  const offset = centerOffsets.value[idx];
  return {
    '--tx': `${collected && offset ? offset.x : 0}px`,
    '--ty': `${collected && offset ? offset.y : 0}px`,
    // Lift the pile above its neighbours so the stack reads as one deck.
    zIndex: collected ? props.people.length - idx : 0,
  };
}

function jitterStyle(idx: number) {
  return { animationDelay: `${idx * 40}ms` };
}

function flipStyle(idx: number) {
  return { '--rot': isFaceUp(idx) ? '180deg' : '0deg' };
}
</script>

<template>
  <div class="card-shuffle-container">
    <div ref="fanEl" class="fan">
      <div
        v-for="(person, idx) in people"
        :key="person.id"
        :ref="(el) => setCardRef(el, idx)"
        class="card-position"
        :style="positionStyle(idx)"
      >
        <div
          class="card-jitter"
          :class="{ shuffling: phase === 'shuffling' }"
          :style="jitterStyle(idx)"
        >
          <div
            class="card"
            :class="{ winner: isWinner(idx) }"
            :style="flipStyle(idx)"
          >
            <div class="card-face card-back-face" />
            <div class="card-face card-front-face">
              <span class="card-name">{{ person.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <button
      v-if="revealedIndex === undefined"
      type="button"
      class="shuffle-button"
      :disabled="animating"
      @click="handleShuffle"
    >
      {{ phase === 'collecting' ? 'Gathering...' : animating ? 'Shuffling...' : 'Shuffle!' }}
    </button>
  </div>
</template>

<style scoped>
.card-shuffle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 24px 0;
}

.fan {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: v-bind('CARD_GAP + "px"');
  perspective: 1000px;
  max-width: 100%;
}

.card-position {
  flex-shrink: 0;
  width: v-bind('CARD_WIDTH + "px"');
  height: v-bind('CARD_HEIGHT + "px"');
  transform: translate(var(--tx, 0px), var(--ty, 0px));
  transition: transform v-bind('FLIP_DURATION + "ms"') ease-in-out;
}

.card-jitter {
  width: 100%;
  height: 100%;
}

.card-jitter.shuffling {
  animation: shuffle-jitter 0.4s ease-in-out infinite;
}

@keyframes shuffle-jitter {
  0% {
    transform: rotate(0deg) translateY(0);
  }
  25% {
    transform: rotate(-8deg) translateY(-6px);
  }
  50% {
    transform: rotate(7deg) translateY(4px);
  }
  75% {
    transform: rotate(-5deg) translateY(3px);
  }
  100% {
    transform: rotate(0deg) translateY(0);
  }
}

.card {
  width: 100%;
  height: 100%;
  border-radius: v-bind('CARD_RADIUS + "px"');
  border: 2px solid v-bind('CARD_BORDER_COLOR');
  box-sizing: border-box;
  position: relative;
  transform-style: preserve-3d;
  transform: rotateY(var(--rot, 0deg));
  transition: transform v-bind('FLIP_DURATION + "ms"') ease-in-out;
}

.card.winner {
  box-shadow: 0 0 16px v-bind('CARD_REVEALED_GLOW_COLOR');
}

.card-face {
  position: absolute;
  inset: -2px;
  border-radius: v-bind('CARD_RADIUS + "px"');
  border: 2px solid v-bind('CARD_BORDER_COLOR');
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 8px;
}

.card-back-face {
  background: repeating-linear-gradient(
    45deg,
    v-bind('CARD_BACK_COLOR'),
    v-bind('CARD_BACK_COLOR') 8px,
    v-bind('CARD_BACK_PATTERN_COLOR') 8px,
    v-bind('CARD_BACK_PATTERN_COLOR') 16px
  );
}

.card-front-face {
  background: v-bind('CARD_FACE_COLOR');
  color: v-bind('CARD_FACE_TEXT_COLOR');
  transform: rotateY(180deg);
  text-align: center;
  font-weight: bold;
  word-break: break-word;
}

.card-name {
  font-size: 15px;
}

.shuffle-button {
  font-weight: bold;
}
</style>
