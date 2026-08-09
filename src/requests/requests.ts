import type { GroupCreateRequest, GroupDetails } from '../types.ts';
import { DEFAULT_SELECTION_STYLE } from '../types.ts';
import { generateId } from '../utils/id.ts';

const STORAGE_KEY = 'dew-luck-groups';

let groupsCache: GroupDetails[] | undefined = undefined;

function getGroupsFromStorage(): GroupDetails[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  let groups: GroupDetails[] = [];
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        groups = parsed;
      } else {
        console.warn('Unexpected dew-luck-groups data in localStorage, ignoring it.');
      }
    } catch (error) {
      console.warn('Corrupted dew-luck-groups data in localStorage, ignoring it.', error);
    }
  }

  let mutated = false;
  for (const group of groups) {
    if (!group.selectionStyle) {
      group.selectionStyle = DEFAULT_SELECTION_STYLE;
      mutated = true;
    }
    if (!Array.isArray(group.people)) {
      group.people = [];
      mutated = true;
    }
    for (const person of group.people) {
      if (!person.id) {
        person.id = generateId();
        mutated = true;
      }
    }
  }
  if (mutated) {
    saveGroupsToStorage(groups);
  }

  return groups;
}

function saveGroupsToStorage(groups: GroupDetails[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}

export function invalidateGroupsCache() {
  groupsCache = undefined;
}

export async function fetchGroups(): Promise<GroupDetails[]> {
  if (groupsCache) {
    return groupsCache;
  }
  const groups = getGroupsFromStorage();
  groupsCache = groups;
  return groups;
}

export async function createGroup(data: GroupCreateRequest) {
  const groups = getGroupsFromStorage();
  const newGroup: GroupDetails = {
    id: data.id || generateId(),
    name: data.name,
    respectEarlySelection: data.respectEarlySelection,
    selectionStyle: data.selectionStyle || DEFAULT_SELECTION_STYLE,
    people: data.people,
  };
  groups.push(newGroup);
  saveGroupsToStorage(groups);
  invalidateGroupsCache();
  return { ok: true };
}

export async function updateGroup(groupId: string, data: GroupDetails) {
  const groups = getGroupsFromStorage();
  const index = groups.findIndex((g) => g.id === groupId);
  if (index !== -1) {
    groups[index] = data;
    saveGroupsToStorage(groups);
    invalidateGroupsCache();
  }
  return { ok: true };
}

export async function deleteGroup(groupId: string) {
  const groups = getGroupsFromStorage();
  const filtered = groups.filter((g) => g.id !== groupId);
  saveGroupsToStorage(filtered);
  invalidateGroupsCache();
  return { ok: true };
}

export async function selectPerson(groupId: string, personId: string) {
  const groups = getGroupsFromStorage();
  const group = groups.find((g) => g.id === groupId);
  if (group) {
    const person = group.people.find((p) => p.id === personId);
    if (person) {
      person.isSelected = true;
      saveGroupsToStorage(groups);
      invalidateGroupsCache();
    }
  }
  return { ok: true };
}

export async function resetSelectionsOfGroup(groupId: string) {
  const groups = getGroupsFromStorage();
  const group = groups.find((g) => g.id === groupId);
  if (group) {
    group.people.forEach((p) => {
      p.isSelected = false;
    });
    saveGroupsToStorage(groups);
    invalidateGroupsCache();
  }
  return { ok: true };
}
