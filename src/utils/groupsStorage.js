const STORAGE_KEY = "dong_groups_v1";

export function loadGroups() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGroups(groups) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}

export function addGroup(group) {
  const groups = loadGroups();
  const next = [group, ...groups];
  saveGroups(next);
  return next;
}

export function deleteGroup(groupId) {
  const groups = loadGroups();
  const next = groups.filter((g) => g?.id !== groupId);
  saveGroups(next);
  return next;
}

