import axios from "axios";

const API_URL = "http://localhost:3000";

export const leaveAllocationsApi = {
  // Get all leave allocations
  getAll: async () => {
    const response = await axios.get(
      `${API_URL}/leave-allocations`
    );

    return response.data;
  },

  // Get allocation by ID
  getById: async (id) => {
    const response = await axios.get(
      `${API_URL}/leave-allocations/${id}`
    );

    return response.data;
  },

  // Get allocations for a specific employee
  getByEmployee: async (employeeId) => {
    const response = await axios.get(
      `${API_URL}/leave-allocations/employee/${employeeId}`
    );

    return response.data;
  },

  // Create leave allocation
  create: async (data) => {
    const response = await axios.post(
      `${API_URL}/leave-allocations`,
      data
    );

    return response.data;
  },

  // Update leave allocation
  update: async (id, data) => {
    const response = await axios.put(
      `${API_URL}/leave-allocations/${id}`,
      data
    );

    return response.data;
  },

  // Delete leave allocation
  delete: async (id) => {
    const response = await axios.delete(
      `${API_URL}/leave-allocations/${id}`
    );

    return response.data;
  },
};