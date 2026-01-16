// Extracted testable utility functions for room photo functionality

export const formatRoomOption = (room: any, currencySymbol: string) => {
  const priceValue = room.room_type?.semester_rate;
  let priceString = "";
  if (priceValue != null) {
    priceString = ` - ${Math.round(parseFloat(priceValue))} ${currencySymbol}`;
  }
  return { value: room.id, name: `${room.number}${priceString}` };
};

export const formatBedOption = (bed: any, roomNumber: string) => {
  return { value: bed.id, name: `${roomNumber}-${bed.bed_number}` };
};

export const getSelectedRoomType = (availableRooms: any[], roomId: number) => {
  const room = availableRooms.find((r) => r.id === roomId);
  return room?.room_type;
};
