import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/Forgot-password";
import ResetPassword from "./pages/auth/Reset-password";
import VerifyOtp from "./pages/auth/Verify-otp";
import Home from "./pages/Home";
import ProductList from "./pages/products/ProductList";
import ProductDetail from "./pages/products/ProductDetail";
import Cart from "./pages/cart/Cart";
import ShippingAddress from "./pages/checkout/ShippingAddress";
import PaymentMethod from "./pages/checkout/PaymentMethod";
import ReviewOrder from "./pages/checkout/ReviewOrder";
import MyOrders from "./pages/user/MyOrders";
import UserInfo from "./pages/user/UserInfo";
import Wishlist from "./pages/user/Wishlist";
import ManageAddresses from "./pages/user/ManageAddresses";
import SavedCards from "./pages/user/SavedCards";
import Notifications from "./pages/user/Notifications";
import Settings from "./pages/user/Settings";
import OAuth2RedirectHandler from "./pages/auth/OAuth2RedirectHandler";
import AdminLayout from "./admin/layouts/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import AdminProductList from "./admin/pages/products/ProductList";
import ProductForm from "./admin/pages/products/ProductForm";
import ProtectedRoute from "./components/ProtectedRoute";

function AppLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/forgot-password"
    || location.pathname === "/reset-password" || location.pathname === "/verify-otp" || location.pathname === "/oauth2/redirect";

  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAuthPage && !isAdminPage && <Header />}
      <Routes>
        {/* home */}
        <Route path="/" element={<Home />} />

        {/* products */}
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />

        {/* cart */}
        <Route path="/cart" element={<Cart />} />

        {/* checkout */}
        <Route path="/checkout" element={<ShippingAddress />} />
        <Route path="/checkout/payment" element={<PaymentMethod />} />
        <Route path="/checkout/review" element={<ReviewOrder />} />

        {/* user */}
        <Route path="/user/orders" element={<MyOrders />} />
        <Route path="/user/profile" element={<UserInfo />} />
        <Route path="/user/wishlist" element={<Wishlist />} />
        <Route path="/user/addresses" element={<ManageAddresses />} />
        <Route path="/user/saved-cards" element={<SavedCards />} />
        <Route path="/user/notifications" element={<Notifications />} />
        <Route path="/user/settings" element={<Settings />} />

        {/* admin */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<AdminProductList />} />
            <Route path="products/add" element={<ProductForm />} />
            <Route path="products/edit/:id" element={<ProductForm />} />
          </Route>
        </Route>

        {/* auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        <Route path="*" element={<h2 className="text-center mt-5">404 - Không tìm thấy trang</h2>} />
      </Routes>
      {!isAuthPage && !isAdminPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
