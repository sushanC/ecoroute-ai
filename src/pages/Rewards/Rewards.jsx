import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Confetti from 'react-confetti'
import {
  Award,
  Gift,
  Trophy,
  Users,
  Search,
  Copy,
  CheckCircle2,
  ChevronRight,
  Star,
} from 'lucide-react'

export default function Rewards() {
  const { user, refreshUser } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [members, setMembers] = useState([])
  const [leaders, setLeaders] = useState([])
  const [history, setHistory] = useState([])
  const [search, setSearch] = useState('')
  const [confetti, setConfetti] = useState(false)
  const [copied, setCopied] = useState(false)
  const [referralInput, setReferralInput] = useState('')

  const points = user?.rewardPoints || 0

  const offers = [
    { key: 'amazon', title: '₹50 Amazon Voucher', cost: 500, tag: 'Popular' },
    { key: 'metro', title: '1 Day Metro Pass', cost: 300, tag: 'Fast' },
    { key: 'coffee', title: 'Free Coffee Coupon', cost: 200, tag: 'Hot' },
    { key: 'tshirt', title: 'EcoRoute T-Shirt', cost: 1000, tag: 'Premium' },
    { key: 'movie', title: 'Movie Ticket', cost: 700, tag: 'New' },
    { key: 'tree', title: 'Plant a Tree', cost: 150, tag: 'Eco' },
    { key: 'grocery', title: 'Grocery Coupon', cost: 450, tag: 'Useful' },
    { key: 'swiggy', title: 'Swiggy Discount', cost: 350, tag: 'Trending' },
  ]

  /* ===================================================== */
  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      const leaderRes = await fetch(
        'http://localhost:5000/api/rewards/leaderboard'
      )
      const leaderData = await leaderRes.json()
      setLeaders(leaderData)

      if (isAdmin) {
        const userRes = await fetch(
          'http://localhost:5000/api/users'
        )
        const users = await userRes.json()
        setMembers(users)
      } else {
        const hisRes = await fetch(
          `http://localhost:5000/api/rewards/history/${user._id}`
        )
        const hisData = await hisRes.json()
        setHistory(hisData)
      }
    } catch (error) {
      console.error(error)
    }
  }

  /* ===================================================== */
  const claimReward = async (rewardKey) => {
    try {
      const res = await fetch(
        'http://localhost:5000/api/rewards/redeem',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user._id,
            redeemType: rewardKey,
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        alert(data.message)
        return
      }

      setConfetti(true)
      setTimeout(() => setConfetti(false), 3500)

      await refreshUser()
      loadData()
    } catch (error) {
      alert('Something went wrong')
    }
  }

  /* ===================================================== */
  const applyReferral = async () => {
    if (!referralInput) return

    try {
      const res = await fetch(
        'http://localhost:5000/api/rewards/referral',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user._id,
            referralCode: referralInput,
          }),
        }
      )

      const data = await res.json()

      alert(data.message)

      if (res.ok) {
        setReferralInput('')
        await refreshUser()
        loadData()
      }
    } catch (error) {
      alert('Failed to apply referral')
    }
  }

  /* ===================================================== */
  const copyCode = async () => {
    await navigator.clipboard.writeText(
      user?.referralCode || ''
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* =====================================================
     ADMIN VIEW
  ===================================================== */
  if (isAdmin) {
    const totalPoints = members.reduce(
      (sum, u) => sum + (u.rewardPoints || 0),
      0
    )

    return (
      <div>
        <div className="page-header">
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
              Rewards Management
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Monitor rewards and top contributors
            </p>
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
              title: 'Members',
              value: members.length,
              icon: <Users size={20} />,
            },
            {
              title: 'Total Points',
              value: totalPoints,
              icon: <Award size={20} />,
            },
            {
              title: 'Top User',
              value: leaders[0]?.name || 'N/A',
              icon: <Trophy size={20} />,
            },
          ].map((card, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg-card)',
                padding: '22px',
                borderRadius: '22px',
                border: '1px solid var(--border-card)',
                boxShadow:
                  'var(--shadow-card)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'var(--status-success-bg)',
                  color: 'var(--status-success)',
                  display: 'grid',
                  placeItems: 'center',
                  marginBottom: '14px',
                }}
              >
                {card.icon}
              </div>

              <p style={{ color: 'var(--text-secondary)' }}>
                {card.title}
              </p>
              <h3
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                }}
              >
                {card.value}
              </h3>
            </div>
          ))}
        </div>

        {/* Members Table */}
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            border: '1px solid var(--border-card)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 22px',
              borderBottom: '1px solid var(--border-card)',
            }}
          >
            <h3 style={{ fontWeight: 800 }}>
              Member Rewards
            </h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}
            >
              <thead style={{ background: 'var(--bg-base)' }}>
                <tr>
                  {[
                    'Name',
                    'Email',
                    'Points',
                    'Claims',
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '14px 20px',
                        textAlign: 'left',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {members.map((m) => (
                  <tr
                    key={m._id}
                    style={{
                      borderTop:
                        '1px solid var(--border-subtle)',
                    }}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      {m.name}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {m.email}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {m.rewardPoints || 0}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {m.totalClaims || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  /* =====================================================
     USER VIEW
  ===================================================== */
  return (
    <div>
      {confetti && <Confetti recycle={false} />}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
            Rewards Marketplace
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Claim offers, track points & grow your rank
          </p>
        </div>
      </div>

      {/* Top Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            '1fr 1fr',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* Points Card */}
        <div
          style={{
            background:
              'linear-gradient(135deg, var(--primary-green), var(--primary-green-light))',
            color: 'white',
            borderRadius: '24px',
            padding: '26px',
          }}
        >
          <Award size={24} />
          <p style={{ marginTop: '12px', opacity: 0.9 }}>
            Available Balance
          </p>
          <h2
            style={{
              fontSize: '3rem',
              fontWeight: 800,
            }}
          >
            {points}
          </h2>
        </div>

        {/* Referral */}
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            padding: '24px',
            border: '1px solid var(--border-card)',
          }}
        >
          <h3
            style={{
              fontWeight: 800,
              marginBottom: '12px',
            }}
          >
            Referral Bonus
          </h3>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.92rem',
              marginBottom: '14px',
            }}
          >
            Invite friends & both earn 100 points
          </p>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '12px',
            }}
          >
            <input
              value={user?.referralCode || ''}
              readOnly
              style={{
                flex: 1,
                height: '44px',
                borderRadius: '12px',
                border: '1px solid var(--border-card)',
                padding: '0 12px',
                color: 'var(--text-primary)',
                background: 'var(--bg-surface)',
              }}
            />

            <button
              onClick={copyCode}
              style={{
                width: '44px',
                border: 'none',
                borderRadius: '12px',
                background: 'var(--primary-green)',
                color: 'white',
              }}
            >
              {copied ? (
                <CheckCircle2 size={18} />
              ) : (
                <Copy size={18} />
              )}
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
            }}
          >
            <input
              placeholder="Enter referral code"
              value={referralInput}
              onChange={(e) =>
                setReferralInput(e.target.value)
              }
              style={{
                flex: 1,
                height: '44px',
                borderRadius: '12px',
                border: '1px solid var(--border-card)',
                padding: '0 12px',
                color: 'var(--text-primary)',
                background: 'var(--bg-surface)',
              }}
            />

            <button
              onClick={applyReferral}
              style={{
                padding: '0 16px',
                border: 'none',
                borderRadius: '12px',
                background: 'var(--text-primary)',
                color: 'var(--bg-surface)',
                fontWeight: 700,
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Offers */}
      <h3
        style={{
          fontSize: '1.1rem',
          fontWeight: 800,
          marginBottom: '16px',
        }}
      >
        Available Offers
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(240px,1fr))',
          gap: '18px',
          marginBottom: '28px',
        }}
      >
        {offers.map((item, i) => {
          const canClaim = points >= item.cost

          return (
            <div
              key={i}
              style={{
                background: 'var(--bg-card)',
                borderRadius: '22px',
                padding: '22px',
                border: '1px solid var(--border-card)',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: 'var(--bg-base)',
                  display: 'grid',
                  placeItems: 'center',
                  marginBottom: '14px',
                }}
              >
                <Gift size={20} />
              </div>

              <h4
                style={{
                  fontWeight: 700,
                  minHeight: '46px',
                }}
              >
                {item.title}
              </h4>

              <p
                style={{
                  color: 'var(--primary-green)',
                  fontWeight: 800,
                  margin: '10px 0 14px',
                }}
              >
                {item.cost} Points
              </p>

              <button
                disabled={!canClaim}
                onClick={() =>
                  claimReward(item.key)
                }
                style={{
                  width: '100%',
                  height: '42px',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 700,
                  cursor: canClaim
                    ? 'pointer'
                    : 'not-allowed',
                  background: canClaim
                    ? 'var(--primary-green)'
                    : 'var(--border-card)',
                  color: canClaim
                    ? 'white'
                    : 'var(--text-muted)',
                }}
              >
                {canClaim
                  ? 'Claim Reward'
                  : `Need ${
                      item.cost - points
                    } pts`}
              </button>
            </div>
          )
        })}
      </div>

      {/* History + Leaderboard */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            '1fr 1fr',
          gap: '20px',
        }}
      >
        {/* History */}
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            padding: '22px',
            border: '1px solid var(--border-card)',
          }}
        >
          <h3
            style={{
              fontWeight: 800,
              marginBottom: '14px',
            }}
          >
            Claim History
          </h3>

          <div
            style={{
              display: 'grid',
              gap: '12px',
            }}
          >
            {history.slice(0, 6).map((h) => (
              <div
                key={h._id}
                style={{
                  padding: '12px',
                  borderRadius: '14px',
                  background: 'var(--bg-base)',
                }}
              >
                <p style={{ fontWeight: 700 }}>
                  {h.benefitType}
                </p>
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                  }}
                >
                  {new Date(
                    h.createdAt
                  ).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            padding: '22px',
            border: '1px solid var(--border-card)',
          }}
        >
          <h3
            style={{
              fontWeight: 800,
              marginBottom: '14px',
            }}
          >
            Leaderboard
          </h3>

          <div
            style={{
              display: 'grid',
              gap: '12px',
            }}
          >
            {leaders.map((l, index) => (
              <div
                key={l._id}
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '14px',
                  background:
                    index === 0
                      ? 'var(--status-success-bg)'
                      : 'var(--bg-base)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background:
                        'var(--primary-green)',
                      color: 'white',
                      display: 'grid',
                      placeItems:
                        'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    #{index + 1}
                  </div>

                  <span
                    style={{
                      fontWeight: 700,
                    }}
                  >
                    {l.name}
                  </span>
                </div>

                <span
                  style={{
                    fontWeight: 800,
                  }}
                >
                  {l.rewardPoints}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}