import React, { useState } from "react";
import { Form, Input, InputNumber, Button, Select, Upload, Flex } from "antd";
import { ConsoleSqlOutlined, PlusOutlined } from "@ant-design/icons";
import productApi from "../components/api/product/product";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;
const { Option } = Select;

const normFile = (e) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const ProductForm = () => {
  const token = localStorage.getItem("token");
  const [form] = Form.useForm();

  const NavigateHome = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const submitForm = async (values) => {
    try {
      const imageDataObj = {};
      values.img.forEach((i) => {
        imageDataObj[i.name] = i;
      });

      const image_array = values.img.map((i) => i.name);

      const payload = {
        ...values,
      };
      payload.img = image_array;
      const response = await productApi.CreateProducts(payload, token);

      if (response?.status_code === 0 && response?.data) {
        const image_urls = response.data.urls;

        const task = image_urls.map(async ({ doc_type, url }) => {
          const file = imageDataObj[doc_type];
          if (file) {
            console.log("file", file);
            await fetch(url, {
              method: "PUT",
              headers: {
                "Content-Type": file.type,
              },
              body: file,
            });
          }
        });

        await Promise.all(task);
      }
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  return (
    <div style={{ margin: "10px", padding: "30px" }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={submitForm}
        initialValues={{ seller_id: "", stock: 0 }}
      >
        <h2>Create Product</h2>

        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true }]}
        >
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item label="Key Features" name="key_features">
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label="Images"
          name="img"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload listType="picture-card" multiple>
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          </Upload>
        </Form.Item>

        <Form.Item label="Brand" name="brand">
          <Input />
        </Form.Item>

        <Form.Item label="MRP" name="mrp">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Selling Price"
          name="selling_price"
          rules={[{ required: true }]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Cost Price" name="cost_price">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="HSN" name="hsn">
          <Input />
        </Form.Item>

        <Form.Item
          label="Measure Unit"
          name="measure_unit"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="GM">GM</Option>
            <Option value="KG">KG</Option>
            <Option value="ML">ML</Option>
            <Option value="LTR">LTR</Option>
            <Option value="PCS">PCS</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Tax Rate (%)"
          name="tax_rate"
          rules={[{ required: true }]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Quantity Unit"
          name="quantity_unit"
          rules={[{ required: true }]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Seller ID" name="seller_id">
          <Input />
        </Form.Item>

        <Form.Item label="Stock" name="stock">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Create Product
          </Button>
          <Button
            type="primary"
            style={{ display: Flex, margin: "30px" }}
            onClick={NavigateHome}
          >
            Exit{" "}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProductForm;
