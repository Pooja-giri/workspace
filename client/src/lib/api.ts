import axios from "axios";

const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl) {
    return "http://localhost:5000/api";
  }
  // Trim trailing slashes
  return envUrl.replace(/\/+$/, "");
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("worksphere_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("worksphere_token");
      }
    }

    return Promise.reject(error);
  }
);

export default api;