import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Input,
  Spin,
  Layout,
  Tooltip,
  Button,
  Drawer,
  Badge,
  Pagination,
} from "antd";
import {
  ShoppingCartOutlined,
  LogoutOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import productApi from "../components/api/product/product";
import Meta from "antd/es/card/Meta";
import logo from "../assets/parishudh.png";
import PaymentDialog from "./PaymentDialog";
import AddAddressForm from "./AddressPage";
import noimage from "../assets/noimage.png";

const { Search } = Input;
const { Header } = Layout;

const Homepage = ({ user }) => {
  const token = localStorage.getItem("token");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [produtimg, setProductimg] = useState({});
  const [quantities, setQuantity] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [iscartopen, setIscartOpen] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(20);
  const [totalProducts, setTotalProducts] = useState(0);

  const [orderCount, setOrderCount] = useState(0);
  const debounceTimeout = useRef(null);

  console.log("cartItems", cartItems);
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + item.total_price, 0);
    setTotalPrice(total);
  }, [cartItems]);

  const increment = (id) =>
    setQuantity((prev) => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
  // const decrement = (id) => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  const decrement = (id) =>
    setQuantity((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] || 1) - 1, 1),
    }));

  const handlePlaceOrder = () => {
    if (totalPrice <= 0) {
      message.warning("Cannot place order with ₹0 total");
      return;
    }
    if (!user.address || user.address.length === 0) {
      setIsAddAddressOpen(true);
    } else {
      setIsPaymentDialogOpen(true);
    }
  };

  const handleQuantityChange = (id, value) => {
    const val = Number(value);
    if (!isNaN(val) && val > 0) {
      setQuantities((prev) => ({
        ...prev,
        [id]: val,
      }));
    }
  };
  const handlePaymentSuccess = async (paymentId) => {
    console.log("Payment ID:", paymentId);
    setCartItems([]);
    setItemCount(0);
    setQuantity({});
    setIscartOpen(false);
  };

  const removeFromCart = async (product_id) => {
    try {
      await productApi.DeleteCartItem(product_id, token);
      setCartItems((prev) =>
        prev.filter((item) => item.product_id !== product_id)
      );
      setCartItems((prev) => {
        const updatedCart = prev.filter(
          (item) => item.product_id !== product_id
        );
        setItemCount(updatedCart.reduce((sum, item) => sum + item.quantity, 0));
        return updatedCart;
      });
    } catch (error) {
      console.error("Failed to delete item from cart", error);
    }
  };

  const AddtoCart = async (product_id) => {
    const addedProducts = products.filter(
      (item) => item.product_id == product_id
    )[0];
    const payload = {
      product_id: addedProducts.product_id,
      product_name: addedProducts.name,
      tax_rate: 5,
      selling_price: addedProducts.selling_price,
      quantity: quantities[product_id] || 1,
      img: addedProducts.img[0],
    };
    const response = await productApi.AddtoCart(payload, token);
    if (response?.status_code === 0) {
      const newItem = response.data;
      setCartItems((prev) => {
        const existing = prev.find(
          (item) => item.product_id === newItem.product_id
        );
        if (existing) {
          return prev.map((item) =>
            item.product_id === newItem.product_id ? newItem : item
          );
        } else {
          return [...prev, newItem];
        }
      });
      setItemCount((prev) => {
        const otherItems = cartItems.filter(
          (item) => item.product_id !== newItem.product_id
        );
        const newTotal = [...otherItems, newItem].reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        return newTotal;
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  useEffect(() => {
    const image_name = products.map((img) => img.img[0]).filter((file) => file);
    const item_cart = Object.values(user.cart).reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    setItemCount(item_cart);
    setCartItems(Object.values(user.cart));

    const initialQuantities = {};
    Object.values(user.cart).forEach((item) => {
      initialQuantities[item.product_id] = item.quantity;
    });
    setQuantity(initialQuantities);

    const getimg = async () => {
      const response = await productApi.GetImages({ files: image_name }, token);
      const image_array = response.data.reduce((acc, curr) => {
        return { ...acc, ...curr };
      }, {});
      setProductimg((prev) => ({
        ...prev,
        ...image_array,
      }));
    };

    if (products.length > 0) getimg();
  }, [products]);

  const fetchProducts = async (search = "", page = 1) => {
    setLoading(true);
    try {
      const response = await productApi.Getproducts(token, search, page);
      if (response?.status_code === 0) {
        setProducts(response.data.products);
        setTotalProducts(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setLoading(false);
  };
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts(searchQuery, currentPage);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, currentPage]);
  const onPageChange = (page) => {
    setCurrentPage(page);
  };
  return (
    <>
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Header
            style={{
              background: "#ffffff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 24px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              position: "sticky",
              top: 0,
              zIndex: 1000,
              height: 64,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src={logo} alt="Logo" style={{ height: "40px" }} />{" "}
              <span
                style={{ fontSize: "22px", fontWeight: "bold", color: "#000" }}
              >
                Parishudh
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Search
                placeholder="Search products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                enterButton
                allowClear
              />
              <Tooltip title="Orders">
                <Badge count={0} showZero>
                  <ShoppingOutlined
                    onClick={() => setIscartOpen(true)}
                    style={{
                      fontSize: "24px",
                      color: "#000",
                      cursor: "pointer",
                    }}
                  />
                </Badge>
              </Tooltip>

              <Tooltip title="Cart">
                <Badge count={itemCount} showZero>
                  <ShoppingCartOutlined
                    onClick={() => setIscartOpen(true)}
                    style={{
                      fontSize: "24px",
                      color: "#000",
                      cursor: "pointer",
                    }}
                  />
                </Badge>
              </Tooltip>
              <Tooltip title="Logout">
                <LogoutOutlined
                  onClick={handleLogout}
                  style={{ fontSize: "24px", color: "#000", cursor: "pointer" }}
                />
              </Tooltip>
            </div>
          </Header>

          <Row gutter={[16, 16]} style={{ padding: "16px" }}>
            {products.map((product) => (
              <Col
                key={product.product_id}
                xs={12}
                sm={12}
                md={8}
                lg={6}
                xl={6}
              >
                <Card
                  hoverable
                  style={{ width: "100%" }}
                  cover={
                    <img
                      alt={product.name}
                      src={produtimg[product.img[0]] || noimage}
                      style={{
                        height: 200,
                        width: "100%",
                        objectFit: "contain",
                      }}
                    />
                  }
                >
                  <Meta
                    title={product.name}
                    description={`₹${product.selling_price}`}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 10,
                    }}
                  >
                    <div>
                      <Button
                        style={{ marginRight: 10 }}
                        onClick={() => decrement(product.product_id)}
                      >
                        -
                      </Button>
                      <Input
                        style={{ width: 50 }}
                        value={quantities[product.product_id] || 1}
                        onChange={(e) =>
                          handleQuantityChange(
                            product.product_id,
                            e.target.value
                          )
                        }
                      />
                      <Button
                        style={{ marginLeft: 10 }}
                        onClick={() => increment(product.product_id)}
                      >
                        +
                      </Button>
                    </div>
                    <div>
                      <Button
                        type="primary"
                        onClick={() => AddtoCart(product.product_id)}
                      >
                        Add to cart
                      </Button>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          <Drawer
            title=" Your Cart"
            placement="right"
            onClose={() => setIscartOpen(false)}
            open={iscartopen}
            bodyStyle={{ padding: "16px" }}
          >
            {cartItems.length === 0 ? (
              <p style={{ textAlign: "center", color: "#888" }}>
                Your cart is empty.
              </p>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.product_id}
                  style={{
                    marginBottom: "12px",
                    padding: "12px",
                    border: "1px solid #f0f0f0",
                    borderRadius: "8px",
                    backgroundColor: "#fafafa",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                    position: "relative",
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    {item.product_name}
                  </div>
                  <div style={{ color: "#555" }}>
                    ₹{item.selling_price} x {item.quantity} ={" "}
                    <strong>₹{item.total_price}</strong>
                  </div>

                  <Button
                    danger
                    type="link"
                    style={{ position: "absolute", top: 8, right: 8 }}
                    onClick={() => removeFromCart(item.product_id)}
                  >
                    Delete
                  </Button>
                </div>
              ))
            )}

            <Button
              type="primary"
              block
              style={{ marginTop: 16 }}
              onClick={handlePlaceOrder}
            >
              Place Order ₹{totalPrice.toFixed(2)}
            </Button>
          </Drawer>

          <PaymentDialog
            open={isPaymentDialogOpen}
            onClose={() => setIsPaymentDialogOpen(false)}
            totalAmount={totalPrice}
            user={user}
            onPaymentSuccess={handlePaymentSuccess}
          />
          <AddAddressForm
            visible={isAddAddressOpen}
            onClose={() => setIsAddAddressOpen(false)}
            onSuccess={() => {
              setIsAddAddressOpen(false);
            }}
            token={token}
          />
          <Pagination
            current={currentPage}
            pageSize={perPage}
            total={totalProducts}
            onChange={onPageChange}
            style={{ textAlign: "center", marginTop: 20 }}
          />
        </>
      )}
    </>
  );
};

export default Homepage;
