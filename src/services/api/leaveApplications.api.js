import axios from "axios";

const API_URL = "http://localhost:3000";

export const leaveApplicationsApi = {
  getAll: async () => {
    const response = await axios.get(
      `${API_URL}/leave-applications`
    );

    return response.data.data ?? response.data;
  },

  getById: async (id) => {
    const response = await axios.get(
      `${API_URL}/leave-applications/${id}`
    );

    return response.data.data ?? response.data;
  },

  create: async (data) => {
    const response = await axios.post(
      `${API_URL}/leave-applications`,
      data
    );

    return response.data;
  },

  approve: async (id, hrApprovedBy) => {
    const response = await axios.put(
      `${API_URL}/leave-applications/${id}/approve`,
      {
        hr_approved_by: Number(hrApprovedBy),
      }
    );

    return response.data;
  },

  reject: async (id, hrRejectedBy) => {
    const response = await axios.put(
      `${API_URL}/leave-applications/${id}/reject`,
      {
        hr_rejected_by: Number(hrRejectedBy),
      }
    );

    return response.data;
  },

  cancel: async (id) => {
    const response = await axios.put(
      `${API_URL}/leave-applications/${id}/cancel`
    );

    return response.data;
  },
};