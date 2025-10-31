import api from './api';

export const bedService = {
  /**
   * Update a specific bed.
   * @param id The ID of the bed to update.
   * @param data The data to update for the bed.
   * @returns The API response.
   */
  update(id: number, data: any) {
    return api.put(`/beds/${id}`, data);
  },

  /**
   * Get a specific bed by its ID.
   * @param id The ID of the bed.
   * @returns The API response.
   */
  getById(id: number) {
    return api.get(`/beds/${id}`);
  },
};