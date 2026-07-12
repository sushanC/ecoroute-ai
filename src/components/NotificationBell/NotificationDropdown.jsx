import {
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Truck,
  Trash2,
  Package,
  Gift,
  UserPlus,
  Route,
  Bell,
  Check,
  ExternalLink,
} from 'lucide-react'
import { useNotifications, timeAgo } from '../../context/NotificationContext'
import './NotificationDropdown.css'

/* =====================================================
   Map notification type → icon + color class
===================================================== */
const getTypeConfig = (type, title = '') => {
  const t = title.toLowerCase()

  // Title-based icons for richer context
  if (t.includes('truck') || t.includes('fleet')) {
    return { Icon: Truck, colorClass: 'notif-icon--info' }
  }
  if (t.includes('bin') || t.includes('overflow')) {
    return { Icon: Trash2, colorClass: 'notif-icon--warning' }
  }
  if (t.includes('request') || t.includes('collection')) {
    return { Icon: Package, colorClass: 'notif-icon--info' }
  }
  if (t.includes('reward') || t.includes('point') || t.includes('claim')) {
    return { Icon: Gift, colorClass: 'notif-icon--success' }
  }
  if (t.includes('user') || t.includes('register')) {
    return { Icon: UserPlus, colorClass: 'notif-icon--info' }
  }
  if (t.includes('route') || t.includes('optim')) {
    return { Icon: Route, colorClass: 'notif-icon--success' }
  }

  // Fall back to type-based icons
  switch (type) {
    case 'success': return { Icon: CheckCircle, colorClass: 'notif-icon--success' }
    case 'error':   return { Icon: XCircle, colorClass: 'notif-icon--danger' }
    case 'warning': return { Icon: AlertTriangle, colorClass: 'notif-icon--warning' }
    case 'info':
    default:        return { Icon: Info, colorClass: 'notif-icon--info' }
  }
}

/* =====================================================
   Single Notification Item
===================================================== */
function NotificationItem({ notification, onMarkRead }) {
  const { Icon, colorClass } = getTypeConfig(notification.type, notification.title)

  return (
    <div
      className={`notif-item ${notification.isRead ? 'notif-item--read' : 'notif-item--unread'}`}
      onClick={() => !notification.isRead && onMarkRead(notification._id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && !notification.isRead && onMarkRead(notification._id)}
    >
      <div className={`notif-icon ${colorClass}`}>
        <Icon size={15} strokeWidth={2} />
      </div>

      <div className="notif-body">
        <p className="notif-title">{notification.title}</p>
        <p className="notif-message">{notification.message}</p>
        <span className="notif-time">{timeAgo(notification.createdAt)}</span>
      </div>

      {!notification.isRead && <span className="notif-unread-dot" />}
    </div>
  )
}

/* =====================================================
   Main Dropdown
===================================================== */
export default function NotificationDropdown({ onClose }) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()

  const handleMarkAllRead = async () => {
    await markAllRead()
  }

  return (
    <div className="notif-dropdown" role="dialog" aria-label="Notifications">
      {/* Header */}
      <div className="notif-dropdown-header">
        <div className="notif-dropdown-title">
          <Bell size={16} />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="notif-header-badge">{unreadCount}</span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            className="notif-mark-all-btn"
            onClick={handleMarkAllRead}
            title="Mark all as read"
          >
            <Check size={13} />
            Mark all read
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="notif-divider" />

      {/* List */}
      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="notif-empty">
            <Bell size={28} />
            <p>You're all caught up!</p>
            <span>No notifications yet</span>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n._id}
              notification={n}
              onMarkRead={markRead}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <div className="notif-divider" />
          <div className="notif-dropdown-footer">
            <button className="notif-view-all-btn" onClick={onClose}>
              <ExternalLink size={13} />
              View All
            </button>
          </div>
        </>
      )}
    </div>
  )
}
