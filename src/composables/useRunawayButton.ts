import { ref, computed, onScopeDispose, type CSSProperties } from 'vue';
import type { Person } from '../types';
import {
  RUNAWAY_NAME,
  RUNAWAY_DURATION,
  RUNAWAY_TRIGGER_RADIUS,
  RUNAWAY_ESCAPE_PADDING,
  RUNAWAY_VIEWPORT_MARGIN,
  RUNAWAY_TRANSITION_MS,
} from '../components/molecules/easterEggConstants';

/**
 * Easter egg: makes a button flee the cursor for a while when the selected
 * person's name contains RUNAWAY_NAME. The button stays clickable the whole
 * time — it just gets hard to catch.
 */
export function useRunawayButton() {
  const buttonRef = ref<HTMLButtonElement>();
  const isRunning = ref(false);
  const offset = ref({ x: 0, y: 0 });

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const buttonStyle = computed<CSSProperties>(() =>
    isRunning.value
      ? {
          position: 'relative',
          zIndex: 1,
          transform: `translate(${offset.value.x}px, ${offset.value.y}px)`,
          transition: `transform ${RUNAWAY_TRANSITION_MS}ms ease-out`,
        }
      : {}
  );

  function start(person?: Person): void {
    if (isRunning.value) return;
    if (!person?.name.toLowerCase().includes(RUNAWAY_NAME)) return;
    // No cursor to run from on touch devices, and dodging is pure motion.
    if (
      window.matchMedia('(hover: none)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    offset.value = { x: 0, y: 0 };
    isRunning.value = true;
    document.addEventListener('pointermove', handlePointerMove);
    timeoutId = setTimeout(stop, RUNAWAY_DURATION);
  }

  function stop(): void {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
    document.removeEventListener('pointermove', handlePointerMove);
    isRunning.value = false;
    offset.value = { x: 0, y: 0 };
  }

  function handlePointerMove(event: PointerEvent): void {
    const button = buttonRef.value;
    if (!button) return;

    // The rect already includes the current translate.
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = centerX - event.clientX;
    let dy = centerY - event.clientY;
    let distance = Math.hypot(dx, dy);
    if (distance >= RUNAWAY_TRIGGER_RADIUS) return;

    if (distance === 0) {
      // Cursor exactly on the centre — flee in a random direction.
      const angle = Math.random() * 2 * Math.PI;
      dx = Math.cos(angle);
      dy = Math.sin(angle);
      distance = 1;
    }

    const jump = RUNAWAY_TRIGGER_RADIUS - distance + RUNAWAY_ESCAPE_PADDING;
    const nextX = offset.value.x + (dx / distance) * jump;
    const nextY = offset.value.y + (dy / distance) * jump;

    // Untransformed position, used to keep the button inside the viewport.
    const baseLeft = rect.left - offset.value.x;
    const baseTop = rect.top - offset.value.y;

    offset.value = {
      x: clamp(
        nextX,
        RUNAWAY_VIEWPORT_MARGIN - baseLeft,
        window.innerWidth - RUNAWAY_VIEWPORT_MARGIN - rect.width - baseLeft
      ),
      y: clamp(
        nextY,
        RUNAWAY_VIEWPORT_MARGIN - baseTop,
        window.innerHeight - RUNAWAY_VIEWPORT_MARGIN - rect.height - baseTop
      ),
    };
  }

  onScopeDispose(stop);

  return {
    buttonRef,
    isRunning,
    buttonStyle,
    start,
    stop,
  };
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}
