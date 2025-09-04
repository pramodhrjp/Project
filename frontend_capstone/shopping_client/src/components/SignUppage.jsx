import React, { useRef, useState } from "react";
import { Alert, Button, Checkbox, Form, Input } from "antd";
import userApi from "../components/api/user/user";
import { Link, useNavigate } from "react-router-dom";

const SignUppage = () => {
  const [alert, setAlert] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [form] = Form.useForm();

  const navigate = useNavigate();

  const debounceTimeoutRef = useRef(null);
  const isSubmittingRef = useRef(false);

  const handleRegister = async (values) => {
    if (values.name.trim().lenght < 3) {
      return ""
    }
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    try {
      const response = await userApi.Register(
        values.name,
        values.email,
        values.password,
        values.mobile
      );
      if (response?.status_code != 0) {
        setAlert("error");
        setAlertMessage(response.data || "Register failed");
      } else {
        setAlert("success");
        setAlertMessage(response.data || "Registered successfully");
        form.resetFields();
        debounceTimeoutRef.current = setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Signup error", error);
      setAlert("error");
      setAlertMessage(
        "Something went wrong while registering. Please try again."
      );
    } finally {

      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 1000);
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
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Register</h2>

        {alert && (
          <Alert
            message={alertMessage}y
            type={alert}
            showIcon
            style={{ marginBottom: "20px" }}
          />
        )}

        <Form
          form={form}
          name="basic"
          layout="vertical"
          initialValues={{ remember: true }}
          autoComplete="off"
          onFinish={handleRegister}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, type: "string" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Please enter a valid email!",
              },
            ]}
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
          <Form.Item
            label="Mobile"
            name="mobile"
            rules={[
              { required: true, message: "Mobile number is required" },
              {
                pattern: /^[6-9]\d{9}$/,
                message: "Enter a valid 10-digit Indian mobile number",
              },
            ]}
          >
            <Input />
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
            or Already have an account? <Link to="/login">Login</Link>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default SignUppage;

