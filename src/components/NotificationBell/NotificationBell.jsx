import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'
import NotificationDropdown from './NotificationDropdown'
import './NotificationBell.css'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { unreadCount } = useNotifications()
  const containerRef = useRef(null)

  /* Close when clicking outside */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  /* Close on Escape */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const badgeLabel = unreadCount > 99 ? '99+' : unreadCount

  return (
    <div className="notif-bell-container" ref={containerRef}>
      <button
        className={`header-icon-btn notif-bell-btn ${open ? 'active' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        title="Notifications"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className={`notif-badge ${unreadCount > 0 ? 'notif-badge-pulse' : ''}`}>
            {badgeLabel}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown onClose={() => setOpen(false)} />
      )}
    </div>
  )
}
