import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next'; // 1. Import

// Order History Page
export const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation(); // 2. Hook
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(`orders_${user?._id}`) || '[]');
    setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }, [user?._id]);

  const formatVND = (n) => n.toLocaleString('vi-VN') + '₫';

  const statusLabels = {
    pending: { label: t('orders.status.pending'), color: 'amber' },
    confirmed: { label: t('orders.status.confirmed'), color: 'blue' },
    shipping: { label: t('orders.status.shipping'), color: 'purple' },
    delivered: { label: t('orders.status.delivered'), color: 'green' },
    cancelled: { label: t('orders.status.cancelled'), color: 'red' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">
          📦 {t('orders.history_title')}
        </h1>
        <p className="text-gray-600 mb-8">{t('orders.history_subtitle')}</p>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg mb-6">{t('orders.empty')}</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold px-6 py-3 rounded-xl"
            >
              🛍️ {t('orders.start_shopping')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const status = statusLabels[order.status] || statusLabels.pending;
              return (
                <div key={order.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition">
                  <div className="grid md:grid-cols-5 gap-4 items-center">
                    <div>
                      <p className="text-gray-600 text-sm">{t('orders.order_id')}</p>
                      <p className="text-lg font-bold text-gray-800">#ORD{order.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">{t('orders.date')}</p>
                      <p className="font-bold text-gray-800">
                        {new Date(order.createdAt).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">{t('orders.total')}</p>
                      <p className="text-lg font-bold text-pink-600">{formatVND(order.total)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">{t('orders.status_label')}</p>
                      <p className={`font-bold text-${status.color}-600`}>{status.label}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition"
                      >
                        {t('orders.btn_details')}
                      </button>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => navigate(`/orders/${order.id}/cancel`)}
                          className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition"
                        >
                          {t('orders.btn_cancel')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Order Details Page
export const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem(`orders_${user?._id}`) || '[]');
    const found = orders.find(o => o.id.toString() === orderId);
    setOrder(found);
  }, [orderId, user?._id]);

  if (!order) return <div className="text-center py-20 text-gray-600">{t('orders.not_found')}</div>;

  const formatVND = (n) => n.toLocaleString('vi-VN') + '₫';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => navigate('/orders')} className="text-indigo-600 font-bold mb-6 hover:underline">
          ← {t('orders.back_to_history')}
        </button>

        <div className="bg-white rounded-2xl shadow-2xl border border-purple-200 p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">{t('orders.order_id')} #{order.id}</h1>
          <p className="text-gray-600 mb-8">
            {t('orders.placed_at')}: {new Date(order.createdAt).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
          </p>

          <div className="mb-8 pb-8 border-b-2 border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800">📦 {t('orders.items')}</h2>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-bold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">{t('orders.qty')}: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-gray-800">
                    {formatVND((item.salePrice > 0 ? item.salePrice : item.price) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8 pb-8 border-b-2 border-gray-200 p-4 bg-blue-50 rounded-xl">
            <h2 className="text-xl font-bold mb-3 text-gray-800">📍 {t('orders.shipping_address')}</h2>
            <p className="font-bold text-gray-800">{order.address.fullName}</p>
            <p className="text-gray-600">{order.address.phone}</p>
            <p className="text-gray-600">{order.address.street}</p>
            <p className="text-gray-600">{order.address.district}, {order.address.city}</p>
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-xl space-y-2 mb-8">
            <div className="flex justify-between">
              <span>{t('orders.subtotal')}:</span>
              <span className="font-bold">{formatVND(order.subtotal)}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-purple-300">
              <span>{t('orders.shipping')}:</span>
              <span className="font-bold">{formatVND(order.shipping)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-bold">{t('orders.total_label')}:</span>
              <span className="text-2xl font-black text-purple-600">{formatVND(order.total)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate(`/orders/${order.id}/tracking`)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg"
          >
            🚚 {t('orders.btn_track')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Order Tracking Page
export const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem(`orders_${user?._id}`) || '[]');
    const found = orders.find(o => o.id.toString() === orderId);
    setOrder(found);
  }, [orderId, user?._id]);

  if (!order) return null;

  const statuses = ['pending', 'confirmed', 'shipping', 'delivered'];
  const currentIdx = statuses.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <button onClick={() => navigate(`/orders/${order.id}`)} className="text-teal-600 font-bold mb-6">
          ← {t('orders.btn_back')}
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">🚚 {t('orders.btn_track')}</h1>

          <div className="space-y-8">
            {[
              { status: 'pending', label: t('orders.status.pending'), icon: '⏳' },
              { status: 'confirmed', label: t('orders.status.confirmed'), icon: '✓' },
              { status: 'shipping', label: t('orders.status.shipping'), icon: '📦' },
              { status: 'delivered', label: t('orders.status.delivered'), icon: '✓' }
            ].map((step, idx) => {
              const isDone = statuses.indexOf(step.status) <= currentIdx;
              return (
                <div key={step.status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      isDone ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step.icon}
                    </div>
                    {idx < 3 && <div className={`w-1 h-12 ${isDone ? 'bg-teal-500' : 'bg-gray-300'}`}></div>}
                  </div>
                  <div className="pt-2">
                    <p className={`font-bold text-lg ${isDone ? 'text-teal-600' : 'text-gray-600'}`}>
                      {step.label}
                    </p>
                    <p className="text-sm text-gray-500">
                      {isDone ? `✓ ${t('orders.completed')}` : t('orders.waiting')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 p-6 bg-teal-50 rounded-xl border border-teal-200">
            <p className="font-bold text-gray-800">{t('orders.need_help')}</p>
            <p className="text-gray-600 mt-1">Contact: support@flowergift.vn</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Order Cancel Page
export const OrderCancelPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem(`orders_${user?._id}`) || '[]');
    const found = orders.find(o => o.id.toString() === orderId);
    setOrder(found);
  }, [orderId, user?._id]);

  const handleCancel = async () => {
    if (!reason.trim()) {
      alert(t('orders.cancel.reason_required'));
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const orders = JSON.parse(localStorage.getItem(`orders_${user._id}`) || '[]');
    const idx = orders.findIndex(o => o.id === parseInt(orderId));
    if (idx !== -1) {
      orders[idx].status = 'cancelled';
      orders[idx].cancelReason = reason;
      localStorage.setItem(`orders_${user._id}`, JSON.stringify(orders));
    }
    setLoading(false);
    alert(t('orders.cancel.success_msg'));
    navigate('/orders');
  };

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-red-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <button onClick={() => navigate(`/orders/${order.id}`)} className="text-rose-600 font-bold mb-6">
          ← {t('orders.btn_back')}
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-rose-200">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">{t('orders.cancel.title')}</h1>
          <p className="text-gray-600 mb-8">{t('orders.order_id')}: #{order.id}</p>

          <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-sm text-amber-800">
              ⚠️ <span className="font-bold">{t('orders.cancel.note_label')}:</span> {t('orders.cancel.note_text')}
            </p>
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-3">{t('orders.cancel.reason_label')}</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('orders.cancel.reason_placeholder')}
              rows="4"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => navigate(`/orders/${order.id}`)}
              className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:border-gray-400 transition"
            >
              {t('orders.cancel.btn_no')}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all"
            >
              {loading ? t('orders.cancel.processing') : t('orders.cancel.btn_confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};