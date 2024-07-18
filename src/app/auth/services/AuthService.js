import axios from "axios";
import jwtDecode from "jwt-decode";

const AuthService = {
  login: async (username, password) => {
    console.log("user:", username, "pass:", password);
    const response = await axios.post(
      "https://server.yerushalmi.online/yerushalmi/login",
      {
        username,
        password,
      }
    );
    const { token } = response.data;
    localStorage.setItem("token", token);
    return response.data;
  },

  register: async (username, password) => {
    const response = await axios.post(
      "https://server.yerushalmi.online/yerushalmi/register",
      {
        username,
        password,
      }
    );
    const { token } = response.data;
    localStorage.setItem("token", token);
    return response.data;
  },

  getToken: () => localStorage.getItem("token"),

  logout: () => localStorage.removeItem("token"),

  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    const { exp } = jwtDecode(token);
    return Date.now() <= exp * 1000;
  },
};

export default AuthService;
