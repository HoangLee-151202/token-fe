import { notification } from "antd";
import axios from "axios";
import Cookies from "js-cookie";

let isRefreshing = false;

// Cấu hình axios
const api = axios.create();

// Cấu hình baseURL
api.defaults.baseURL = import.meta.env.VITE_API_URL;
// Cấu hình interceptors request
api.interceptors.request.use(
  (config: any) => {
    const token = Cookies.get("blameo-hrm-token");
    // Nếu có token gán vào Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error: any) => {
    Promise.reject(error);
  }
);

// Cấu hình interceptors response
api.interceptors.response.use(
  function (response: any) {
    return response;
  },
  async function (error: any) {
    // Lưu lại config api gọi lỗi
    const originalResquest = error.config;

    if (
      error?.response?.status === 401 && // Bắt lỗi 401 - Hết hạn token hoặc RefreshToken không thành công
      !originalResquest._retry && // Gọi api lỗi 401 nếu gọi lại vẫn lỗi 401 thì không gọi lại nữa
      !isRefreshing // Gọi refresh nếu lỗi 401 thì không gọi lại nữa
    ) {
      if (Cookies.get("blameo-hrm-rf-token")) {
        // Nếu có refreshToken trong Cookies thì gọi lại
        isRefreshing = true;
        originalResquest._retry = true;

        // Gọi api refreshToken
        return axios
          .post(
            "/auth/refresh",
            {
              refreshToken: Cookies.get("blameo-hrm-rf-token"),
            },
            originalResquest
          )
          .then(({ data }) => {
            // Nếu thành công gán lại token và refreshToken  và gán lại vào Authorization
            Cookies.set("blameo-hrm-token", data.access_token);
            Cookies.set("blameo-hrm-rf-token", data.refresh_token);
            axios.defaults.headers.common["Authorization"] = data.access_token;
            // Gọi lại api lỗi do hết token lúc trước bằng config đã lưu lại
            return api(originalResquest);
          })
          .catch((err) => {
            // Nếu refreshToken lỗi thông báo và xóa hết Cookies và chuyển sang login
            notification.error({
              message: "Lỗi xảy ra",
              description: err.response.data.message,
            });
            Cookies.remove("blameo-hrm-token");
            Cookies.remove("blameo-hrm-rf-token");
            Cookies.remove("blameo-hrm-auth");
            window.location.pathname = "/login";
          })
          .finally(() => (isRefreshing = false));
      } else {
        // Nếu không có refreshToken trong Cookies thì ra trang đăng nhập
        window.location.pathname = "/login";
      }
    } else if (error.response) {
      // Thông báo lỗi khi call api lỗi
      notification.error({
        message: "Lỗi xảy ra",
        description: error.response.data.message,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
