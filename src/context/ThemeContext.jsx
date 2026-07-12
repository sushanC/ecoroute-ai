import { createContext, useState, useEffect, useContext } from 'react'

export const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
  /* =====================================================
     Determine initial theme:
     1. localStorage takes priority
     2. Fall back to system preference
  ===================================================== */
  const getInitialTheme = () => {
    const saved = localStorage.getItem('ecoroute-theme')
    if (saved === 'dark' || saved === 'light') return saved

    // Detect system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  const [theme, setTheme] = useState(getInitialTheme)

  /* =====================================================
     Apply theme to <html data-theme="...">
     Smooth 300ms CSS transition handled via CSS variables
  ===================================================== */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('ecoroute-theme', theme)
  }, [theme])

  /* =====================================================
     Listen for system preference changes
     (only if user hasn't manually set a preference)
  ===================================================== */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleSystemChange = (e) => {
      const savedPref = localStorage.getItem('ecoroute-theme')
      // Only follow system if user hasn't overridden
      if (!savedPref) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleSystemChange)
    return () => mediaQuery.removeEventListener('change', handleSystemChange)
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
