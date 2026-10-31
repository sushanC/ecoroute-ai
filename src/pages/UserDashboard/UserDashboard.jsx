import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Award, CheckCircle2, Clock3, Leaf, Plus, Truck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getCurrentUser, getRequests, getRewardHistory } from '../../services/citizenApi'
import '../UserRequest/citizen.css'
import './UserDashboard.css'

const dateText = (date) => date ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(date)) : '—'
const statusName = (status) => ({ 'in-progress': 'In progress', pending: 'Pending', completed: 'Completed', cancelled: 'Cancelled' }[status] || status)

export default function UserDashboard() {
  const { user, token } = useAuth()
  const [requests, setRequests] = useState([])
  const [rewards, setRewards] = useState([])
  const [rewardBalance, setRewardBalance] = useState(user?.rewardPoints ?? 0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [requestData, rewardData, currentUser] = await Promise.all([getRequests(token), getRewardHistory(token, user?._id), getCurrentUser(token)])
      setRequests(requestData); setRewards(rewardData); setRewardBalance(currentUser.rewardPoints ?? 0)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }, [token, user])
  useEffect(() => {
    let current = true
    Promise.all([getRequests(token), getRewardHistory(token, user?._id), getCurrentUser(token)])
      .then(([requestData, rewardData, currentUser]) => { if (current) { setRequests(requestData); setRewards(rewardData); setRewardBalance(currentUser.rewardPoints ?? 0) } })
      .catch((err) => { if (current) setError(err.message) })
      .finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [token, user])

  const pending = requests.filter((item) => item.status === 'pending').length
  const inProgress = requests.filter((item) => item.status === 'in-progress').length
  const completed = requests.filter((item) => item.status === 'completed').length
  const recent = requests.slice(0, 4)

  return <section className="citizen-page dashboard-citizen">
    <header className="citizen-page-heading"><div><p className="citizen-eyebrow">Citizen dashboard</p><h1>Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1><p>Arrange a pickup and follow your collection requests.</p></div><Link className="citizen-button primary" to="/my-requests"><Plus size={18} /> Request pickup</Link></header>
    {error && <div className="citizen-alert error" role="alert">{error}<button onClick={load}>Retry</button></div>}
    <section className="citizen-summary-grid" aria-label="Pickup request summary">
      {[
        { title: 'Pending', value: pending, icon: <Clock3 size={20} />, accent: 'amber' },
        { title: 'In progress', value: inProgress, icon: <Truck size={20} />, accent: 'blue' },
        { title: 'Completed', value: completed, icon: <CheckCircle2 size={20} />, accent: 'green' },
      ].map((card) => <article key={card.title} className="citizen-summary-card"><span className={`summary-icon ${card.accent}`}>{card.icon}</span><div><p>{card.title}</p><strong>{loading ? '—' : card.value}</strong></div></article>)}
    </section>
    <section className="citizen-reward-banner"><div className="reward-symbol"><Award size={24} /></div><div><p>Your rewards balance</p><strong>{loading ? '—' : rewardBalance} <span>points</span></strong><small>Earned and redeemed rewards are reflected in your account balance.</small></div><Link to="/rewards">View rewards <ArrowRight size={16} /></Link></section>
    <div className="citizen-dashboard-columns">
      <section className="citizen-card recent-card"><div className="citizen-section-heading"><div><h2>Recent pickup requests</h2><p>Latest updates from your request history.</p></div><Link to="/my-requests">View all <ArrowRight size={15} /></Link></div>
        {loading ? <div className="citizen-skeleton" aria-label="Loading requests"><div /><div /><div /></div> : recent.length ? <div className="dashboard-request-list">{recent.map((item) => <Link key={item._id} className="dashboard-request" to={`/my-requests/${item._id}`}><span className="request-icon"><Leaf size={18} /></span><span className="dashboard-request-text"><strong>{item.wasteTypes?.join(', ') || 'Pickup request'}</strong><small>{item.location} · {dateText(item.createdAt)}</small></span><span className={`citizen-status status-${item.status}`}><span aria-hidden="true" />{statusName(item.status)}</span></Link>)}</div> : <div className="citizen-empty compact"><div className="empty-icon"><Clock3 size={22} /></div><h2>No pickup requests yet</h2><p>Once you submit a request, its latest status will appear here.</p><Link className="citizen-button primary" to="/my-requests"><Plus size={16} /> Request a pickup</Link></div>}
      </section>
      <section className="citizen-card reward-history-card"><div className="citizen-section-heading"><div><h2>Rewards activity</h2><p>Recent points added or redeemed.</p></div><Award size={20} className="history-award" /></div>
        {loading ? <div className="citizen-skeleton" aria-label="Loading reward activity"><div /><div /></div> : rewards.length ? <ul className="reward-history-list">{rewards.slice(0, 5).map((reward) => <li key={reward._id}><span><strong>{reward.benefitType}</strong><small>{dateText(reward.createdAt)}</small></span><b className={reward.points < 0 ? 'deducted' : ''}>{reward.points > 0 ? '+' : ''}{reward.points}</b></li>)}</ul> : <div className="reward-empty"><Award size={22} /><p>No reward activity recorded yet.</p></div>}
        <Link className="rewards-link" to="/rewards">Explore rewards <ArrowRight size={15} /></Link>
      </section>
    </div>
    {!loading && !requests.length && <div className="dashboard-help-note"><Leaf size={17} /> Your request list and collection counts update when the backend records new activity. No estimated arrival is shown until the service provides one.</div>}
    {error && <button className="citizen-button small secondary dashboard-refresh" onClick={load}>Retry loading data</button>}
  </section>
}
