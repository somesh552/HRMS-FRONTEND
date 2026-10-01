import axios from "axios";

const API_URL = "http://localhost:3000";

export const leavePeriodsApi = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/leave-periods`);
    return response.data.data ?? response.data;
  },

  getById: async (id) => {
    const response = await axios.get(
      `${API_URL}/leave-periods/${id}`
    );

    return response.data.data ?? response.data;
  },

  create: async (data) => {
    const response = await axios.post(
      `${API_URL}/leave-periods`,
      data
    );

    return response.data.data ?? response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(
      `${API_URL}/leave-periods/${id}`,
      data
    );

    return response.data.data ?? response.data;
  },
};