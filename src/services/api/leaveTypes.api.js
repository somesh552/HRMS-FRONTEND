
import axios from "axios";

const API_URL = "http://localhost:3000";

export const leaveTypesApi = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/leave-types`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await axios.post(
      `${API_URL}/leave-types`,
      data,
    );

    return response.data.data;
  },

  update: async (id, data) => {
    const response = await axios.put(
      `${API_URL}/leave-types/${id}`,
      data,
    );

    return response.data.data;
  },

  delete: async (id) => {
    const response = await axios.delete(
      `${API_URL}/leave-types/${id}`,
    );

    return response.data.data;
  },
};

