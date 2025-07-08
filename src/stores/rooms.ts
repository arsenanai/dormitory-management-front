import { defineStore } from "pinia";
import { LOCAL_STORAGE_SELECTED_ROOM_KEY } from "@/Const";

interface Room {
  id: number;
  room_number: string;
  dormitory_id: number;
  [key: string]: any;
}

export const useRoomsStore = defineStore("roomsStore", {
  state: () => ({
    rooms: [] as Room[],
    selectedRoom: null as Room | null,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    setSelectedRoom(room: Room) {
      this.selectedRoom = JSON.parse(JSON.stringify(room));
      localStorage.setItem(LOCAL_STORAGE_SELECTED_ROOM_KEY, JSON.stringify(this.selectedRoom));
    },
    restoreSelectedRoom() {
      const saved = localStorage.getItem(LOCAL_STORAGE_SELECTED_ROOM_KEY);
      if (saved) {
        this.selectedRoom = JSON.parse(saved);
      }
    },
    clearSelectedRoom() {
      this.selectedRoom = null;
      localStorage.removeItem(LOCAL_STORAGE_SELECTED_ROOM_KEY);
    },
    setRooms(rooms: Room[]) {
      this.rooms = rooms;
    },
    setLoading(loading: boolean) {
      this.loading = loading;
    },
    setError(error: string | null) {
      this.error = error;
    },
  },
  getters: {
    getRoomById: (state) => (id: number) => {
      return state.rooms.find((room: Room) => room.id === id);
    },
  },
});
