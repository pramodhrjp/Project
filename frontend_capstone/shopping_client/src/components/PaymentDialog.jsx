import React, { useState } from "react";
import { Modal, Radio, message } from "antd";
import productApi from "../components/api/product/product";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const PaymentDialog = ({
  open,
  onClose,
  totalAmount,
  user,
  onPaymentSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [alert, setAlert] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const placeOrder = async (paymentId = null) => {
    const token = localStorage.getItem("token");

    const payload = {
      products: cartItems.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        selling_price: item.selling_price,
        quantity: item.quantity,
        tax_rate: item.tax_rate || 5,
      })),
      delivery_address: user.address[0], 
      delivery_details: {
        delivery_partner: "MANUAL",
        shipping_charge: 0,
        delivery_type: paymentMethod === "cod" ? "COD" : "ONLINE",
      },
      payment_id: paymentId,
      payment_method: paymentMethod,
    };

    try {
      const res = await productApi.CreateOrder(payload, token);

      if (res?.status_code === 0) {
        message.success("Order placed successfully");
        onPaymentSuccess(paymentId); 
        onClose();
      } else {
        message.error(res?.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Order creation error:", error);
      message.error("Something went wrong while placing the order.");
    }
  };

  const handleRazorpayPayment = async () => {
    const res = await loadRazorpayScript();

    if (!res) {
      message.error("Failed to load Razorpay. Check your internet connection.");
      return;
    }

    const options = {
      key: "rzp_test_Yy05urr3qCWmiW",
      amount: totalAmount * 100,
      currency: "INR",
      name: "Parishudh",
      description: "Payment for Order",
      handler: function (response) {
        console.log("Payment success:", response);
        message.success("Payment Successful!");
        placeOrder(response.razorpay_payment_id); 
        onPaymentSuccess(response.razorpay_payment_id);
        // i should do bakc edn
        onClose();
      },
      prefill: {
        name: user?.name || "Customer",
        email: user?.email || "test@example.com",
        contact: user?.mobile || "9999999999",
      },
      theme: {
        color: "#1890ff",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleSubmit = () => {
    if (paymentMethod === "cod") {
      message.success("Order placed with Cash on Delivery");
      setTimeout(() => {
        onClose();
      }, 1000);
      // Tod : i should write bacekdn here
    } else {
      handleRazorpayPayment();
    }
  };

  return (
    <>
      {alert && (
        <Alert
          message={alertMessage}
          type={alert}
          showIcon
          style={{ marginBottom: "20px" }}
        />
      )}
      <Modal
        title="Choose Payment Method"
        open={open}
        onCancel={onClose}
        onOk={handleSubmit}
        okText={paymentMethod === "cod" ? "Place Order" : "Pay Now"}
      >
        <Radio.Group
          onChange={(e) => setPaymentMethod(e.target.value)}
          value={paymentMethod}
        >
          <Radio value="cod" disabled>
            Cash on Delivery{" "}
            <span style={{ color: "red" }}>(Currently Unavailable)</span>
          </Radio>
          <Radio value="online">Online Payment (Razorpay)</Radio>
        </Radio.Group>
      </Modal>
    </>
  );
};

export default PaymentDialog;
