<script setup lang="ts">
import type { SadFace } from '@/composables/useSadFaceEasterEgg.ts';

defineProps<{ faces: SadFace[] }>();

const emit = defineEmits<{
  dismiss: [id: number];
}>();
</script>

<template>
  <Teleport to="body">
    <TransitionGroup name="sad-face" tag="div" class="sad-face-layer" aria-hidden="true">
      <div
        v-for="face in faces"
        :key="face.id"
        class="sad-face-popup"
        :style="{
          left: `${face.x}vw`,
          top: `${face.y}vh`,
          transform: `rotate(${face.rotation}deg)`,
        }"
      >
        <div class="sad-face-titlebar">
          <span>Oh no…</span>
          <button type="button" class="sad-face-close" @click="emit('dismiss', face.id)">×</button>
        </div>
        <div class="sad-face-body">{{ face.emoji }}</div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped>
.sad-face-layer {
  position: fixed;
  inset: 0;
  z-index: 1000;
  /* Only the popups themselves should catch clicks. */
  pointer-events: none;
}

.sad-face-popup {
  position: absolute;
  width: 150px;
  pointer-events: auto;
  background: #fff;
  color: #222;
  border: 1px solid #999;
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.sad-face-titlebar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  font-size: 12px;
  background: #e5e5e5;
  border-bottom: 1px solid #bbb;
}

.sad-face-close {
  padding: 0 6px;
  font-size: 14px;
  line-height: 1;
  background: transparent;
  border: none;
  cursor: pointer;
}

.sad-face-body {
  padding: 16px;
  font-size: 48px;
  text-align: center;
}

.sad-face-enter-active,
.sad-face-leave-active {
  transition: opacity 0.25s ease, scale 0.25s ease;
}

.sad-face-enter-from,
.sad-face-leave-to {
  opacity: 0;
  scale: 0.6;
}
</style>
