import axios from "axios";

const API_URL = "http://localhost:3000";

export const holidayListsApi = {
  getAllLists: async () => {
    const response = await axios.get(
      `${API_URL}/holiday-lists`
    );

    return response.data.data ?? response.data;
  },

  createList: async (data) => {
    const response = await axios.post(
      `${API_URL}/holiday-lists`,
      data
    );

    return response.data.data ?? response.data;
  },

  getHolidays: async (listId) => {
    const response = await axios.get(
      `${API_URL}/holiday-lists/${listId}/holidays`
    );

    return response.data.data ?? response.data;
  },

  addHoliday: async (listId, data) => {
    const response = await axios.post(
      `${API_URL}/holiday-lists/${listId}/holidays`,
      data
    );

    return response.data.data ?? response.data;
  },

  deleteHoliday: async (listId, holidayId) => {
    const response = await axios.delete(
      `${API_URL}/holiday-lists/${listId}/holidays/${holidayId}`
    );

    return response.data.data ?? response.data;
  },
};