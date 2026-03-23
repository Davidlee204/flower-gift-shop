import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home      from './pages/Home';

// TODO: Import thêm pages khi tạo xong

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          {/* TODO: Thêm routes dần khi làm */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}