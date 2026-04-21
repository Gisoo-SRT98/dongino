import pb from "../lib/pocketbase";
import {
  addGroup as addLocalGroup,
  deleteGroup as deleteLocalGroup,
  loadGroups,
  saveGroups,
} from "../utils/groupsStorage";
import {
  addExpense as addLocalExpense,
  deleteExpensesByGroupId,
  loadMyExpenses,
} from "../utils/expensesStorage";

const LOCAL_USER_KEY = "dong_local_user_id_v1";

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

export const getActiveUserId = () => {
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
    // بعضی PocketBase schema ها فیلد createdBy ندارند و فیلتر 400 می‌دهد.
    // در این حالت یک بار بدون filter تلاش می‌کنیم.
    if (error?.status === 400) {
      try {
        const records = await pb.collection("groups").getFullList(50, {
          sort: "-created",
        });
        const remoteGroups = records.map(normalizeGroup);
        const remoteFiltered = remoteGroups.filter(
          (g) => !g?.createdBy || g.createdBy === currentUser.id,
        );
        const merged = [...localGroups];
        for (const group of remoteFiltered) {
          if (!merged.some((item) => item.id === group.id)) merged.push(group);
        }
        return merged;
      } catch (error2) {
        console.warn(
          "PocketBase getGroups retry failed, falling back to local groups",
          error2,
        );
        return localGroups;
      }
    }
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
      const res = await pb.collection("groups").delete(id);
      deleteExpensesByGroupId(id);
      return res;
    } catch (error) {
      console.warn(
        "PocketBase deleteGroup failed, falling back to local storage",
        error,
      );
    }
  }
  const res = deleteLocalGroup(id);
  deleteExpensesByGroupId(id);
  return res;
};

export const getUsers = async () => {
  const records = await pb.collection("users").getFullList(200, {
    sort: "username",
  });
  return records.map((r) => ({
    id: r.id,
    username: r.username || "",
    email: r.email || "",
  }));
};

export const createExpense = async ({
  groupId,
  amount,
  paidBy,
  participants,
  splits,
}) => {
  const normalizedAmount = Number(amount);
  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw new Error("مبلغ وارد شده معتبر نیست.");
  }

  if (!groupId) throw new Error("گروه مشخص نیست.");
  if (!paidBy) throw new Error("پرداخت‌کننده مشخص نیست.");

  const uniqueParticipants = Array.from(new Set((participants || []).filter(Boolean)));
  if (uniqueParticipants.length === 0) throw new Error("حداقل یک نفر باید انتخاب شود.");

  const currentUser = getCurrentUser();
  const createdBy = currentUser?.id || getActiveUserId();
  const now = new Date().toISOString();

  if (currentUser) {
    const basePayload = {
      groupId,
      amount: normalizedAmount,
      paidBy,
      participants: uniqueParticipants,
      createdBy,
      createdAt: now,
    };
    try {
      const payloadWithSplits = splits ? { ...basePayload, splits } : basePayload;
      return await pb.collection("expenses").create(payloadWithSplits);
    } catch (error) {
      // اگر schema فیلد splits را نداشت، یک بار بدون آن تلاش می‌کنیم.
      if (splits && error?.status === 400) {
        try {
          return await pb.collection("expenses").create(basePayload);
        } catch (error2) {
          console.warn(
            "PocketBase createExpense retry failed, falling back to local storage",
            error2,
          );
        }
      }
      console.warn(
        "PocketBase createExpense failed, falling back to local storage",
        error,
      );
    }
  }

  const expense = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `local-expense-${Date.now()}`,
    groupId,
    amount: normalizedAmount,
    paidBy,
    participants: uniqueParticipants,
    splits: splits ?? null,
    createdBy,
    createdAt: now,
  };
  addLocalExpense(expense);
  return expense;
};

const normalizeExpense = (r) => ({
  id: r.id,
  groupId: r.groupId || r.group || null,
  amount: Number(r.amount) || 0,
  paidBy: r.paidBy || null,
  participants: Array.isArray(r.participants) ? r.participants : [],
  splits: r.splits ?? null,
  createdAt: r.createdAt || r.created || null,
  createdBy: r.createdBy || r.ownerId || null,
});

export const getExpenses = async ({ groupId } = {}) => {
  const currentUser = getCurrentUser();
  const userId = getActiveUserId();
  const localExpenses = loadMyExpenses(userId);

  const localFiltered = groupId
    ? localExpenses.filter((e) => e?.groupId === groupId)
    : localExpenses;

  if (!currentUser) {
    return localFiltered.map(normalizeExpense);
  }

  try {
    const filterParts = [`createdBy = "${currentUser.id}"`];
    if (groupId) filterParts.push(`groupId = "${groupId}"`);
    const filter = filterParts.join(" && ");

    const records = await pb.collection("expenses").getFullList(500, {
      sort: "-created",
      filter,
    });
    const remoteExpenses = records.map(normalizeExpense);
    const merged = [...localFiltered];
    for (const ex of remoteExpenses) {
      if (!merged.some((item) => item.id === ex.id)) merged.push(ex);
    }
    return merged;
  } catch (error) {
    // اگر schema فیلد createdBy یا groupId نداشت، فیلتر 400 می‌دهد؛ یک بار بدون filter تلاش می‌کنیم.
    if (error?.status === 400) {
      try {
        const records = await pb.collection("expenses").getFullList(500, {
          sort: "-created",
        });
        let remoteExpenses = records.map(normalizeExpense);
        remoteExpenses = remoteExpenses.filter(
          (e) => !e?.createdBy || e.createdBy === currentUser.id,
        );
        if (groupId) {
          remoteExpenses = remoteExpenses.filter((e) => e?.groupId === groupId);
        }

        const merged = [...localFiltered];
        for (const ex of remoteExpenses) {
          if (!merged.some((item) => item.id === ex.id)) merged.push(ex);
        }
        return merged;
      } catch (error2) {
        console.warn(
          "PocketBase getExpenses retry failed, falling back to local storage",
          error2,
        );
        return localFiltered.map(normalizeExpense);
      }
    }
    console.warn(
      "PocketBase getExpenses failed, falling back to local storage",
      error,
    );
    return localFiltered.map(normalizeExpense);
  }
};
