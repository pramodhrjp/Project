import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URL}`,
  withCredentials: true,
  timeout: 5000,
  headers: {"Content-Type":"application/json;charset=utf-8"}
})