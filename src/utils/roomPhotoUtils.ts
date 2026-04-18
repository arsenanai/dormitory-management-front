// Extracted testable utility functions for room photo functionality

interface RoomOption {
  room_type?: {
    semester_rate?: string | number;
  };
  id: number;
  number: string;
}

interface BedOption {
  id: number;
  bed_number: string | number;
}

export const formatRoomOption = (room: RoomOption, currencySymbol: string) => {
  const priceValue = room.room_type?.semester_rate;
  let priceString = "";
  if (priceValue != null) {
    priceString = ` - ${Math.round(parseFloat(String(priceValue)))} ${currencySymbol}`;
  }
  return { value: room.id, name: `${room.number}${priceString}` };
};

export const formatBedOption = (bed: BedOption, roomNumber: string) => {
  return { value: bed.id, name: `${roomNumber}-${bed.bed_number}` };
};

export const getSelectedRoomType = (availableRooms: RoomOption[], roomId: number) => {
  const room = availableRooms.find((r) => r.id === roomId);
  return room?.room_type;
};
