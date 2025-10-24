import type { GroupCreateRequest, GroupDetails } from '../types.ts';

const STORAGE_KEY = 'dew-luck-groups';

let groupsCache: GroupDetails[] | undefined = undefined;

function getGroupsFromStorage(): GroupDetails[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveGroupsToStorage(groups: GroupDetails[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

export async function selectPerson(groupId: string, personName: string) {
  const groups = getGroupsFromStorage();
  const group = groups.find((g) => g.id === groupId);
  if (group) {
    const person = group.people.find((p) => p.name === personName);
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
