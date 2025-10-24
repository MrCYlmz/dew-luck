import { ref, nextTick, type Ref } from 'vue';
import type { Person, GroupDetails } from '../types';
import { selectPerson } from '../requests/requests';


export function useSelectionDialog(
  selectedPerson: Ref<Person | undefined>,
  availablePeople: Ref<Person[]>,
  resetAnimation: () => void,
  spinWheel: () => Promise<void>,
  onUpdated: () => void
) {
  const dialogRef = ref<HTMLDialogElement>();

  async function openDialog(): Promise<void> {
    await nextTick();
    dialogRef.value?.showModal();
  }

  function closeDialog(): void {
    dialogRef.value?.close();
    resetAnimation();
  }

  async function handleSelect(group?: GroupDetails): Promise<void> {
    if (!group || !selectedPerson.value) return;
    await selectPerson(group.id, selectedPerson.value.name);
    closeDialog();
    onUpdated();
  }

  function handleAbsent(): void {
    if (!selectedPerson.value) return;
    availablePeople.value = availablePeople.value.filter(
      (p) => p.name !== selectedPerson.value?.name
    );
    closeDialog();
    spinWheel();
  }

  function handleCancel(): void {
    closeDialog();
  }

  return {
    dialogRef,
    openDialog,
    closeDialog,
    handleSelect,
    handleAbsent,
    handleCancel,
  };
}
