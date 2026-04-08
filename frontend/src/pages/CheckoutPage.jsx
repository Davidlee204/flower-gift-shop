import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [cartItems, setCartItems] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod'); 
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); 

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
    if (cart.length === 0) navigate('/cart');
  }, [navigate]);

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.salePrice > 0 ? item.salePrice : item.price;
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal > 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (!selectedAddress) {
      alert(t('checkout.alert_address', 'Vui lòng chọn địa chỉ giao hàng'));
      return;
    }
    setLoading(true);
    
    // Giả lập thời gian xử lý server
    await new Promise(r => setTimeout(r, 1200));
    
    // 1. TẠO ĐỐI TƯỢNG ĐƠN HÀNG
    const orderId = Date.now();
    const order = {
      id: orderId,
      customerName: user.fullName || user.name || 'Khách hàng',
      userId: user._id,
      items: cartItems,
      address: selectedAddress,
      paymentMethod,
      subtotal,
      shipping,
      total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // --- LƯU CHO USER (Để xem trong lịch sử mua hàng cá nhân) ---
    const userOrders = JSON.parse(localStorage.getItem(`orders_${user._id}`) || '[]');
    userOrders.push(order);
    localStorage.setItem(`orders_${user._id}`, JSON.stringify(userOrders));

    // --- LƯU CHO ADMIN (Kho chung 'all_orders' để trang quản lý hiển thị) ---
    const allOrders = JSON.parse(localStorage.getItem('all_orders') || '[]');
    allOrders.unshift(order); // Đưa đơn hàng mới nhất lên đầu danh sách
    localStorage.setItem('all_orders', JSON.stringify(allOrders));

    // 2. TẠO THÔNG BÁO GỬI VÀO CHUÔNG BÁO CHO USER
    const newNotification = {
      id: orderId + 1,
      type: 'order', 
      title: t('notif.order_success_title', '🎉 Đặt hàng thành công!'),
      message: t('notif.order_success_desc', { 
        id: orderId.toString().slice(-10),
        defaultValue: `Đơn hàng #${orderId.toString().slice(-10)} của bạn đã được ghi nhận.` 
      }),
      read: false,
      createdAt: new Date().toISOString()
    };
    
    const notifications = JSON.parse(localStorage.getItem(`notifications_${user._id}`) || '[]');
    notifications.unshift(newNotification);
    localStorage.setItem(`notifications_${user._id}`, JSON.stringify(notifications));

    // 3. DỌN GIỎ HÀNG & PHÁT TÍN HIỆU CẬP NHẬT
    localStorage.setItem('cart', '[]');
    window.dispatchEvent(new Event('storage')); // Rung chuông Header
    window.dispatchEvent(new CustomEvent('cart:updated')); // Xóa số giỏ hàng

    setLoading(false);
    navigate(`/orders/${orderId}/confirmation`);
  
    
    // 4. KÍCH HOẠT SỰ KIỆN ĐỂ CẬP NHẬT HEADER (Giỏ hàng & Chuông)
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('cart:updated'));

    setLoading(false);
    navigate(`/orders/${orderId}/confirmation`);
  };

  const formatVND = (n) => n.toLocaleString('vi-VN') + '₫';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-pink-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent mb-2">
            🛒 {t('checkout.page_title', 'Thanh toán')}
          </h1>
          <p className="text-gray-600 text-lg">{t('checkout.page_subtitle', 'Hoàn tất đơn hàng của bạn')}</p>
        </div>

        {/* Thanh tiến trình (Steps) */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { num: 1, label: t('checkout.steps.review', 'Xem lại') },
            { num: 2, label: t('checkout.steps.address', 'Địa chỉ') },
            { num: 3, label: t('checkout.steps.payment', 'Thanh toán') }
          ].map(s => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`flex-shrink-0 px-6 py-3 rounded-xl font-bold transition-all ${
                step === s.num
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-pink-300'
              }`}
            >
              <span>{s.num}</span>. {s.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* STEP 1: REVIEW ITEMS */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-pink-100 animate-fadeIn">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                   <span>📦</span> {t('checkout.review_title', 'Sản phẩm trong giỏ')}
                </h2>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {cartItems.map(item => (
                    <div key={item._id} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg shadow-sm" />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{item.name}</h3>
                        <p className="text-gray-500 text-sm">{t('checkout.qty', 'Số lượng')}: {item.quantity}</p>
                        <p className="font-bold text-pink-600 mt-1">
                          {formatVND((item.salePrice > 0 ? item.salePrice : item.price) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full mt-8 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95"
                >
                  ✓ {t('checkout.btn_next_address', 'Tiếp tục: Chọn địa chỉ')}
                </button>
              </div>
            )}

            {/* STEP 2: ADDRESS */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-pink-100 animate-fadeIn">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                  <span>📍</span> {t('checkout.address_title', 'Địa chỉ giao hàng')}
                </h2>
                <div className="space-y-3 mb-6">
                  {user?.addresses && user.addresses.length > 0 ? (
                    user.addresses.map((addr, idx) => (
                      <label key={idx} className="block cursor-pointer">
                        <div className={`p-4 rounded-xl border-2 transition-all ${
                          selectedAddress?.street === addr.street
                            ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-200'
                            : 'border-gray-100 bg-gray-50 hover:border-pink-200'
                        }`}>
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="address"
                              checked={selectedAddress?.street === addr.street}
                              onChange={() => setSelectedAddress(addr)}
                              className="mt-1 w-5 h-5 accent-pink-500"
                            />
                            <div className="flex-1">
                              <p className="font-bold text-gray-800">{addr.label}</p>
                              <p className="text-sm text-gray-600 font-medium">{addr.fullName} • {addr.phone}</p>
                              <p className="text-sm text-gray-500">{addr.street}, {addr.district}, {addr.city}</p>
                            </div>
                          </div>
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed">
                       <p className="text-gray-500">{t('checkout.no_address', 'Chưa có địa chỉ. Vui lòng thêm trong hồ sơ.')}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 font-bold py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                    {t('checkout.btn_back', 'Quay lại')}
                  </button>
                  <button
                    disabled={!selectedAddress}
                    onClick={() => setStep(3)}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
                  >
                    {t('checkout.btn_next', 'Tiếp tục')}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT */}
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-pink-100 animate-fadeIn">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                  <span>💳</span> {t('checkout.payment_title', 'Thanh toán')}
                </h2>
                <div className="space-y-3">
                  {[
                    { id: 'cod', icon: '💵', label: t('checkout.methods.cod_label', 'Thanh toán khi nhận hàng'), desc: t('checkout.methods.cod_desc', 'Thanh toán tiền mặt khi giao hoa') },
                    { id: 'card', icon: '💳', label: t('checkout.methods.card_label', 'Thẻ quốc tế / ATM'), desc: t('checkout.methods.card_desc', 'VNPay, Visa, Mastercard') },
                    { id: 'bank', icon: '🏦', label: t('checkout.methods.bank_label', 'Chuyển khoản'), desc: t('checkout.methods.bank_desc', 'Chuyển khoản trực tiếp ngân hàng') }
                  ].map(method => (
                    <label key={method.id} className="block cursor-pointer">
                      <div className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === method.id ? 'border-pink-500 bg-pink-50' : 'border-gray-100 hover:border-pink-200'
                      }`}>
                        <div className="flex items-center gap-4">
                          <input type="radio" value={method.id} checked={paymentMethod === method.id} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-pink-500" />
                          <div>
                            <p className="font-bold text-gray-800">{method.icon} {method.label}</p>
                            <p className="text-xs text-gray-500">{method.desc}</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setStep(2)} className="flex-1 font-bold py-4 rounded-xl border-2 border-gray-200 text-gray-600">
                    {t('checkout.btn_back', 'Quay lại')}
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 disabled:opacity-70 transition-all"
                  >
                    {loading ? `⏳ ${t('checkout.btn_processing', 'Xử lý...')}` : `✓ ${t('checkout.btn_complete', 'Xác nhận đặt hàng')}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl p-6 text-white sticky top-24">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span>📊</span> {t('checkout.summary_title', 'Đơn hàng')}
              </h3>
              <div className="space-y-4 text-sm border-b border-white/20 pb-6 mb-6">
                <div className="flex justify-between opacity-90">
                  <span>{t('checkout.subtotal', 'Tạm tính')}</span>
                  <span>{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between opacity-90">
                  <span>{t('checkout.shipping', 'Phí vận chuyển')}</span>
                  <span>{shipping === 0 ? 'MIỄN PHÍ' : formatVND(shipping)}</span>
                </div>
              </div>
              <div className="flex justify-between items-end mb-8">
                <span className="text-sm font-medium opacity-80">{t('checkout.total', 'Tổng cộng')}</span>
                <span className="text-3xl font-black">{formatVND(total)}</span>
              </div>
              <div className="bg-white/10 p-4 rounded-xl text-xs leading-relaxed italic">
                {t('checkout.promo_desc', 'Miễn phí giao hàng cho đơn hàng trên 500,000đ!')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;