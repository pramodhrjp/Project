import React, { useState } from "react";
import { Alert, Button, Checkbox, Form, Input } from "antd";
import userApi from "../components/api/user/user";
import { Link, useNavigate } from "react-router-dom";

const validateMessages = {
  required: "${label} is required!",
  types: {
    email: "Please enter a valid ${label}!",
    number: "${label} is not a valid number!",
  },
};

const LoginPage = ({ setToken }) => {
  const [alert, setAlert] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (values) => {
    try {
      const response = await userApi.UserLogin(values.email, values.password);


      if (response?.status_code === 0) {
        const token = response.data.access_token;
        localStorage.setItem("token", token);
        setToken(token);
        setAlert("success");
        setAlertMessage(response.data.message || "Login successful!");
        navigate("/"); 
      } else {
        setAlert("error");
        setAlertMessage(response.data.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login error", error);
      setAlert("error");
      setAlertMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      <div
        style={{
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          backgroundColor: "#ffffff",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h2>

        {alert && (
          <Alert
            message={alertMessage}
            type={alert}
            showIcon
            style={{ marginBottom: "20px" }}
          />
        )}

        <Form
          validateMessages={validateMessages}
          name="basic"
          layout="vertical"
          initialValues={{ remember: true }}
          autoComplete="off"
          onFinish={handleLogin}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{ marginBottom: 10 }}
            >
              Submit
            </Button>
            or Don't have an account? <Link to="/signup">Sign up now</Link>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
