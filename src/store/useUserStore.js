import { create } from "zustand";

export const useUserStore = create((set) => ({
  userName: localStorage.getItem("registeredName") || "",
  setUserName: (name) => {
    localStorage.setItem("registeredName", name);
    set({ userName: name });
  },
  logout: () => {
    localStorage.removeItem("registeredName");
    set({ userName: "" });
  },
}));
