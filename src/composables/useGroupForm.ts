import { reactive, watch } from 'vue';
import type { Person, SelectionStyle } from '../types';
import { DEFAULT_SELECTION_STYLE } from '../types';
import { generateId } from '../utils/id';

export interface GroupFormState {
  name: string;
  respectEarlySelection: boolean;
  selectionStyle: SelectionStyle;
  isWeightedSelection: boolean;
  people: Person[];
}

interface GroupFormSource {
  name: string;
  respectEarlySelection: boolean;
  selectionStyle: SelectionStyle;
  people: Person[];
}

export function useGroupForm() {
  const form = reactive<GroupFormState>({
    name: '',
    respectEarlySelection: false,
    selectionStyle: DEFAULT_SELECTION_STYLE,
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
    form.selectionStyle = DEFAULT_SELECTION_STYLE;
    form.isWeightedSelection = false;
    form.people = [];
  }

  function loadFromGroup(
    source: GroupFormSource,
    opts?: { name?: string; regenerateIds?: boolean; resetSelection?: boolean }
  ) {
    form.name = opts?.name ?? source.name;
    form.respectEarlySelection = source.respectEarlySelection;
    form.selectionStyle = source.selectionStyle ?? DEFAULT_SELECTION_STYLE;
    form.isWeightedSelection = source.people.some((p) => p.weight !== 1);
    form.people = source.people.map((p) => ({
      id: opts?.regenerateIds ? generateId() : p.id,
      name: p.name,
      weight: p.weight,
      isSelected: opts?.resetSelection ? false : p.isSelected,
    }));
  }

  return { form, addPerson, removePerson, resetForm, loadFromGroup };
}
