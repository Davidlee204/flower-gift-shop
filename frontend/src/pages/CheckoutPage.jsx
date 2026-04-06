// FGS-19: Checkout & Payment Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod, card, bank
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: review, 2: address, 3: payment

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
      alert('Vui lòng chọn địa chỉ giao hàng');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    
    // Create order
    const order = {
      id: Date.now(),
      items: cartItems,
      address: selectedAddress,
      paymentMethod,
      subtotal,
      shipping,
      total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const orders = JSON.parse(localStorage.getItem(`orders_${user._id}`) || '[]');
    orders.push(order);
    localStorage.setItem(`orders_${user._id}`, JSON.stringify(orders));
    localStorage.setItem('cart', '[]');

    setLoading(false);
    navigate(`/orders/${order.id}/confirmation`);
  };

  const formatVND = (n) => n.toLocaleString('vi-VN') + '₫';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-pink-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent mb-2">
            🛒 Thanh toán
          </h1>
          <p className="text-gray-600 text-lg">Hoàn tất đơn hàng của bạn</p>
        </div>

        {/* Steps */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {[
            { num: 1, label: 'Kiểm tra' },
            { num: 2, label: 'Địa chỉ' },
            { num: 3, label: 'Thanh toán' }
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
              <span>{s.num}</span> {s.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Review Cart */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-pink-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">📦 Kiểm tra đơn hàng</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {cartItems.map(item => (
                    <div key={item._id} className="flex gap-4 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200">
                      <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{item.name}</h3>
                        <p className="text-gray-600 text-sm">Số lượng: {item.quantity}</p>
                        <p className="font-bold text-pink-600 mt-2 text-lg">
                          {formatVND((item.salePrice > 0 ? item.salePrice : item.price) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full mt-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg"
                >
                  ✓ Tiếp tục để chọn địa chỉ
                </button>
              </div>
            )}

            {/* Step 2: Address Selection */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-pink-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">📍 Chọn địa chỉ giao hàng</h2>
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {user?.addresses && user.addresses.length > 0 ? (
                    user.addresses.map((addr, idx) => (
                      <label key={idx} className="cursor-pointer">
                        <div className={`p-4 rounded-xl border-2 transition-all ${
                          selectedAddress?.street === addr.street
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 bg-gray-50 hover:border-pink-300'
                        }`}>
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="address"
                              checked={selectedAddress?.street === addr.street}
                              onChange={() => setSelectedAddress(addr)}
                              className="w-5 h-5 cursor-pointer accent-pink-500"
                            />
                            <div className="flex-1">
                              <p className="font-bold text-gray-800">{addr.label}</p>
                              <p className="text-sm text-gray-600">{addr.fullName} | {addr.phone}</p>
                              <p className="text-sm text-gray-600">{addr.street}, {addr.district}, {addr.city}</p>
                            </div>
                          </div>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">Chưa có địa chỉ. Vui lòng thêm địa chỉ trước.</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:border-gray-400 transition"
                  >
                    ← Quay lại
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!selectedAddress}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg"
                  >
                    ✓ Tiếp tục
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Method */}
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-pink-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">💳 Phương thức thanh toán</h2>
                <div className="space-y-3">
                  {[
                    { id: 'cod', label: '💵 Thanh toán khi nhận', desc: 'Thanh toán tiền mặt khi nhận hàng' },
                    { id: 'card', label: '💳 Thẻ credit/debit', desc: 'Các thẻ quốc tế được hỗ trợ' },
                    { id: 'bank', label: '🏦 Chuyển khoản', desc: 'Chuyển khoản ngân hàng' }
                  ].map(method => (
                    <label key={method.id} className="cursor-pointer">
                      <div className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === method.id
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 bg-gray-50 hover:border-pink-300'
                      }`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="payment"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-5 h-5 cursor-pointer accent-pink-500"
                          />
                          <div className="flex-1">
                            <p className="font-bold text-gray-800">{method.label}</p>
                            <p className="text-sm text-gray-600">{method.desc}</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:border-gray-400 transition"
                  >
                    ← Quay lại
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg"
                  >
                    {loading ? '⏳ Đang xử lý...' : '✓ Hoàn tất đơn hàng'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl shadow-xl p-6 text-white sticky top-6">
              <h3 className="text-xl font-bold mb-4">📊 Tóm tắt đơn hàng</h3>
              <div className="space-y-3 text-sm mb-4 pb-4 border-b border-white/30">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-bold">{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí giao hàng:</span>
                  <span className="font-bold">{shipping === 0 ? 'MIỄN PHÍ ✓' : formatVND(shipping)}</span>
                </div>
              </div>
              <div className="flex justify-between text-xl font-black mb-6">
                <span>TỔNG CỘNG:</span>
                <span className="text-3xl">{formatVND(total)}</span>
              </div>
              <div className="bg-white/20 rounded-xl p-3 text-sm">
                <p className="font-semibold mb-1">💝 Ưu đãi</p>
                <p>Miễn phí ship cho đơn hàng {'>'}  500K</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
