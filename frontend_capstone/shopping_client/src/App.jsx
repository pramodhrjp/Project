import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/Login";
import Homepage from "./components/Homepage";

import { useEffect, useState } from "react";
import userApi from "./components/api/user/user";
import SignUppage from "./components/SignUppage";
import ProductForm from "./components/AdminPage";
import { Spin } from "antd";



function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await userApi.Me(token);

          if (response.data?.status_code === 0) {
            setUser(response.data.data);
            setLoading(false);
            return;
          }

          setUser(null);
          localStorage.removeItem("token");
          setToken(null);
        } catch (err) {
          console.log("Error fetching user:", err);
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
        }
      } else {
        setUser(null);
      }
    setLoading(false);
    };

    fetchUser();
  }, [token]);

  if (loading) {
    return (
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
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage setToken={setToken} />
            )
          }
        />

        {!user && <Route path="*" element={<Navigate to="/login" replace />} />}

        {user?.role === "user" && (
          <>
            <Route path="/" element={<Homepage user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}

        {user?.role === "admin" && (
          <>
            <Route path="/admin" element={<ProductForm />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </>
        )}
        <Route path="/signup" element={<SignUppage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
