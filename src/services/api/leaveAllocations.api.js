import axios from "axios";

const API_URL = "http://localhost:3000";

export const leaveAllocationsApi = {
  getAll: () => {
    return axios.get(`${API_URL}/leave-allocations`);
  },

  getById: (id) => {
    return axios.get(`${API_URL}/leave-allocations/${id}`);
  },

  getByEmployee: (employeeId) => {
    return axios.get(
      `${API_URL}/leave-allocations/employee/${employeeId}`
    );
  },

  create: (data) => {
    return axios.post(
      `${API_URL}/leave-allocations`,
      data
    );
  },

  update: (id, data) => {
    return axios.put(
      `${API_URL}/leave-allocations/${id}`,
      data
    );
  },
};