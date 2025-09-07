import { axiosInstance } from "../../utils/apiClient";

const ProductApi = {
  getProducts: "/api/v1/products/get-all-products",
  getImages: "/api/v1/products/get-image-url",
  createProducts: "/api/v1/products/create-products",
  addtoCart: "/api/v1/cart/add-cart-item",
  getCart: "/api/v1/cart/get-cart-items",
  orderCart: "/api/v1/order/create-order",
  addAddress: "/api/v1/user/add-address",
};

const Getproducts = async (token, searchQuery = "" ,page = 1, perPage = 20) => {
  try {
    const response = await axiosInstance.get(ProductApi.getProducts, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: {
        search: searchQuery || undefined,
        page,
        per_page: perPage,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

const GetImages = async (files, token) => {
  try {
    const response = await axiosInstance.post(
      `${ProductApi.getImages}`,
      files,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response) {
      throw new Error("Failed to get Images");
    }
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const CreateProducts = async (form_details, token) => {
  try {
    const response = await axiosInstance.post(
      `${ProductApi.createProducts}`,
      form_details,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const GetCartProducts = async (token) => {
  try {
    const response = await axiosInstance.get(`${ProductApi.getCart}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {}
};

const AddtoCart = async (products, token) => {
  try {
    const response = await axiosInstance.post(
      `${ProductApi.addtoCart}`,
      products,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {}
};

const DeleteCartItem = async (product_id, token) => {
  try {
    const response = await axiosInstance.delete(
      `/api/v1/cart/delete-cart-item/${product_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting cart item:", error);
  }
};


const CreateOrder = async (orderData, token) => {
  try {
    const response = await axiosInstance.post(
      `${ProductApi.orderCart}`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

const AddAddress = async (addressData, token) => {
  try {
    const response = await axiosInstance.post(
      `${ProductApi.addAddress}`,
      addressData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error adding address:", error);
    throw error;
  }
};

export default {
  Getproducts,
  GetImages,
  CreateProducts,
  AddtoCart,
  GetCartProducts,
  DeleteCartItem,
  CreateOrder,
  AddAddress
};
