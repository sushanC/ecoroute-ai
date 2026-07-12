import { createContext, useState, useEffect, useContext, useCallback } from 'react'
import { useAuth } from './AuthContext'

export const NotificationContext = createContext()

export const useNotifications = () => useContext(NotificationContext)

/* =====================================================
   Simple time-ago formatter — no external library
===================================================== */
export const timeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  /* =====================================================
     Compute unread count (memoized implicitly via state)
  ===================================================== */
  const unreadCount = notifications.filter((n) => !n.isRead).length

  /* =====================================================
     Fetch notifications from backend
  ===================================================== */
  const fetchNotifications = useCallback(async () => {
    if (!user) return

    try {
      const role = user.role || 'admin'
      const res = await fetch(
        `http://localhost:5000/api/notifications?role=${role}`
      )
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (err) {
      console.error('[Notifications] Fetch failed:', err)
    }
  }, [user])

  /* =====================================================
     Initial fetch + 15s polling for live updates
  ===================================================== */
  useEffect(() => {
    if (!user) return

    fetchNotifications()

    const interval = setInterval(fetchNotifications, 15000)
    return () => clearInterval(interval)
  }, [fetchNotifications, user])

  /* =====================================================
     Mark a single notification as read (optimistic)
  ===================================================== */
  const markRead = async (id) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    )

    try {
      await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: 'PATCH',
      })
    } catch (err) {
      console.error('[Notifications] Mark read failed:', err)
      // Rollback on error
      fetchNotifications()
    }
  }

  /* =====================================================
     Mark all as read (optimistic)
  ===================================================== */
  const markAllRead = async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))

    try {
      const role = user?.role || 'admin'
      await fetch(
        `http://localhost:5000/api/notifications/mark-all-read?role=${role}`,
        { method: 'PATCH' }
      )
    } catch (err) {
      console.error('[Notifications] Mark all read failed:', err)
      fetchNotifications()
    }
  }

  /* =====================================================
     Add notification locally (optimistic, used for
     instant feedback without waiting for next poll)
  ===================================================== */
  const addNotification = (notification) => {
    setNotifications((prev) => [
      { ...notification, _id: Date.now().toString(), isRead: false, createdAt: new Date().toISOString() },
      ...prev,
    ])
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markRead,
        markAllRead,
        addNotification,
        refetch: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
