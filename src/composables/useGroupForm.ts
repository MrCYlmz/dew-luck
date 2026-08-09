import { reactive, watch } from 'vue';
import type { Person } from '../types';
import { generateId } from '../utils/id';

export interface GroupFormState {
  name: string;
  respectEarlySelection: boolean;
  isWeightedSelection: boolean;
  people: Person[];
}

export function useGroupForm() {
  const form = reactive<GroupFormState>({
    name: '',
    respectEarlySelection: false,
    isWeightedSelection: false,
    people: [],
  });

  watch(
    () => form.isWeightedSelection,
    (val) => {
      if (!val) {
        form.people.forEach((p) => (p.weight = 1));
      }
    }
  );

  function addPerson() {
    form.people.push({ id: generateId(), name: '', weight: 1, isSelected: false });
  }

  function removePerson(idx: number) {
    form.people.splice(idx, 1);
  }

  function resetForm() {
    form.name = '';
    form.respectEarlySelection = false;
    form.isWeightedSelection = false;
    form.people = [];
  }

  function loadFromPeople(
    name: string,
    respectEarlySelection: boolean,
    people: Person[],
    opts?: { regenerateIds?: boolean; resetSelection?: boolean }
  ) {
    form.name = name;
    form.respectEarlySelection = respectEarlySelection;
    form.isWeightedSelection = people.some((p) => p.weight !== 1);
    form.people = people.map((p) => ({
      id: opts?.regenerateIds ? generateId() : p.id,
      name: p.name,
      weight: p.weight,
      isSelected: opts?.resetSelection ? false : p.isSelected,
    }));
  }

  return { form, addPerson, removePerson, resetForm, loadFromPeople };
}
