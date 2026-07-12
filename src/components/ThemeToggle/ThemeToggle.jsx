import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import './ThemeToggle.css'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      className={`theme-toggle-btn ${isDark ? 'dark' : 'light'}`}
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <span className="theme-toggle-track">
        <span className="theme-toggle-thumb">
          {isDark ? (
            <Moon size={12} strokeWidth={2.5} />
          ) : (
            <Sun size={12} strokeWidth={2.5} />
          )}
        </span>
      </span>
    </button>
  )
}
