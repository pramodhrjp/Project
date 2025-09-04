import { axiosInstance } from "../../utils/apiClient";

const UserApi = {
  login: "/api/v1/user/login",
  me: "/api/v1/user/me",
  register: "/api/v1/user/register",
};

const UserLogin = async (email_id, password) => {
  try {
    const response = await axiosInstance.post(`${UserApi.login}`, {
      email_id,
      password,
    });

    if (!response) {
      throw new Error("Failed to login");
    }
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const Me = async (token) => {
  try {
    const response = await axiosInstance.get(`${UserApi.me}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response) {
      throw new Error("Failed to get token");
    }
    return response;
  } catch (error) {
    console.log(error);
  }
};

const Register = async (name, email, password, mobile) => {
  try {
    const response = await axiosInstance.post(`${UserApi.register}`, {
      name,
      email,
      password,
      mobile,
    });
    return response.data;
  } catch (error) {}
};

export default { UserLogin, Me, Register };
