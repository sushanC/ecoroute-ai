const savedTheme =
  localStorage.getItem('darkMode') === 'true'

document.documentElement.setAttribute(
  'data-theme',
  savedTheme ? 'dark' : 'light'
)