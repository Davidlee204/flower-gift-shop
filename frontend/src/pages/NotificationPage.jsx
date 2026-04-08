import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotificationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadNotifications = () => {
      try {
        const saved = localStorage.getItem(`notifications_${user._id}`);
        setNotifications(saved ? JSON.parse(saved) : []);
      } catch (error) {
        console.error('Load notifications error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
    window.addEventListener('storage', loadNotifications);
    return () => window.removeEventListener('storage', loadNotifications);
  }, [user, navigate]);

  const updateAndSync = (updatedList) => {
    setNotifications(updatedList);
    localStorage.setItem(`notifications_${user._id}`, JSON.stringify(updatedList));
    window.dispatchEvent(new Event('storage'));
  };

  const handleMarkAsRead = (notifId) => {
    const updated = notifications.map(n =>
      n.id === notifId ? { ...n, read: true } : n
    );
    updateAndSync(updated);
  };

  const handleDelete = (notifId) => {
    const updated = notifications.filter(n => n.id !== notifId);
    updateAndSync(updated);
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    updateAndSync(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          <p className="text-gray-600 mt-4">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('notif.title')}</h1>
            <p className="text-gray-600">
              {unreadCount > 0
                ? t('notif.new_count', { count: unreadCount })
                : t('notif.no_new')}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg font-semibold hover:bg-pink-200 transition"
            >
              {t('notif.mark_all')}
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('notif.empty_title')}</h2>
            <p className="text-gray-600">{t('notif.empty_desc')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`rounded-lg p-4 border transition ${
                  notif.read
                    ? 'bg-white border-gray-200 shadow-sm'
                    : 'bg-pink-50 border-pink-200 shadow-md scale-[1.01]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-xl">📦</div>
                      <h3 className={`font-bold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {/* Kiểm tra nếu là loại đơn hàng thì dùng key dịch, nếu không hiện title gốc */}
                        {notif.type === 'order' || notif.title.includes('Đặt hàng')
                          ? t('notif.order_success_title')
                          : notif.title}
                      </h3>
                      {!notif.read && (
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse"></span>
                      )}
                    </div>
                    
                    {/* HIỂN THỊ NỘI DUNG: Ép lấy mã đơn hàng truyền vào tham số id */}
                    <p className="text-gray-600 text-sm mb-2 ml-8">
                      {notif.type === 'order' || notif.message.includes('Đơn hàng')
                        ? t('notif.order_success_desc', { 
                            id: notif.orderId || notif.id.toString().slice(-10) 
                          })
                        : notif.message}
                    </p>

                    <div className="flex items-center justify-between ml-8">
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(notif.createdAt).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-xs text-pink-500 hover:text-pink-600 font-bold uppercase tracking-wider"
                        >
                          {t('notif.mark_read')}
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="ml-4 p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;