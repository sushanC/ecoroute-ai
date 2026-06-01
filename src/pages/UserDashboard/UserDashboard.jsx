import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  ClipboardList,
  Award,
  CheckCircle,
  Leaf,
  ArrowRight,
  Clock3,
  Trophy,
  Truck,
  Sparkles,
} from 'lucide-react'

export default function UserDashboard() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])

  useEffect(() => {
    fetch('http://localhost:5000/api/requests')
      .then((res) => res.json())
      .then((data) => {
        const myRequests = data.filter(
          (r) => r.name === user?.name
        )
        setRequests(myRequests)
      })
      .catch(console.error)
  }, [user])

  const total = requests.length
  const completed = requests.filter(
    (r) => r.status === 'completed'
  ).length
  const pending = requests.filter(
    (r) => r.status !== 'completed'
  ).length

  const progress =
    total > 0
      ? Math.round((completed / total) * 100)
      : 0

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              marginBottom: '6px',
            }}
          >
            Welcome back, {user?.name}
          </h1>
          <p style={{ color: '#64748b' }}>
            Manage pickups, rewards & your eco impact.
          </p>
        </div>
      </div>

      {/* Top Hero */}
      <div
        style={{
          background:
            'linear-gradient(135deg,#16a34a,#22c55e)',
          borderRadius: '28px',
          padding: '28px',
          color: '#fff',
          marginBottom: '24px',
          boxShadow:
            '0 20px 50px rgba(34,197,94,0.18)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <p style={{ opacity: 0.9 }}>
              Total Reward Points
            </p>
            <h2
              style={{
                fontSize: '3rem',
                fontWeight: 800,
              }}
            >
              {user?.rewardPoints || 0}
            </h2>
          </div>

          <div
            style={{
              background:
                'rgba(255,255,255,0.15)',
              padding: '16px 18px',
              borderRadius: '18px',
            }}
          >
            <p style={{ opacity: 0.9 }}>
              Completion Rate
            </p>
            <h3
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
              }}
            >
              {progress}%
            </h3>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(220px,1fr))',
          gap: '18px',
          marginBottom: '24px',
        }}
      >
        {[
          {
            title: 'Total Requests',
            value: total,
            icon: <ClipboardList size={20} />,
          },
          {
            title: 'Completed',
            value: completed,
            icon: <CheckCircle size={20} />,
          },
          {
            title: 'Pending',
            value: pending,
            icon: <Clock3 size={20} />,
          },
          {
            title: 'Eco Impact',
            value: `${total * 5} kg`,
            icon: <Leaf size={20} />,
          },
        ].map((card, i) => (
          <div
            key={i}
            style={{
              background: '#fff',
              borderRadius: '22px',
              padding: '22px',
              border: '1px solid #eef2f7',
              boxShadow:
                '0 10px 30px rgba(15,23,42,0.05)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: '#ecfdf5',
                color: '#16a34a',
                display: 'grid',
                placeItems: 'center',
                marginBottom: '14px',
              }}
            >
              {card.icon}
            </div>

            <p style={{ color: '#64748b' }}>
              {card.title}
            </p>

            <h3
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
              }}
            >
              {card.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Middle Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            '1.2fr 1fr',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* Progress Tracker */}
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
              marginBottom: '16px',
            }}
          >
            Pickup Progress
          </h3>

          <div
            style={{
              width: '100%',
              height: '14px',
              borderRadius: '999px',
              background: '#f1f5f9',
              overflow: 'hidden',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background:
                  'linear-gradient(90deg,#16a34a,#22c55e)',
              }}
            />
          </div>

          <p style={{ color: '#64748b' }}>
            {completed} completed of {total} requests
          </p>

          <div
            style={{
              marginTop: '18px',
              padding: '14px',
              background: '#f8fafc',
              borderRadius: '16px',
            }}
          >
            🚛 Next pickup estimated in 25 mins
          </div>
        </div>

        {/* Achievements */}
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
              marginBottom: '16px',
            }}
          >
            Achievements
          </h3>

          <div
            style={{
              display: 'grid',
              gap: '12px',
            }}
          >
            {[
              '🌱 Eco Starter',
              '♻️ Green Citizen',
              '🏆 Top Recycler',
            ].map((badge, i) => (
              <div
                key={i}
                style={{
                  padding: '12px',
                  borderRadius: '14px',
                  background: '#f8fafc',
                  fontWeight: 700,
                }}
              >
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            '1fr 1fr',
          gap: '20px',
        }}
      >
        {/* Quick Actions */}
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
              marginBottom: '16px',
            }}
          >
            Quick Actions
          </h3>

          <div
            style={{
              display: 'grid',
              gap: '12px',
            }}
          >
            {[
              {
                title: 'My Requests',
                path: '/my-requests',
              },
              {
                title: 'Rewards',
                path: '/rewards',
              },
              {
                title: 'Profile',
                path: '/profile',
              },
            ].map((item, i) => (
              <a
                key={i}
                href={item.path}
                style={{
                  padding: '14px',
                  borderRadius: '16px',
                  background: '#f8fafc',
                  textDecoration: 'none',
                  color: '#111827',
                  fontWeight: 700,
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                }}
              >
                {item.title}
                <ArrowRight size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Insights */}
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
              marginBottom: '16px',
            }}
          >
            Smart Insights
          </h3>

          <div
            style={{
              display: 'grid',
              gap: '14px',
            }}
          >
            {[
              {
                icon: <Sparkles size={16} />,
                text: 'Best pickup time: 8AM - 10AM',
              },
              {
                icon: <Truck size={16} />,
                text: 'Average response time: 32 mins',
              },
              {
                icon: <Trophy size={16} />,
                text: 'You rank in top 15% users',
              },
            ].map((tip, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '10px',
                  padding: '12px',
                  borderRadius: '14px',
                  background: '#f8fafc',
                  alignItems: 'center',
                }}
              >
                {tip.icon}
                <span>{tip.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}