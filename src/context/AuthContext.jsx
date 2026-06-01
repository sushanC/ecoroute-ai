import {
  createContext,
  useState,
  useEffect,
  useContext,
} from 'react'
import { useNavigate } from 'react-router-dom'

export const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(
    localStorage.getItem('token') || null
  )
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  /* ===================================================
     Restore Session
  =================================================== */
  const fetchCurrentUser = async () => {
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch(
        'http://localhost:5000/api/auth/me',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()

      if (res.ok) {
        setUser(data.user || data)
      } else {
        logout()
      }
    } catch (error) {
      console.error(error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
  }, [token])

  /* ===================================================
     Login
  =================================================== */
  const login = async (email, password) => {
    try {
      const res = await fetch(
        'http://localhost:5000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        return {
          success: false,
          message: data.message || 'Login failed',
        }
      }

      const loggedUser = data.user || data

      setToken(data.token)
      setUser(loggedUser)

      localStorage.setItem('token', data.token)

      if (loggedUser.role === 'admin') {
        navigate('/dashboard')
      } else {
        navigate('/my-requests')
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: 'Server error',
      }
    }
  }

  /* ===================================================
     Register
  =================================================== */
  const register = async (
    name,
    email,
    password,
    role = 'user'
  ) => {
    try {
      const res = await fetch(
        'http://localhost:5000/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
            role,
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        return {
          success: false,
          message:
            data.message || 'Registration failed',
        }
      }

      const newUser = data.user || data

      setToken(data.token)
      setUser(newUser)

      localStorage.setItem('token', data.token)

      if (newUser.role === 'admin') {
        navigate('/dashboard')
      } else {
        navigate('/my-requests')
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: 'Server error',
      }
    }
  }

  /* ===================================================
     Refresh User Data (IMPORTANT)
  =================================================== */
  const refreshUser = async () => {
    if (!token) return
    await fetchCurrentUser()
  }

  /* ===================================================
     Logout
  =================================================== */
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}