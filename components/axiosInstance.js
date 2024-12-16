import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const instance = axios.create({
  baseURL: "https://yourapi.com",
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!refreshToken) {
        // No refresh token available
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          "https://nhts6foy5k.execute-api.me-south-1.amazonaws.com/dev/refresh-token",
          {
            refreshToken,
          }
        );
        const { token, refreshToken: newRefreshToken } = response.data;

        // Update stored tokens
        await AsyncStorage.setItem("authToken", token);
        await AsyncStorage.setItem("refreshToken", newRefreshToken);

        // Update authorization header and retry original request
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
