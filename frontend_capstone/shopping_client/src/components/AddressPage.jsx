import React, { useState } from "react";
import { Drawer, Form, Input, Button, Radio, message } from "antd";
import productApi from "../components/api/product/product"; 

const AddAddressForm = ({ visible, onClose, onSuccess, token }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await productApi.AddAddress(values, token); 

      if (res?.status_code === 0) {
        message.success("Address saved successfully");
        form.resetFields();
        onSuccess(); 
      } else {
        message.error(res?.error || "Failed to save address");
      }
    } catch (err) {
      console.error("Add address error:", err);
      message.error("Something went wrong while saving address");
    }
    setLoading(false);
  };

  return (
    <Drawer
      title="Add Delivery Address"
      placement="right"
      width={400}
      onClose={onClose}
      open={visible}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          address_type: "HOME",
        }}
      >
        <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
          <Input placeholder="Enter full name" />
        </Form.Item>

        <Form.Item
          name="mobile"
          label="Mobile Number"
          rules={[
            { required: true },
            {
              pattern: /^[0-9]{10}$/,
              message: "Must be 10-digit mobile number",
            },
          ]}
        >
          <Input placeholder="Enter mobile number" />
        </Form.Item>

        <Form.Item
          name="address1"
          label="Address Line 1"
          rules={[{ required: true }]}
        >
          <Input placeholder="Street, Apartment, etc." />
        </Form.Item>

        <Form.Item name="address2" label="Address Line 2">
          <Input placeholder="Landmark or nearby area" />
        </Form.Item>

        <Form.Item name="city" label="City" rules={[{ required: true }]}>
          <Input placeholder="Enter city" />
        </Form.Item>

        <Form.Item name="state" label="State" rules={[{ required: true }]}>
          <Input placeholder="Enter state" />
        </Form.Item>

        <Form.Item
          name="pincode"
          label="Pincode"
          rules={[
            { required: true, message: "Please enter a valid 6-digit pincode" },
            { pattern: /^[0-9]{6}$/, message: "Must be exactly 6 digits" },
          ]}
        >
          <Input placeholder="6-digit PIN" />
        </Form.Item>

        <Form.Item
          name="address_type"
          label="Address Type"
          rules={[{ required: true }]}
        >
          <Radio.Group>
            <Radio value="HOME">Home</Radio>
            <Radio value="WORK">Work</Radio>
            <Radio value="OTHER">Other</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Save Address
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AddAddressForm;
