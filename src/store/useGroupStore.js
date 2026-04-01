import { create } from "zustand";

const useGroupStore = create ((set) => ({
    groupName: "",
    setGroupName: (name) => set({ groupName: name }),

    cost: "",
    setCost: (expensGroup) => set({ cost: expensGroup }),

    resetGroup: () => set({ groupName: "", cost: "" }),
}));

export default useGroupStore;
