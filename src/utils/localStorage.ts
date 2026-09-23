import type { EnergyResource } from "../types/resources";

const storageKey = "kraftberedskap_resources";

export function loadLocalResources(): EnergyResource[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalResource(resource: EnergyResource) {
  const resources = loadLocalResources();
  localStorage.setItem(storageKey, JSON.stringify([...resources, resource]));
}

export function replaceLocalResources(resources: EnergyResource[]) {
  localStorage.setItem(storageKey, JSON.stringify(resources));
}
