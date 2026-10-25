import {
  createContext,
  useState,
  useEffect,
  useContext,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

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
        `${API_BASE_URL}/api/auth/me`,
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
        `${API_BASE_URL}/api/auth/login`,
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
  const register = async (name, email, password) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
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

  const googleLogin = async (idToken) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      const data = await res.json()
      if (!res.ok) return { success: false, message: data.message || 'Google sign-in failed' }

      const loggedUser = data.user
      setToken(data.token)
      setUser(loggedUser)
      localStorage.setItem('token', data.token)
      navigate(loggedUser.role === 'admin' ? '/dashboard' : '/my-requests')
      return { success: true }
    } catch {
      return { success: false, message: 'Server error. Check your connection and try again.' }
    }
  }

  /* ===================================================
     Logout
  =================================================== */
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    signOut(auth).catch(() => {})
    navigate('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        googleLogin,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
