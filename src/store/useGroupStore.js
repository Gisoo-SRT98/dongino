import { create } from "zustand";

const useGroupStore = create ((set) => ({
    groupName: "",
    setGroupName: (name) => set({ groupName: name }),

    cost: 0,
    setCost: (expensGroup) => set({ cost: expensGroup }),
}));

export default useGroupStore;
