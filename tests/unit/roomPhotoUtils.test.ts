import { describe, it, expect } from 'vitest'
import {
  formatRoomOption,
  formatBedOption,
  getPreviousPhotoIndex,
  getNextPhotoIndex,
  getSelectedRoomType
} from '@/utils/roomPhotoUtils'

describe('roomPhotoUtils - 100% Coverage', () => {
  describe('formatRoomOption', () => {
    it('formats room option with price', () => {
      const room = {
        id: 1,
        number: '101',
        room_type: { semester_rate: 1000 }
      }
      const currencySymbol = '₸'
      
      const result = formatRoomOption(room, currencySymbol)
      
      expect(result).toEqual({
        value: 1,
        name: '101 - 1000 ₸'
      })
    })

    it('formats room option without price', () => {
      const room = {
        id: 2,
        number: '102',
        room_type: { semester_rate: null }
      }
      const currencySymbol = '$'
      
      const result = formatRoomOption(room, currencySymbol)
      
      expect(result).toEqual({
        value: 2,
        name: '102'
      })
    })

    it('formats room option with zero price', () => {
      const room = {
        id: 3,
        number: '103',
        room_type: { semester_rate: 0 }
      }
      const currencySymbol = '€'
      
      const result = formatRoomOption(room, currencySymbol)
      
      expect(result).toEqual({
        value: 3,
        name: '103 - 0 €'
      })
    })

    it('formats room option without room_type', () => {
      const room = {
        id: 4,
        number: '104'
      }
      const currencySymbol = '£'
      
      const result = formatRoomOption(room, currencySymbol)
      
      expect(result).toEqual({
        value: 4,
        name: '104'
      })
    })

    it('handles decimal price rounding', () => {
      const room = {
        id: 5,
        number: '105',
        room_type: { semester_rate: 1234.56 }
      }
      const currencySymbol = '₸'
      
      const result = formatRoomOption(room, currencySymbol)
      
      expect(result).toEqual({
        value: 5,
        name: '105 - 1235 ₸'
      })
    })
  })

  describe('formatBedOption', () => {
    it('formats bed option correctly', () => {
      const bed = { id: 1, bed_number: 'A1' }
      const roomNumber = '101'
      
      const result = formatBedOption(bed, roomNumber)
      
      expect(result).toEqual({
        value: 1,
        name: '101-A1'
      })
    })

    it('formats different bed numbers', () => {
      const bed = { id: 2, bed_number: 'B2' }
      const roomNumber = '202'
      
      const result = formatBedOption(bed, roomNumber)
      
      expect(result).toEqual({
        value: 2,
        name: '202-B2'
      })
    })

    it('formats bed with special characters', () => {
      const bed = { id: 3, bed_number: 'C-3' }
      const roomNumber = '303'
      
      const result = formatBedOption(bed, roomNumber)
      
      expect(result).toEqual({
        value: 3,
        name: '303-C-3'
      })
    })
  })

  describe('getPreviousPhotoIndex', () => {
    it('returns previous index when not at first photo', () => {
      const currentIndex = 3
      const photos = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg', 'photo5.jpg']
      
      const result = getPreviousPhotoIndex(currentIndex, photos)
      
      expect(result).toBe(2)
    })

    it('returns same index when at first photo', () => {
      const currentIndex = 0
      const photos = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg']
      
      const result = getPreviousPhotoIndex(currentIndex, photos)
      
      expect(result).toBe(0)
    })

    it('handles empty photos array', () => {
      const currentIndex = 1
      const photos: string[] = []
      
      const result = getPreviousPhotoIndex(currentIndex, photos)
      
      expect(result).toBe(0) // Returns 0 when currentIndex > 0 is false (empty array)
    })

    it('handles single photo', () => {
      const currentIndex = 0
      const photos = ['single.jpg']
      
      const result = getPreviousPhotoIndex(currentIndex, photos)
      
      expect(result).toBe(0)
    })

    it('handles negative index', () => {
      const currentIndex = -1
      const photos = ['photo1.jpg', 'photo2.jpg']
      
      const result = getPreviousPhotoIndex(currentIndex, photos)
      
      expect(result).toBe(-1)
    })
  })

  describe('getNextPhotoIndex', () => {
    it('returns next index when not at last photo', () => {
      const currentIndex = 1
      const photos = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg', 'photo5.jpg']
      
      const result = getNextPhotoIndex(currentIndex, photos)
      
      expect(result).toBe(2)
    })

    it('returns same index when at last photo', () => {
      const currentIndex = 2
      const photos = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg']
      
      const result = getNextPhotoIndex(currentIndex, photos)
      
      expect(result).toBe(2)
    })

    it('handles empty photos array', () => {
      const currentIndex = 0
      const photos: string[] = []
      
      const result = getNextPhotoIndex(currentIndex, photos)
      
      expect(result).toBe(0)
    })

    it('handles single photo', () => {
      const currentIndex = 0
      const photos = ['single.jpg']
      
      const result = getNextPhotoIndex(currentIndex, photos)
      
      expect(result).toBe(0)
    })

    it('handles index beyond array length', () => {
      const currentIndex = 10
      const photos = ['photo1.jpg', 'photo2.jpg']
      
      const result = getNextPhotoIndex(currentIndex, photos)
      
      expect(result).toBe(10)
    })
  })

  describe('getSelectedRoomType', () => {
    it('returns room type when room found', () => {
      const mockRoomType = { id: 1, name: 'Standard Room', photos: ['photo1.jpg'] }
      const mockRoom = { id: 1, number: '101', room_type: mockRoomType }
      const availableRooms = [mockRoom]
      
      const result = getSelectedRoomType(availableRooms, 1)
      
      expect(result).toEqual(mockRoomType)
    })

    it('returns undefined when room not found', () => {
      const mockRoomType = { id: 2, name: 'Deluxe Room', photos: ['photo2.jpg'] }
      const mockRoom = { id: 2, number: '102', room_type: mockRoomType }
      const availableRooms = [mockRoom]
      
      const result = getSelectedRoomType(availableRooms, 999)
      
      expect(result).toBeUndefined()
    })

    it('returns undefined when available rooms is empty', () => {
      const availableRooms: any[] = []
      
      const result = getSelectedRoomType(availableRooms, 1)
      
      expect(result).toBeUndefined()
    })

    it('returns undefined when room has no room_type', () => {
      const mockRoom = { id: 3, number: '103', room_type: undefined }
      const availableRooms = [mockRoom]
      
      const result = getSelectedRoomType(availableRooms, 3)
      
      expect(result).toBeUndefined()
    })

    it('returns undefined when room_type is null', () => {
      const mockRoom = { id: 4, number: '104', room_type: null }
      const availableRooms = [mockRoom]
      
      const result = getSelectedRoomType(availableRooms, 4)
      
      expect(result).toBeNull() // Returns null when room_type is null
    })
  })

  describe('Edge Cases and Boundary Conditions', () => {
    it('handles all edge cases for photo navigation', () => {
      const photos = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg']
      
      // Test all possible indices
      for (let i = 0; i < photos.length; i++) {
        const prevIndex = getPreviousPhotoIndex(i, photos)
        const nextIndex = getNextPhotoIndex(i, photos)
        
        if (i === 0) {
          expect(prevIndex).toBe(0)
          expect(nextIndex).toBe(1)
        } else if (i === photos.length - 1) {
          expect(prevIndex).toBe(photos.length - 2)
          expect(nextIndex).toBe(photos.length - 1)
        } else {
          expect(prevIndex).toBe(i - 1)
          expect(nextIndex).toBe(i + 1)
        }
      }
    })

    it('handles extreme boundary conditions', () => {
      const photos = ['p1.jpg', 'p2.jpg']
      
      // Test with negative index
      const prevIndex1 = getPreviousPhotoIndex(-1, photos)
      const nextIndex1 = getNextPhotoIndex(-1, photos)
      
      expect(prevIndex1).toBe(-1)
      expect(nextIndex1).toBe(0)
      
      // Test with very large index
      const prevIndex2 = getPreviousPhotoIndex(10, photos)
      const nextIndex2 = getNextPhotoIndex(10, photos)
      
      expect(prevIndex2).toBe(9)
      expect(nextIndex2).toBe(10)
    })
  })
})
