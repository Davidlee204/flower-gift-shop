import { Outlet } from 'react-router-dom';

// TODO: Thêm Navbar, Footer sau khi tạo components
export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Navbar /> */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
}