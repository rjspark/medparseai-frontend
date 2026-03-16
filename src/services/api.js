import axios from "axios";

// ✅ Uses .env variable if set, otherwise falls back to your live HF Space
const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://rjspark-medparseai-api.hf.space";

/* Attach JWT automatically to every request */
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("medparse_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* Auto logout if token expired (401 response) */
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("medparse_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

/* Auth APIs */
export const authAPI = {
  login: (email, password) =>
    axios.post(`${BASE_URL}/api/login`, { email, password }),

  register: (email, password, name) =>
    axios.post(`${BASE_URL}/api/register`, { email, password, name }),
};

/* Report APIs */
export const reportsAPI = {
  parse: (formData) =>
    axios.post(`${BASE_URL}/api/parse`, formData),

  getAll: () =>
    axios.get(`${BASE_URL}/api/reports`),
};
