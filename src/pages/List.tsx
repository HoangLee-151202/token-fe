import { useState, useEffect } from "react";
import { Button, Input, Space, Table, notification } from "antd";
import Cookies from "js-cookie";
import api from "../axios";
import { useNavigate } from "react-router-dom";

interface IEmployee {
  id: number;
  address: string;
  email: string;
  fullName: string;
  year: string;
}

interface IEmployees {
  status: string;
  message: string;
  data: IEmployee[];
}

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Name",
    dataIndex: "fullName",
    key: "fullName",
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
  },
  {
    title: "Year",
    dataIndex: "year",
    key: "year",
  },
];

const List: React.FC<any> = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<IEmployees>();
  const [email, setEmail] = useState<string>(
    Cookies.get("blameo-hrm-auth") ?? ""
  );

  // API lấy danh sách
  const fetchData = async () => {
    try {
      const response = await api.get(`/employees/`);
      // Nếu thành công set vào state
      setData(response.data);
      return response.data;
    } catch (error) {
      throw new Error("Login failed");
    }
  };

  // API update thông tin người dùng
  const updateUser = async () => {
    try {
      const response = await api.post(`/auth/changeEmail`, email);
      // Nếu thành công thông báo cập nhật thành công
      notification.success({
        message: "Cập nhật thành công",
        description: "Cập nhật thông tin người dùng thành công",
      });

      return response.data;
    } catch (error) {
      throw new Error("Login failed");
    }
  };

  useEffect(() => {
    // Lần đầu vào gọi API lấy data
    fetchData();
  }, []);

  const handleSubmit = () => {
    updateUser();
  };

  // Xử lý logout
  const handleLogout = () => {
    Cookies.remove("blameo-hrm-token");
    Cookies.remove("blameo-hrm-rf-token");
    Cookies.remove("blameo-hrm-auth");
    navigate("/login");
  };

  return (
    <>
      {/* Input email */}
      <Space.Compact style={{ width: "100%", marginBottom: "10px" }}>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="primary" onClick={() => handleSubmit()}>
          Submit
        </Button>
      </Space.Compact>
      {/* Bảng dữ liệu */}
      <Table dataSource={data?.data} columns={columns} />
      {/* Rút tải lại */}
      <Button type="link" danger onClick={() => fetchData()}>
        Reload
      </Button>
      {/* Rút logout */}
      <Button type="link" danger onClick={() => handleLogout()}>
        Logout
      </Button>
    </>
  );
};

export default List;
