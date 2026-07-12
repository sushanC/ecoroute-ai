// Theme is now managed by ThemeContext.jsx
// This file kept for backward compatibility

const saved = localStorage.getItem('ecoroute-theme')
const systemDark =
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

const initialTheme = saved || (systemDark ? 'dark' : 'light')

document.documentElement.setAttribute('data-theme', initialTheme)