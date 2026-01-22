import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bell, X, Check, Trash2, CheckCheck, Calendar, ShoppingBag, MessageSquare, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import './NotificationDropdown.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseTable = ReturnType<typeof supabase.from> & { [key: string]: any };

interface Notification {
    id: string;
    user_id: string;
    type: string;
    title_en: string;
    title_bn: string;
    message_en: string;
    message_bn: string;
    action_url: string | null;
    icon: string | null;
    is_read: boolean;
    created_at: string;
}

interface NotificationDropdownProps {
    onClose?: () => void;
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;

        try {
            const { data, error } = await (supabase
                .from('notifications') as SupabaseTable)
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            setNotifications(data || []);
            setUnreadCount(data?.filter((n: Notification) => !n.is_read).length || 0);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user, fetchNotifications]);



    const markAsRead = async (notificationId: string) => {
        try {
            const { error } = await (supabase
                .from('notifications') as SupabaseTable)
                .update({ is_read: true })
                .eq('id', notificationId);

            if (error) throw error;

            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;

        try {
            const { error } = await (supabase
                .from('notifications') as SupabaseTable)
                .update({ is_read: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (error) throw error;

            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId);

            if (error) throw error;

            const notification = notifications.find(n => n.id === notificationId);
            if (notification && !notification.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'booking':
                return <Calendar size={18} />;
            case 'order':
                return <ShoppingBag size={18} />;
            case 'message':
                return <MessageSquare size={18} />;
            case 'alert':
                return <AlertCircle size={18} />;
            default:
                return <Bell size={18} />;
        }
    };

    const formatTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="notification-dropdown">
            <div className="notification-header">
                <h3>
                    Notifications
                    {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                </h3>
                <div className="header-actions">
                    {unreadCount > 0 && (
                        <button
                            className="action-btn"
                            onClick={markAllAsRead}
                            title="Mark all as read"
                        >
                            <CheckCheck size={18} />
                        </button>
                    )}
                    {onClose && (
                        <button className="close-btn" onClick={onClose}>
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            <div className="notification-list">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="empty-state">
                        <Bell size={40} />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                        >
                            <div className="notification-icon">
                                {getNotificationIcon(notification.type)}
                            </div>
                            <div className="notification-content">
                                <h4>{notification.title_en}</h4>
                                <p>{notification.message_en}</p>
                                <span className="notification-time">
                                    {formatTimeAgo(notification.created_at)}
                                </span>
                            </div>
                            <div className="notification-actions">
                                {!notification.is_read && (
                                    <button
                                        className="action-btn"
                                        onClick={() => markAsRead(notification.id)}
                                        title="Mark as read"
                                    >
                                        <Check size={16} />
                                    </button>
                                )}
                                <button
                                    className="action-btn danger"
                                    onClick={() => deleteNotification(notification.id)}
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            {notification.action_url && (
                                <Link
                                    to={notification.action_url}
                                    className="notification-link"
                                    onClick={() => markAsRead(notification.id)}
                                />
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="notification-footer">
                <Link to="/notifications">View All Notifications</Link>
            </div>
        </div>
    );
}
