import { ref, computed } from "vue";
import { studentService, guestService } from "@/services/api";
import { useAuthStore } from "@/stores/auth";

// Shared state for user options across components
const studentOptions = ref<Array<{ value: string; name: string }>>([]);
const guestOptions = ref<Array<{ value: string; name: string }>>([]);
const loadingStudents = ref(false);
const loadingGuests = ref(false);

export function useUserOptions() {
  const authStore = useAuthStore();
  const isRestrictedUser = computed(() => {
    const role = authStore.userRole;
    return role === "student" || role === "guest";
  });

  const loadStudents = async (ensureUserId?: number | string): Promise<void> => {
    if (isRestrictedUser.value && !ensureUserId) {
      return;
    }

    if (studentOptions.value.length > 0 && !ensureUserId) {
      return; // Already loaded and no specific user needed
    }

    loadingStudents.value = true;
    try {
      if (studentOptions.value.length === 0) {
        const res = await studentService.listAll();
        const users = res?.data?.data || (Array.isArray(res.data) ? res.data : []);
        studentOptions.value = users
          .filter((u) => u?.id)
          .map((u) => ({
            value: String(u.id),
            name: `${u.name || "Unknown"}${u.email ? ` (${u.email})` : ""}`,
          }));
      }

      // Always check if ensureUserId is in options, even if list was already loaded
      if (ensureUserId) {
        const userIdString = String(ensureUserId);
        if (!studentOptions.value.some((o) => o.value === userIdString)) {
          const res = await studentService.getById(Number(ensureUserId));
          const user = res?.data?.data ?? res?.data;
          if (user?.id) {
            const userName =
              user.name ||
              (user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.first_name || "User");
            const displayName = `${userName}${user.email ? ` (${user.email})` : ""}`;
            studentOptions.value.push({ value: String(user.id), name: displayName });
          }
        }
      }
    } catch (err) {
      console.error("Failed to load students:", err);
      studentOptions.value = [];
    } finally {
      loadingStudents.value = false;
    }
  };

  const loadGuests = async (ensureUserId?: number | string): Promise<void> => {
    if (isRestrictedUser.value && !ensureUserId) {
      return;
    }

    if (guestOptions.value.length > 0 && !ensureUserId) {
      return; // Already loaded and no specific user needed
    }

    loadingGuests.value = true;
    try {
      if (guestOptions.value.length === 0) {
        const res = await guestService.listAll();
        const users = res?.data?.data || (Array.isArray(res.data) ? res.data : []);
        guestOptions.value = users
          .filter((u) => u?.id)
          .map((u) => ({
            value: String(u.id),
            name: `${u.name || u.first_name || "Unknown"}${u.email ? ` (${u.email})` : ""}`,
          }));
      }

      // Always check if ensureUserId is in options, even if list was already loaded
      if (ensureUserId) {
        const userIdString = String(ensureUserId);
        if (!guestOptions.value.some((o) => o.value === userIdString)) {
          const res = await guestService.getById(Number(ensureUserId));
          const user = res?.data?.data ?? res?.data;
          if (user?.id) {
            const userName =
              user.name ||
              (user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.first_name || "User");
            const displayName = `${userName}${user.email ? ` (${user.email})` : ""}`;
            guestOptions.value.push({ value: String(user.id), name: displayName });
          }
        }
      }
    } catch (err) {
      console.error("Failed to load guests:", err);
      guestOptions.value = [];
    } finally {
      loadingGuests.value = false;
    }
  };

  const loadUsers = async (
    userType: "student" | "guest",
    ensureUserId?: number | string
  ): Promise<void> => {
    if (userType === "student") {
      await loadStudents(ensureUserId);
    } else {
      await loadGuests(ensureUserId);
    }
  };

  const getUserOptions = (userType: "student" | "guest") => {
    return userType === "student" ? studentOptions : guestOptions;
  };

  return {
    studentOptions: computed(() => studentOptions.value),
    guestOptions: computed(() => guestOptions.value),
    loadingStudents: computed(() => loadingStudents.value),
    loadingGuests: computed(() => loadingGuests.value),
    loadStudents,
    loadGuests,
    loadUsers,
    getUserOptions,
  };
}
