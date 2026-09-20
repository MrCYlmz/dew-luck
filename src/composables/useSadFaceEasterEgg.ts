import { ref, onScopeDispose } from 'vue';
import type { Person } from '../types';
import {
  EASTER_EGG_NAME,
  CONFIRM_DELAY_MS,
  SAD_FACE_COUNT,
  SAD_FACE_STAGGER_MS,
  SAD_FACE_LIFETIME_MS,
  SAD_FACES,
} from '../components/molecules/easterEggConstants';

export interface SadFace {
  id: number;
  emoji: string;
  x: number; // vw
  y: number; // vh
  rotation: number; // deg
}

/**
 * Easter egg: when the selected person's name contains EASTER_EGG_NAME, a
 * second "are you sure?" dialog pops up shortly after the result dialog. If
 * the user confirms anyway, the screen fills with sad-face popups that close
 * themselves after a while.
 */
export function useSadFaceEasterEgg() {
  const confirmDialogRef = ref<HTMLDialogElement>();
  const sadFaces = ref<SadFace[]>([]);

  let confirmTimeoutId: ReturnType<typeof setTimeout> | undefined;
  const faceTimeouts = new Set<ReturnType<typeof setTimeout>>();
  let nextFaceId = 0;

  function isTarget(person?: Person): boolean {
    return !!person?.name.toLowerCase().includes(EASTER_EGG_NAME);
  }

  /** Call when the result dialog opens; asks "are you sure?" after a delay. */
  function scheduleConfirm(person?: Person): void {
    cancelConfirm();
    if (!isTarget(person)) return;
    confirmTimeoutId = setTimeout(() => {
      confirmTimeoutId = undefined;
      // Nested showModal stacks on top of the still-open result dialog.
      confirmDialogRef.value?.showModal();
    }, CONFIRM_DELAY_MS);
  }

  /** Call when the result dialog closes so a pending prompt doesn't fire. */
  function cancelConfirm(): void {
    if (confirmTimeoutId !== undefined) {
      clearTimeout(confirmTimeoutId);
      confirmTimeoutId = undefined;
    }
  }

  function closeConfirm(): void {
    confirmDialogRef.value?.close();
  }

  function spawnSadFaces(): void {
    for (let i = 0; i < SAD_FACE_COUNT; i++) {
      const spawnId = setTimeout(() => {
        faceTimeouts.delete(spawnId);
        const face: SadFace = {
          id: nextFaceId++,
          emoji: SAD_FACES[Math.floor(Math.random() * SAD_FACES.length)],
          x: 2 + Math.random() * 82,
          y: 2 + Math.random() * 80,
          rotation: -12 + Math.random() * 24,
        };
        sadFaces.value.push(face);

        const removeId = setTimeout(() => {
          faceTimeouts.delete(removeId);
          dismissSadFace(face.id);
        }, SAD_FACE_LIFETIME_MS);
        faceTimeouts.add(removeId);
      }, i * SAD_FACE_STAGGER_MS);
      faceTimeouts.add(spawnId);
    }
  }

  function dismissSadFace(id: number): void {
    sadFaces.value = sadFaces.value.filter((f) => f.id !== id);
  }

  function cleanup(): void {
    cancelConfirm();
    faceTimeouts.forEach(clearTimeout);
    faceTimeouts.clear();
    sadFaces.value = [];
  }

  onScopeDispose(cleanup);

  return {
    confirmDialogRef,
    sadFaces,
    scheduleConfirm,
    cancelConfirm,
    closeConfirm,
    spawnSadFaces,
    dismissSadFace,
  };
}
