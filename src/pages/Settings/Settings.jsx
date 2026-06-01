import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  User,
  Mail,
  Shield,
  Camera,
  Bell,
  Moon,
  Lock,
  Save,
  Award,
} from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()

  const [name, setName] = useState(user?.name || '')
  const [email] = useState(user?.email || '')
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const handleSave = () => {
    alert('Profile update feature can be connected to backend.')
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
            {user?.role === 'admin'
              ? 'Settings'
              : 'My Profile'}
          </h1>
          <p style={{ color: '#64748b' }}>
            Manage account preferences and personal details
          </p>
        </div>
      </div>

      {/* Top Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            '320px 1fr',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* Profile Card */}
        <div
          style={{
            background: '#fff',
            borderRadius: '24px',
            padding: '24px',
            border: '1px solid #eef2f7',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              margin: '0 auto',
              background:
                'linear-gradient(135deg,#16a34a,#22c55e)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontSize: '2rem',
              fontWeight: 800,
              position: 'relative',
            }}
          >
            {user?.name?.charAt(0)}

            <button
              style={{
                position: 'absolute',
                right: '-4px',
                bottom: '-4px',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: 'none',
                background: '#0f172a',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              }}
            >
              <Camera size={16} />
            </button>
          </div>

          <h3
            style={{
              marginTop: '16px',
              fontWeight: 800,
            }}
          >
            {user?.name}
          </h3>

          <p style={{ color: '#64748b' }}>
            {user?.email}
          </p>

          <div
            style={{
              marginTop: '16px',
              display: 'inline-block',
              padding: '8px 14px',
              borderRadius: '999px',
              background: '#ecfdf5',
              color: '#16a34a',
              fontWeight: 700,
              textTransform: 'capitalize',
            }}
          >
            {user?.role}
          </div>

          <div
            style={{
              marginTop: '20px',
              padding: '14px',
              borderRadius: '18px',
              background: '#f8fafc',
            }}
          >
            <p style={{ color: '#64748b' }}>
              Reward Points
            </p>
            <h2
              style={{
                fontWeight: 800,
                fontSize: '2rem',
              }}
            >
              {user?.rewardPoints || 0}
            </h2>
          </div>
        </div>

        {/* Edit Form */}
        <div
          style={{
            background: '#fff',
            borderRadius: '24px',
            padding: '24px',
            border: '1px solid #eef2f7',
          }}
        >
          <h3
            style={{
              fontWeight: 800,
              marginBottom: '18px',
            }}
          >
            Account Details
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit,minmax(240px,1fr))',
              gap: '16px',
            }}
          >
            <div>
              <label className="input-label">
                Full Name
              </label>
              <div className="input-wrapper">
                <User size={16} />
                <input
                  className="input"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <label className="input-label">
                Email
              </label>
              <div className="input-wrapper">
                <Mail size={16} />
                <input
                  className="input"
                  value={email}
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="input-label">
                Role
              </label>
              <div className="input-wrapper">
                <Shield size={16} />
                <input
                  className="input"
                  value={user?.role}
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="input-label">
                Password
              </label>
              <div className="input-wrapper">
                <Lock size={16} />
                <input
                  className="input"
                  type="password"
                  value="********"
                  disabled
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            style={{
              marginTop: '22px',
              height: '46px',
              padding: '0 18px',
              border: 'none',
              borderRadius: '14px',
              background: '#16a34a',
              color: '#fff',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div
        style={{
          background: '#fff',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid #eef2f7',
        }}
      >
        <h3
          style={{
            fontWeight: 800,
            marginBottom: '18px',
          }}
        >
          Preferences
        </h3>

        <div
          style={{
            display: 'grid',
            gap: '14px',
          }}
        >
          <ToggleRow
            icon={<Bell size={18} />}
            title="Notifications"
            enabled={notifications}
            onToggle={() =>
              setNotifications(!notifications)
            }
          />

          <ToggleRow
            icon={<Moon size={18} />}
            title="Dark Mode"
            enabled={darkMode}
            onToggle={() =>
              setDarkMode(!darkMode)
            }
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                'space-between',
              padding: '14px',
              borderRadius: '16px',
              background: '#f8fafc',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
              }}
            >
              <Award size={18} />
              <span>Membership Level</span>
            </div>

            <strong>Gold User</strong>
          </div>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({
  icon,
  title,
  enabled,
  onToggle,
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent:
          'space-between',
        padding: '14px',
        borderRadius: '16px',
        background: '#f8fafc',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        {icon}
        <span>{title}</span>
      </div>

      <button
        onClick={onToggle}
        style={{
          width: '52px',
          height: '30px',
          borderRadius: '999px',
          border: 'none',
          background: enabled
            ? '#16a34a'
            : '#cbd5e1',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '3px',
            left: enabled
              ? '26px'
              : '4px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#fff',
            transition: '0.2s',
          }}
        />
      </button>
    </div>
  )
}