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

// Placeholder cho Sprint 2-4 (uncomment khi làm)
// import ProductListPage   from './pages/ProductListPage';
// import ProductDetailPage from './pages/ProductDetailPage';
// import CartPage          from './pages/CartPage';
// import CheckoutPage      from './pages/CheckoutPage';
// import OrderHistoryPage  from './pages/user/OrderHistoryPage';
// import AdminDashboard    from './pages/admin/AdminDashboard';

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

            {/* Sprint 1 — User protected routes */}
            <Route path="/profile"
              element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/addresses"
              element={<ProtectedRoute><AddressPage /></ProtectedRoute>} />

            {/* Sprint 2 — uncomment khi làm */}
            {/* <Route path="/products"          element={<ProductListPage />} /> */}
            {/* <Route path="/products/:slug"    element={<ProductDetailPage />} /> */}
            {/* <Route path="/cart"              element={<CartPage />} /> */}
            {/* <Route path="/checkout"          element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} /> */}
            {/* <Route path="/orders"            element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} /> */}

            {/* Sprint 4 — Admin */}
            {/* <Route path="/admin/*"           element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} /> */}

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
