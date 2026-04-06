import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

import MainLayout    from './layouts/MainLayout';
import AuthLayout    from './layouts/AuthLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// ── Pages ──────────────────────────────────────────────────────────────────
import HomePage          from './pages/HomePage';
import LoginPage         from './pages/auth/LoginPage';
import RegisterPage      from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ProfilePage       from './pages/user/ProfilePage';
import AddressPage       from './pages/user/AddressPage';

// Sprint 2 — Sản phẩm & Giỏ hàng
import ProductListPage   from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage          from './pages/CartPage';
import CategoryListPage  from './pages/CategoryListPage';
import CategoryPage      from './pages/CategoryPage';
import SearchPage        from './pages/SearchPage';

// Sprint 2 — Wishlist, Review, Notification (FGS-06, FGS-07, FGS-08)
import WishlistPage      from './pages/WishlistPage';
import ReviewPage        from './pages/ReviewPage';
import NotificationPage  from './pages/NotificationPage';

// Sprint 3 — Orders (FGS-19 to FGS-24)
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import { OrderHistoryPage, OrderDetailsPage, OrderTrackingPage, OrderCancelPage } from './pages/OrdersPage';

// Sprint 4 — Admin (FGS-25 to FGS-30)
import AdminDashboard from './pages/admin/AdminDashboard';
import { AdminProductsPage, AdminOrdersPage, AdminUsersPage, AdminCouponsPage, AdminCategoriesPage } from './pages/admin/AdminManagement';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', fontSize: '14px' },
            success: { iconTheme: { primary: '#ec4899', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* ── Auth routes (centered card layout) ─────────────────────── */}
          <Route element={<AuthLayout />}>
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/register"        element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* ── Main routes (navbar + footer) ──────────────────────────── */}
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />

            {/* FGS-09: Tìm kiếm sản phẩm */}
            <Route path="/search" element={<SearchPage />} />

            {/* FGS-11: Danh sách & chi tiết sản phẩm */}
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />

            {/* FGS-17: Danh mục */}
            <Route path="/categories" element={<CategoryListPage />} />
            <Route path="/categories/:slug" element={<CategoryPage />} />

            {/* FGS-15: Giỏ hàng */}
            <Route path="/cart" element={<CartPage />} />

            {/* FGS-06, 07, 08: Wishlist, Review, Notification */}
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/reviews" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />

            {/* Sprint 1 — User protected routes */}
            <Route path="/profile"
              element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/addresses"
              element={<ProtectedRoute><AddressPage /></ProtectedRoute>} />

            {/* Sprint 3 — Orders (FGS-19 to FGS-24) */}
            <Route path="/checkout"
              element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/orders/:orderId/confirmation"
              element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
            <Route path="/orders"
              element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
            <Route path="/orders/:orderId"
              element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
            <Route path="/orders/:orderId/tracking"
              element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
            <Route path="/orders/:orderId/cancel"
              element={<ProtectedRoute><OrderCancelPage /></ProtectedRoute>} />

            {/* Sprint 4 — Admin (FGS-25 to FGS-30) */}
            <Route path="/admin"
              element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/products"
              element={<ProtectedRoute adminOnly><AdminProductsPage /></ProtectedRoute>} />
            <Route path="/admin/products/new"
              element={<ProtectedRoute adminOnly><AdminProductsPage /></ProtectedRoute>} />
            <Route path="/admin/orders"
              element={<ProtectedRoute adminOnly><AdminOrdersPage /></ProtectedRoute>} />
            <Route path="/admin/users"
              element={<ProtectedRoute adminOnly><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/admin/coupons"
              element={<ProtectedRoute adminOnly><AdminCouponsPage /></ProtectedRoute>} />
            <Route path="/admin/coupons/new"
              element={<ProtectedRoute adminOnly><AdminCouponsPage /></ProtectedRoute>} />
            <Route path="/admin/categories"
              element={<ProtectedRoute adminOnly><AdminCategoriesPage /></ProtectedRoute>} />
            <Route path="/admin/categories/new"
              element={<ProtectedRoute adminOnly><AdminCategoriesPage /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🌸</div>
                <h2 className="text-xl font-bold text-gray-700 mb-2">Trang không tồn tại</h2>
                <a href="/" className="text-pink-500 hover:underline text-sm">← Về trang chủ</a>
              </div>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
