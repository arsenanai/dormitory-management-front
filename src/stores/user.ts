import { defineStore } from "pinia";
import { LOCAL_STORAGE_SELECTED_ADMIN_USER_KEY } from "@/Const";

export const useUserStore = defineStore("userStore", {
  state: () => ({
    selectedUser: null,
  }),
  actions: {
    setSelectedUser(user) {
      this.selectedUser = JSON.parse(JSON.stringify(user));
      localStorage.setItem(LOCAL_STORAGE_SELECTED_ADMIN_USER_KEY, JSON.stringify(this.selectedUser));
    },
    restoreSelectedUser() {
      const saved = localStorage.getItem(LOCAL_STORAGE_SELECTED_ADMIN_USER_KEY);
      if (saved) {
        this.selectedUser = JSON.parse(saved);
      }
    },
    clearSelectedUser() {
      this.selectedUser = null;
      localStorage.removeItem(LOCAL_STORAGE_SELECTED_ADMIN_USER_KEY);
    },
  },
});