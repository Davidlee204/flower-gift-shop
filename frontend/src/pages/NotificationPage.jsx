// FGS-08: Notification Page - Thông báo
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const NotificationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load notifications from localStorage
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const saved = localStorage.getItem(`notifications_${user._id}`);
      setNotifications(saved ? JSON.parse(saved) : []);
    } catch (error) {
      console.error('Load notifications error:', error);
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  // Mark as read
  const handleMarkAsRead = (notifId) => {
    const updated = notifications.map(n =>
      n.id === notifId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem(`notifications_${user._id}`, JSON.stringify(updated));
  };

  // Delete notification
  const handleDelete = (notifId) => {
    const updated = notifications.filter(n => n.id !== notifId);
    setNotifications(updated);
    localStorage.setItem(`notifications_${user._id}`, JSON.stringify(updated));
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(`notifications_${user._id}`, JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          <p className="text-gray-600 mt-4">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Thông báo</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo mới` : 'Không có thông báo mới'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg font-semibold hover:bg-pink-200 transition"
            >
              Đánh dấu tất cả là đã đọc
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Không có thông báo nào</h2>
            <p className="text-gray-600">Bạn sẽ nhận được thông báo về đơn hàng và khuyến mãi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`rounded-lg p-4 border transition ${
                  notif.read
                    ? 'bg-white border-gray-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{notif.title}</h3>
                      {!notif.read && (
                        <span className="inline-block w-2 h-2 rounded-full bg-pink-500"></span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{notif.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(notif.createdAt).toLocaleString('vi-VN')}
                      </span>
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-xs text-pink-500 hover:text-pink-600 font-semibold"
                        >
                          Đánh dấu là đã đọc
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="ml-4 p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                  >
                    ✕
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
