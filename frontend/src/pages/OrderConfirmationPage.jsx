// FGS-20: Order Confirmation Page
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem(`orders_${user?._id}`) || '[]');
    const found = orders.find(o => o.id.toString() === orderId);
    setOrder(found);
  }, [orderId, user?._id]);

  if (!order) return <div className="text-center py-20">Không tìm thấy đơn hàng</div>;

  const formatVND = (n) => n.toLocaleString('vi-VN') + '₫';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="text-7xl mb-4 animate-bounce">✓</div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Đơn hàng thành công!
          </h1>
          <p className="text-gray-600 text-lg">Cảm ơn bạn đã tin tưởng chúng tôi</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-green-200 p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-6 pb-6 border-b-2 border-gray-200 mb-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">Mã đơn hàng</p>
              <p className="text-3xl font-bold text-green-600">#ORD{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-sm mb-1">Ngày đặt hàng</p>
              <p className="text-lg font-bold text-gray-800">
                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3">📦 Sản phẩm đã đặt</h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">x{item.quantity}</p>
                  </div>
                  <p className="font-bold text-gray-800">
                    {formatVND((item.salePrice > 0 ? item.salePrice : item.price) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="font-bold text-gray-800 mb-2">📍 Địa chỉ giao hàng</h3>
            <p className="text-gray-800">{order.address.fullName}</p>
            <p className="text-gray-600">{order.address.phone}</p>
            <p className="text-gray-600">{order.address.street}</p>
            <p className="text-gray-600">{order.address.district}, {order.address.city}</p>
          </div>

          {/* Total */}
          <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Tạm tính:</span>
              <span className="font-bold text-gray-800">{formatVND(order.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-green-300 mb-2">
              <span className="text-gray-700">Phí giao hàng:</span>
              <span className="font-bold text-gray-800">{formatVND(order.shipping)}</span>
            </div>
            <div className="flex justify-between items-center text-xl">
              <span className="font-bold text-gray-800">TỔNG CỘNG:</span>
              <span className="text-3xl font-black text-green-600">{formatVND(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate(`/orders/${order.id}`)}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg"
          >
            📊 Theo dõi đơn hàng
          </button>
          <button
            onClick={() => navigate('/products')}
            className="flex-1 border-2 border-green-500 text-green-600 hover:bg-green-50 font-bold py-3 rounded-xl transition"
          >
            🛍️ Tiếp tục mua sắm
          </button>
        </div>

        {/* Notes */}
        <div className="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-sm text-gray-700 mb-2">⏱️ <span className="font-bold">Thời gian xử lý:</span> 1-2 giờ</p>
          <p className="text-sm text-gray-700 mb-2">📦 <span className="font-bold">Dự kiến giao:</span> Hôm nay hoặc ngày mai</p>
          <p className="text-sm text-gray-700">☎️ <span className="font-bold">Hỗ trợ:</span> Liên hệ chúng tôi nếu có thắc mắc</p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
