import type {GroupCreateRequest, GroupDetails} from "../types.ts";

const API_BASE_URL = 'http://localhost:3000';

let groupsCache: GroupDetails[] | undefined = undefined;
export function invalidateGroupsCache() {
    groupsCache = undefined;
}
export async function fetchGroups(): Promise<GroupDetails[]> {
    if (groupsCache) {
        return groupsCache;
    }
    const response = await fetch(`${API_BASE_URL}/groups`);
    const data = await response.json();
    groupsCache = data;
    return data;
}

export async function createGroup(data: GroupCreateRequest) {
    return await fetch(`${API_BASE_URL}/groups`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    });
}

export async function updateGroup(groupId: string, data: GroupDetails) {
    return await fetch(`${API_BASE_URL}/groups/${groupId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    });
}

export async function deleteGroup(groupId: string) {
    return await fetch(`${API_BASE_URL}/groups/${groupId}`, {
        method: 'DELETE',
    });
}

export async function selectPerson(groupId: string, personName: string) {
    return await fetch(`${API_BASE_URL}/groups/${groupId}/persons/${personName}/selected`, {
        method: 'PUT',
    });
}

export async function resetSelectionsOfGroup(groupId: string) {
    return await fetch(`${API_BASE_URL}/groups/${groupId}/reset-selections`, {
        method: 'PUT',
    });
}
