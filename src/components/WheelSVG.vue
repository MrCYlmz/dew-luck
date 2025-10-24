<script setup lang="ts">
import { computed } from 'vue';
import type { WheelSegment } from '../composables/useWheelSegments';
import { polarToCartesian, describeArc } from '../utils/svgGeometry';
import {
  WHEEL_SIZE,
  WHEEL_CENTER,
  WHEEL_OUTER_RADIUS,
  WHEEL_LABEL_RADIUS,
  WHEEL_CENTER_RADIUS,
  SEGMENT_STROKE_WIDTH,
  CENTER_STROKE_WIDTH,
  LABEL_FONT_SIZE,
  CENTER_TEXT_FONT_SIZE,
  HIGHLIGHTED_FILL_COLOR,
  HIGHLIGHTED_STROKE_COLOR,
  SEGMENT_STROKE_COLOR,
  CENTER_FILL_COLOR,
  CENTER_STROKE_COLOR,
  TEXT_COLOR,
  LABEL_COLOR,
  SEGMENT_HUE_SATURATION,
  SEGMENT_HUE_LIGHTNESS,
} from './wheelConstants';

const props = defineProps<{
  segments: WheelSegment[];
  highlightedIndex?: number;
  animating: boolean;
}>();

const emit = defineEmits<{
  spin: [];
}>();


function getSegmentFillColor(segmentIdx: number, isHighlighted: boolean): string {
  if (isHighlighted) {
    return HIGHLIGHTED_FILL_COLOR;
  }
  const hue = (segmentIdx * 360) / props.segments.length;
  return `hsl(${hue}, ${SEGMENT_HUE_SATURATION}, ${SEGMENT_HUE_LIGHTNESS})`;
}


function getSegmentStrokeColor(isHighlighted: boolean): string {
  return isHighlighted ? HIGHLIGHTED_STROKE_COLOR : SEGMENT_STROKE_COLOR;
}

function getLabelFontWeight(isHighlighted: boolean): string {
  return isHighlighted ? 'bold' : 'normal';
}

const centerText = computed(() => (props.animating ? 'Spinning...' : 'Spin'));

function handleClick() {
  if (!props.animating) {
    emit('spin');
  }
}
</script>

<template>
  <div class="wheel-container">
    <svg
      :width="WHEEL_SIZE"
      :height="WHEEL_SIZE"
      :viewBox="`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`"
      class="wheel-svg"
      @click="handleClick"
    >
      <g>
        <template v-for="segment in segments" :key="segment.idx">
          <path
            :d="
              describeArc(
                WHEEL_CENTER,
                WHEEL_CENTER,
                WHEEL_OUTER_RADIUS,
                segment.startAngle,
                segment.endAngle
              )
            "
            :fill="
              getSegmentFillColor(
                segment.idx,
                highlightedIndex === segment.idx
              )
            "
            :stroke="getSegmentStrokeColor(highlightedIndex === segment.idx)"
            :stroke-width="SEGMENT_STROKE_WIDTH"
            class="wheel-segment"
          />
          <text
            :x="
              polarToCartesian(
                WHEEL_CENTER,
                WHEEL_CENTER,
                WHEEL_LABEL_RADIUS,
                (segment.startAngle + segment.endAngle) / 2
              ).x
            "
            :y="
              polarToCartesian(
                WHEEL_CENTER,
                WHEEL_CENTER,
                WHEEL_LABEL_RADIUS,
                (segment.startAngle + segment.endAngle) / 2
              ).y
            "
            text-anchor="middle"
            alignment-baseline="middle"
            :font-size="LABEL_FONT_SIZE"
            :fill="LABEL_COLOR"
            :style="{ fontWeight: getLabelFontWeight(highlightedIndex === segment.idx) }"
            class="wheel-label"
          >
            {{ segment.person.name }}
          </text>
        </template>
      </g>
      <circle
        :cx="WHEEL_CENTER"
        :cy="WHEEL_CENTER"
        :r="WHEEL_CENTER_RADIUS"
        :fill="CENTER_FILL_COLOR"
        :stroke="CENTER_STROKE_COLOR"
        :stroke-width="CENTER_STROKE_WIDTH"
      />
      <text
        :x="WHEEL_CENTER"
        :y="WHEEL_CENTER"
        text-anchor="middle"
        alignment-baseline="middle"
        :font-size="CENTER_TEXT_FONT_SIZE"
        :fill="TEXT_COLOR"
        font-weight="bold"
        pointer-events="none"
      >
        {{ centerText }}
      </text>
    </svg>
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

.wheel-label {
  pointer-events: none;
}
</style>
