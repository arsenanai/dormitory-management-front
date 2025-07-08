import { defineStore } from "pinia";
import { LOCAL_STORAGE_SELECTED_ROOM_TYPE_KEY } from "@/Const";

interface RoomType {
  id: number;
  name: string;
  dormitory_id?: number;
  bed_count?: number;
  [key: string]: any;
}

export const useRoomTypesStore = defineStore("roomTypesStore", {
  state: () => ({
    roomTypes: [] as RoomType[],
    selectedRoomType: null as RoomType | null,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    setSelectedRoomType(roomType: RoomType) {
      this.selectedRoomType = JSON.parse(JSON.stringify(roomType));
      localStorage.setItem(LOCAL_STORAGE_SELECTED_ROOM_TYPE_KEY, JSON.stringify(this.selectedRoomType));
    },
    restoreSelectedRoomType() {
      const saved = localStorage.getItem(LOCAL_STORAGE_SELECTED_ROOM_TYPE_KEY);
      if (saved) {
        this.selectedRoomType = JSON.parse(saved);
      }
    },
    clearSelectedRoomType() {
      this.selectedRoomType = null;
      localStorage.removeItem(LOCAL_STORAGE_SELECTED_ROOM_TYPE_KEY);
    },
    setRoomTypes(roomTypes: RoomType[]) {
      this.roomTypes = roomTypes;
    },
    setLoading(loading: boolean) {
      this.loading = loading;
    },
    setError(error: string | null) {
      this.error = error;
    },
  },
  getters: {
    getRoomTypeById: (state) => (id: number) => {
      return state.roomTypes.find((roomType: RoomType) => roomType.id === id);
    },
  },
});
