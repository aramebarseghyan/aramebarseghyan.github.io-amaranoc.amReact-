import { create } from "zustand";

export const userCardStore = create((set) => ({
  count: 0,
  increment: () =>
    set((state) => ({
      count: state.count + 1,
    })),

  decrement: () =>
    set((state) => ({
      count: state.count > 0 ? state.count - 1 : 0,
    })),
}));
