import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. Thêm import

const formatVND = (n) => n.toLocaleString('vi-VN') + '₫';

const CartPage = () => {
  const { t } = useTranslation(); // 2. Khai báo hook t
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch {
        setCartItems([]);
      }
    }
  }, []);

  const saveCart = (items) => {
    localStorage.setItem('cart', JSON.stringify(items));
    setCartItems(items);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('cart:updated'));
  };

  const removeItem = (productId) => {
    const updated = cartItems.filter((item) => item._id !== productId);
    saveCart(updated);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }
    const updated = cartItems.map((item) =>
      item._id === productId ? { ...item, quantity: newQuantity } : item
    );
    saveCart(updated);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + ((item.salePrice || item.price) * item.quantity),
    0
  );
  const total = Math.max(0, subtotal - discount);

  const applyCoupon = () => {
    const coupons = {
      WELCOME10: Math.floor(subtotal * 0.1),
      FLOWER50K: 50000,
      SALE20HOA: Math.floor(subtotal * 0.2),
    };
    const amount = coupons[couponCode.toUpperCase()] || 0;
    if (amount > 0) {
      setDiscount(amount);
      // Dùng template string để dịch thông báo alert
      alert(`${t('cart.coupon_applied')} ${couponCode} - ${t('cart.discount')}: ${formatVND(amount)}`);
    } else {
      alert(t('cart.coupon_invalid'));
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('cart.empty')}</h1>
          <p className="text-gray-600 mb-8">{t('cart.empty_desc')}</p>
          <Link
            to="/products"
            className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-lg"
          >
            {t('cart.continue_shopping')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
            {t('cart.title')} ({cartItems.length} {t('cart.items')})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {cartItems.map((item) => (
                <div key={item._id} className="border-b p-4 flex gap-4 hover:bg-gray-50 transition">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">SKU: {item._id}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-pink-500">{formatVND(item.salePrice || item.price)}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item._id, parseInt(e.target.value) || 1)}
                          className="w-12 text-center border border-gray-300 rounded px-1 py-0.5"
                        />
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-800 mb-2">
                      {formatVND((item.salePrice || item.price) * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      {t('cart.remove')}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Link to="/products" className="text-pink-500 hover:text-pink-700 font-semibold">
                ← {t('cart.continue_shopping')}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t('cart.summary')}</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('cart.coupon_label')}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="VD: WELCOME10"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
                  >
                    {t('cart.apply')}
                  </button>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>{t('cart.subtotal')}:</span>
                  <span>{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>{t('cart.shipping')}:</span>
                  <span>{t('cart.shipping_free')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t('cart.discount')}:</span>
                    <span>-{formatVND(discount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t mt-4 pt-4 flex justify-between text-lg font-bold text-gray-800">
                <span>{t('cart.total')}:</span>
                <span className="text-pink-500">{formatVND(total)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-6 bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-lg transition"
              >
                {t('cart.checkout_btn')} ({cartItems.length} {t('cart.items')})
              </button>

              <div className="mt-4 text-xs text-gray-600 space-y-1">
                <p>✓ {t('cart.feature1')}</p>
                <p>✓ {t('cart.feature2')}</p>
                <p>✓ {t('cart.feature3')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;