import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => (
  <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex flex-col items-center justify-center p-4">
    <Link to="/" className="flex items-center gap-2 mb-8 text-xl font-bold text-pink-500">
      <span className="text-3xl">🌸</span>
      <span>Flower Gift</span>
    </Link>
    <div className="w-full max-w-md">
      <Outlet />
    </div>
    <p className="mt-6 text-xs text-gray-400">© 2026 Flower Gift Shop</p>
  </div>
);

export default AuthLayout;
