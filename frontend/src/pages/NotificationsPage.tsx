import { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Notification } from '@/types';
import { Bell, BellOff, Check, CheckCheck, Clock } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data.data);
    } catch { console.error('Failed to load notifications'); }
    finally { setIsLoading(false); }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch { console.error('Failed to mark notification'); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch { console.error('Failed to mark all'); }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const typeColors: Record<string, { bg: string; text: string }> = {
    REGISTRATION: { bg: '#ecfdf5', text: '#10b981' },
    APPOINTMENT: { bg: '#eff6ff', text: '#2563EB' },
    PAYMENT: { bg: '#fffbeb', text: '#f59e0b' },
    PRESCRIPTION: { bg: '#f5f3ff', text: '#8b5cf6' },
    MEETING: { bg: '#ecfeff', text: '#06b6d4' },
    GENERAL: { bg: '#f1f5f9', text: '#64748b' },
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) return (
    <div className="min-h-screen flex flex-col"><Navbar /><div className="flex flex-1"><Sidebar /><div className="flex-1"><LoadingSpinner size="lg" /></div></div></div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-text)]">Notifications</h1>
                <p className="text-[var(--color-text-muted)] mt-1">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-primary)]
                                   border border-[var(--color-primary-200)] rounded-xl hover:bg-[var(--color-primary-50)] transition-all">
                  <CheckCheck className="w-4 h-4" /> Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[var(--color-border)]">
                <BellOff className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
                <p className="text-[var(--color-text-secondary)]">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => {
                  const colors = typeColors[notif.type] || typeColors.GENERAL;
                  return (
                    <div key={notif.id}
                         className={`bg-white rounded-2xl p-5 border transition-all duration-200 hover:shadow-md
                                    ${notif.isRead
                                      ? 'border-[var(--color-border)] opacity-75'
                                      : 'border-[var(--color-primary-200)] shadow-sm'}`}>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                             style={{ backgroundColor: colors.bg }}>
                          <Bell className="w-5 h-5" style={{ color: colors.text }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-sm font-semibold ${notif.isRead ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text)]'}`}>
                              {notif.title}
                            </h3>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                            )}
                          </div>
                          <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">{notif.message}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                  style={{ backgroundColor: colors.bg, color: colors.text }}>
                              {notif.type}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                              <Clock className="w-3 h-3" /> {formatDate(notif.createdAt)}
                            </span>
                          </div>
                        </div>
                        {!notif.isRead && (
                          <button onClick={() => handleMarkRead(notif.id)}
                                  className="flex-shrink-0 p-2 rounded-xl text-[var(--color-text-muted)]
                                             hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)] transition-all"
                                  title="Mark as read">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
