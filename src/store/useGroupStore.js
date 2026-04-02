import { create } from "zustand";

const useGroupStore = create((set) => ({
  groupId: "",
  groupName: "",
  cost: "",
  members: [],

  setGroupId: (id) => set({ groupId: id }),
  setGroupName: (name) => set({ groupName: name }),
  setCost: (expensGroup) => set({ cost: expensGroup }),
  setMembers: (members) => set({ members }),

  addMember: () => set((state) => ({ members: [...state.members, ""] })),
  removeMember: (index) =>
    set((state) => ({ members: state.members.filter((_, i) => i !== index) })),
  updateMember: (index, value) =>
    set((state) => {
      const next = [...state.members];
      next[index] = value;
      return { members: next };
    }),

  resetGroup: () => set({ groupId: "", groupName: "", cost: "", members: [] }),
}));

export default useGroupStore;
