import PocketBase from "pocketbase";
import {
  addGroup as addLocalGroup,
  deleteGroup as deleteLocalGroup,
  loadGroups,
  saveGroups,
} from "../utils/groupsStorage";

// آدرس سرور PocketBase خود را اینجا وارد کنید.
// اگر سرور لوکال است:
// const POCKETBASE_URL = "http://127.0.0.1:8090";
// اگر سرور روی دامنه/هاست دیگری است، آن را تغییر دهید.
const POCKETBASE_URL = "http://127.0.0.1:8090";

const LOCAL_USER_KEY = "dong_local_user_id_v1";
const pb = new PocketBase(POCKETBASE_URL);

export default pb;
export const authStore = pb.authStore;

export const signIn = async (identity, password) => {
  return await pb.collection("users").authWithPassword(identity, password);
};

export const signUp = async (data) => {
  return await pb.collection("users").create(data);
};

export const signOut = () => {
  pb.authStore.clear();
};

export const getCurrentUser = () => pb.authStore.model || null;

const getLocalUserId = () => {
  try {
    let localUserId = localStorage.getItem(LOCAL_USER_KEY);
    if (!localUserId) {
      localUserId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `local-user-${Date.now()}`;
      localStorage.setItem(LOCAL_USER_KEY, localUserId);
    }
    return localUserId;
  } catch (error) {
    return `local-user-${Date.now()}`;
  }
};

const getActiveUserId = () => {
  const currentUser = getCurrentUser();
  return currentUser?.id || getLocalUserId();
};

const normalizeGroup = (record) => ({
  id: record.id,
  name: record.name || "",
  cost: record.cost ?? 0,
  members: Array.isArray(record?.members) ? record.members : [],
  memberDebts: Array.isArray(record?.memberDebts) ? record.memberDebts : [],
  splitEqual: record?.splitEqual ?? undefined,
  createdAt: record?.createdAt || new Date().toISOString(),
  createdBy: record?.createdBy || record?.ownerId || record?.createdBy || null,
});

const loadMyLocalGroups = (userId) => {
  return loadGroups().filter((group) => group.createdBy === userId);
};

export const getGroups = async () => {
  const currentUser = getCurrentUser();
  const userId = getActiveUserId();
  const localGroups = loadMyLocalGroups(userId);

  if (!currentUser) {
    return localGroups;
  }

  try {
    const records = await pb.collection("groups").getFullList(50, {
      filter: `createdBy = "${currentUser.id}"`,
      sort: "-created",
    });
    const remoteGroups = records.map(normalizeGroup);
    const merged = [...localGroups];
    for (const group of remoteGroups) {
      if (!merged.some((item) => item.id === group.id)) {
        merged.push(group);
      }
    }
    return merged;
  } catch (error) {
    console.warn(
      "PocketBase getGroups failed, falling back to local groups",
      error,
    );
    return localGroups;
  }
};

export const getGroup = async (id) => {
  try {
    const record = await pb.collection("groups").getOne(id);
    return normalizeGroup(record);
  } catch (error) {
    const groups = loadGroups();
    return groups.find((group) => group.id === id) || null;
  }
};

const createLocalFallbackGroup = (data) => {
  const group = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `local-${Date.now()}`,
    name: data.name || "",
    cost: Number(data.cost) || 0,
    members: Array.isArray(data.members) ? data.members : [],
    memberDebts: Array.isArray(data.memberDebts) ? data.memberDebts : [],
    splitEqual: data.splitEqual ?? true,
    createdAt: new Date().toISOString(),
    createdBy: getActiveUserId(),
  };
  addLocalGroup(group);
  return group;
};

export const createGroup = async (data) => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    try {
      const record = await pb.collection("groups").create(data);
      return normalizeGroup(record);
    } catch (error) {
      console.warn(
        "PocketBase createGroup failed, falling back to local storage",
        error,
      );
      return createLocalFallbackGroup(data);
    }
  }
  return createLocalFallbackGroup(data);
};

export const updateGroup = async (id, data) => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    try {
      const record = await pb.collection("groups").update(id, data);
      return normalizeGroup(record);
    } catch (error) {
      console.warn(
        "PocketBase updateGroup failed, falling back to local storage",
        error,
      );
    }
  }

  const groups = loadGroups();
  const next = groups.map((item) =>
    item?.id === id
      ? { ...item, ...data, createdBy: item.createdBy || getActiveUserId() }
      : item,
  );
  saveGroups(next);
  return next.find((item) => item.id === id) || null;
};

export const deleteGroup = async (id) => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    try {
      return await pb.collection("groups").delete(id);
    } catch (error) {
      console.warn(
        "PocketBase deleteGroup failed, falling back to local storage",
        error,
      );
    }
  }
  return deleteLocalGroup(id);
};
