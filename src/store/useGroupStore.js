import { create } from "zustand";

const useGroupStore = create((set) => ({
  groupId: "",
  groupName: "",
  cost: "",
  members: [],
  splitEqual: undefined,
  memberDebts: [],

  setGroupId: (id) => set({ groupId: id }),
  setGroupName: (name) => set({ groupName: name }),
  setCost: (expensGroup) => set({ cost: expensGroup }),
  setMembers: (members) => set({ members }),
  setSplitEqual: (splitEqual) => set({ splitEqual }),
  setMemberDebts: (memberDebts) => set({ memberDebts }),
  addMember: () =>
    set((state) => ({
      members: [...state.members, ""],
      memberDebts:
        state.splitEqual === false
          ? [...state.memberDebts, ""]
          : state.memberDebts,
    })),
  removeMember: (index) =>
    set((state) => ({
      members: state.members.filter((_, i) => i !== index),
      memberDebts: state.memberDebts.filter((_, i) => i !== index),
    })),
  updateMember: (index, value) =>
    set((state) => {
      const next = [...state.members];
      next[index] = value;
      return { members: next };
    }),
  updateMemberDebt: (index, value) =>
    set((state) => {
      const next = [...state.memberDebts];
      next[index] = value;
      return { memberDebts: next };
    }),

  resetGroup: () =>
    set({
      groupId: "",
      groupName: "",
      cost: "",
      members: [],
      splitEqual: undefined,
      memberDebts: [],
    }),
}));

export default useGroupStore;
