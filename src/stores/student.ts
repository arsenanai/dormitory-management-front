import { defineStore } from "pinia";
import { LOCAL_STORAGE_SELECTED_STUDENT_KEY } from "@/Const";

export const useStudentStore = defineStore("studentStore", {
  state: () => ({
    selectedStudent: null,
  }),
  actions: {
    setSelectedStudent(student) {
      this.selectedStudent = JSON.parse(JSON.stringify(student));
      localStorage.setItem(LOCAL_STORAGE_SELECTED_STUDENT_KEY, JSON.stringify(this.selectedStudent));
    },
    restoreSelectedStudent() {
      const saved = localStorage.getItem(LOCAL_STORAGE_SELECTED_STUDENT_KEY);
      if (saved) {
        this.selectedStudent = JSON.parse(saved);
      }
    },
    clearSelectedStudent() {
      this.selectedStudent = null;
      localStorage.removeItem(LOCAL_STORAGE_SELECTED_STUDENT_KEY);
    },
  },
});