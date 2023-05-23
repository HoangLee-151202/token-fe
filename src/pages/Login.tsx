import { useEffect } from "react";
import { Button, Form, Input } from "antd";
import Cookies from "js-cookie";
import api from "../axios";
import { useNavigate } from "react-router-dom";

interface IFormLogin {
  email: string;
  password: string;
}

const refreshCookies = () => {
  if (Cookies.get("blameo-hrm-token")) {
    Cookies.remove("blameo-hrm-token");
  }
  if (Cookies.get("blameo-hrm-rf-token")) {
    Cookies.remove("blameo-hrm-rf-token");
  }
  if (Cookies.get("blameo-hrm-auth")) {
    Cookies.remove("blameo-hrm-auth");
  }
};

const Login: React.FC<any> = () => {
  const navigate = useNavigate();
  const login = async (payload: IFormLogin) => {
    // API login
    try {
      const response = await api.post(`/auth/login`, payload);
      // Nếu thành công gán token, refreshToken, thông tin người dùng vào cookies
      Cookies.set("blameo-hrm-token", response.data.access_token);
      Cookies.set("blameo-hrm-rf-token", response.data.refresh_token);
      Cookies.set("blameo-hrm-auth", response.data.email);
      // Sau đó chuyển vào trang list
      navigate("/list");
    } catch (error) {
      throw new Error("Login failed");
    }
  };

  const onFinish = (values: IFormLogin) => {
    login(values);
  };

  // Nếu vào trang login xóa toàn bộ cookies đã lưu
  useEffect(() => {
    refreshCookies();
  }, []);

  return (
    <Form
      name="basic"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      autoComplete="off"
    >
      {/* Input email */}
      <Form.Item
        label="Email"
        name="email"
        rules={[{ required: true, message: "Please input your username!" }]}
      >
        <Input />
      </Form.Item>
      {/* Input password */}
      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password />
      </Form.Item>
      {/* Nút đăng nhập */}
      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="link" htmlType="submit">
          Login
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Login;
