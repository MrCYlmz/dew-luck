import type { GroupCreateRequest } from '../types';

const URL_PARAM_KEY = 'shared';

/**
 * Encodes group data into a base64 URL parameter
 */
export function encodeGroupToUrl(group: GroupCreateRequest): string {
  const baseUrl = window.location.origin + window.location.pathname;
  const data = JSON.stringify(group);

  // Convert string to UTF-8 bytes, then to base64
  const uint8array = new TextEncoder().encode(data);
  const binaryString = String.fromCharCode(...uint8array);
  const encoded = btoa(binaryString);

  return `${baseUrl}?${URL_PARAM_KEY}=${encoded}`;
}

/**
 * Decodes group data from URL parameters
 * Returns null if no shared group data is found
 */
export function decodeGroupFromUrl(): GroupCreateRequest | null {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get(URL_PARAM_KEY);

  if (!encoded) {
    return null;
  }

  try {
    // Convert base64 to binary string, then to UTF-8
    const binaryString = atob(encoded);
    const uint8array = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
    const data = new TextDecoder().decode(uint8array);

    const group = JSON.parse(data) as GroupCreateRequest;

    // Validate the group structure
    if (!group.name || !Array.isArray(group.people)) {
      throw new Error('Invalid group structure');
    }

    return group;
  } catch (error) {
    console.error('Failed to decode shared group:', error);
    return null;
  }
}

/**
 * Removes the shared group parameter from the URL
 */
export function clearSharedGroupFromUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete(URL_PARAM_KEY);
  window.history.replaceState({}, '', url.toString());
}
