import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const authService = {
  login: async (credentials) => {
    const response = await axios.post(`${API_URL}/users/login`, credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/users/register`, userData);
    return response.data;
  },
  vendorRequest: async (requestData) => {
    const response = await axios.post(`${API_URL}/users/vendor-request`, requestData);
    return response.data;
  },
};

export default authService;