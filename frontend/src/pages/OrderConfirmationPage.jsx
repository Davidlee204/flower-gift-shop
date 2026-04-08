import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next'; // 1. Thêm import

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation(); // 2. Khai báo hook t
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem(`orders_${user?._id}`) || '[]');
    const found = orders.find(o => o.id.toString() === orderId);
    setOrder(found);
  }, [orderId, user?._id]);

  if (!order) return <div className="text-center py-20">{t('order_conf.not_found')}</div>;

  const formatVND = (n) => n.toLocaleString('vi-VN') + '₫';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="text-7xl mb-4 animate-bounce">✓</div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            {t('order_conf.success_title')}
          </h1>
          <p className="text-gray-600 text-lg">{t('order_conf.success_subtitle')}</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-green-200 p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-6 pb-6 border-b-2 border-gray-200 mb-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">{t('order_conf.order_id')}</p>
              <p className="text-3xl font-bold text-green-600">#ORD{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-sm mb-1">{t('order_conf.order_date')}</p>
              <p className="text-lg font-bold text-gray-800">
                {new Date(order.createdAt).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3">📦 {t('order_conf.items_title')}</h3>
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
            <h3 className="font-bold text-gray-800 mb-2">📍 {t('order_conf.shipping_address')}</h3>
            <p className="text-gray-800">{order.address.fullName}</p>
            <p className="text-gray-600">{order.address.phone}</p>
            <p className="text-gray-600">{order.address.street}</p>
            <p className="text-gray-600">{order.address.district}, {order.address.city}</p>
          </div>

          {/* Total */}
          <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">{t('order_conf.subtotal')}:</span>
              <span className="font-bold text-gray-800">{formatVND(order.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-green-300 mb-2">
              <span className="text-gray-700">{t('order_conf.shipping')}:</span>
              <span className="font-bold text-gray-800">{formatVND(order.shipping)}</span>
            </div>
            <div className="flex justify-between items-center text-xl">
              <span className="font-bold text-gray-800">{t('order_conf.total_label')}:</span>
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
            📊 {t('order_conf.btn_track')}
          </button>
          <button
            onClick={() => navigate('/products')}
            className="flex-1 border-2 border-green-500 text-green-600 hover:bg-green-50 font-bold py-3 rounded-xl transition"
          >
            🛍️ {t('order_conf.btn_continue')}
          </button>
        </div>

        {/* Notes */}
        <div className="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-sm text-gray-700 mb-2">⏱️ <span className="font-bold">{t('order_conf.notes.process_time')}:</span> 1-2 {t('order_conf.notes.hours')}</p>
          <p className="text-sm text-gray-700 mb-2">📦 <span className="font-bold">{t('order_conf.notes.delivery_est')}:</span> {t('order_conf.notes.delivery_text')}</p>
          <p className="text-sm text-gray-700">☎️ <span className="font-bold">{t('order_conf.notes.support')}:</span> {t('order_conf.notes.support_text')}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;