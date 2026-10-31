import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Clock3, FileText, LocateFixed, MapPin, Plus, RefreshCw, Truck, XCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cancelRequest, createRequest, getRequest, getRequests } from '../../services/citizenApi'
import './citizen.css'

const wasteOptions = ['Organic', 'Recyclable', 'Plastic', 'Glass', 'Metal', 'E-Waste', 'Hazardous']
const statusLabel = (status) => ({ 'in-progress': 'In progress', pending: 'Pending', completed: 'Completed', cancelled: 'Cancelled' }[status] || status)
const dateText = (date) => date ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date)) : '—'

function Status({ value }) {
  return <span className={`citizen-status status-${value}`}><span aria-hidden="true" />{statusLabel(value)}</span>
}

function AdminRequests({ token }) {
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setRequests(await getRequests(token)) } catch (err) { setError(err.message) } finally { setLoading(false) }
  }, [token])
  useEffect(() => {
    let current = true
    getRequests(token).then((data) => { if (current) setRequests(data) }).catch((err) => { if (current) setError(err.message) }).finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [token])
  const filtered = requests.filter((item) => `${item.name} ${item.location}`.toLowerCase().includes(search.toLowerCase()))
  const complete = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/requests/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: 'completed' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not update request')
      await load()
    } catch (err) { setError(err.message) }
  }
  return <section className="citizen-page">
    <header className="citizen-page-heading"><div><p className="citizen-eyebrow">Operations</p><h1>Pickup requests</h1><p>Manage incoming collection requests.</p></div><button className="citizen-button secondary" onClick={load} disabled={loading}><RefreshCw size={17} /> Refresh</button></header>
    <label className="citizen-search"><span className="sr-only">Search requests</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or location" /></label>
    {error && <div className="citizen-alert error" role="alert">{error} <button onClick={load}>Retry</button></div>}
    <div className="citizen-table-wrap"><table className="citizen-table"><thead><tr><th>Citizen</th><th>Location</th><th>Waste</th><th>Quantity</th><th>Status</th><th>Submitted</th><th>Action</th></tr></thead><tbody>
      {loading ? <tr><td colSpan="7">Loading requests…</td></tr> : filtered.map((item) => <tr key={item._id}><td>{item.name}</td><td>{item.location}</td><td>{item.wasteTypes?.join(', ')}</td><td>{item.wasteAmount} kg</td><td><Status value={item.status} /></td><td>{dateText(item.createdAt)}</td><td><button className="citizen-button small secondary" disabled={item.status === 'completed'} onClick={() => complete(item._id)}>Mark complete</button></td></tr>)}
      {!loading && !filtered.length && <tr><td colSpan="7">No requests found.</td></tr>}
    </tbody></table></div>
  </section>
}

export default function UserRequest() {
  const { user, token, refreshUser } = useAuth()
  if (user?.role === 'admin') return <AdminRequests token={token} />
  return <CitizenRequests user={user} token={token} refreshUser={refreshUser} />
}

function CitizenRequests({ user, token, refreshUser }) {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [form, setForm] = useState({ phone: '', location: '', lat: '', lng: '', wasteAmount: '', wasteTypes: [] })
  const [locationMessage, setLocationMessage] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await getRequests(token)
      setRequests(data)
      if (requestId) setDetail(await getRequest(token, requestId))
      else setDetail(null)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }, [token, requestId])
  useEffect(() => {
    let current = true
    Promise.all([getRequests(token), requestId ? getRequest(token, requestId) : Promise.resolve(null)])
      .then(([data, selected]) => { if (current) { setRequests(data); setDetail(selected) } })
      .catch((err) => { if (current) setError(err.message) })
      .finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [token, requestId])

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { setLocationMessage('This browser does not support location access. Enter coordinates below.'); return }
    setLocationMessage('Waiting for location permission…')
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setForm((previous) => ({ ...previous, lat: coords.latitude.toFixed(6), lng: coords.longitude.toFixed(6) }))
      setLocationMessage('Coordinates added. Confirm that the pickup address matches this location.')
    }, (err) => setLocationMessage(err.code === 1 ? 'Location permission was not granted. You can enter coordinates manually.' : 'Could not get your location. Enter coordinates manually.'), { enableHighAccuracy: true, timeout: 12000 })
  }

  const submit = async (event) => {
    event.preventDefault(); if (savingRef.current) return
    setError(''); setNotice('')
    const lat = Number(form.lat), lng = Number(form.lng), amount = Number(form.wasteAmount)
    if (!form.location.trim() || !Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180 || !Number.isFinite(amount) || amount <= 0 || !form.wasteTypes.length) {
      setError('Enter a pickup address, valid latitude and longitude, a positive quantity, and at least one waste type.'); return
    }
    savingRef.current = true; setSaving(true)
    try {
      await createRequest(token, { phone: form.phone, location: form.location.trim(), lat, lng, wasteAmount: amount, wasteTypes: form.wasteTypes })
      setNotice('Your pickup request was submitted successfully.')
      setShowForm(false)
      setForm({ phone: '', location: '', lat: '', lng: '', wasteAmount: '', wasteTypes: [] })
      await load(); await refreshUser?.()
    } catch (err) { setError(err.message) } finally { savingRef.current = false; setSaving(false) }
  }

  const cancel = async (item) => {
    if (savingRef.current) return
    savingRef.current = true; setSaving(true); setError(''); setNotice('')
    try { await cancelRequest(token, item._id); setNotice('Request cancelled.'); await load() }
    catch (err) { setError(err.message) } finally { savingRef.current = false; setSaving(false) }
  }

  const filtered = requests.filter((item) => (statusFilter === 'all' || item.status === statusFilter) &&
    (!fromDate || new Date(item.createdAt) >= new Date(`${fromDate}T00:00:00`)) &&
    (!toDate || new Date(item.createdAt) <= new Date(`${toDate}T23:59:59`)))

  if (detail) return <section className="citizen-page">
    <button className="citizen-back" onClick={() => navigate('/my-requests')}><ArrowLeft size={17} /> Back to my requests</button>
    <header className="citizen-page-heading"><div><p className="citizen-eyebrow">Request details</p><h1>Pickup request</h1><p className="request-id">ID: {detail._id}</p></div><Status value={detail.status} /></header>
    <div className="citizen-detail-grid">
      <article className="citizen-card"><h2>Pickup information</h2><dl><dt>Submitted</dt><dd>{dateText(detail.createdAt)}</dd><dt>Pickup address</dt><dd>{detail.location || '—'}</dd><dt>Waste type</dt><dd>{detail.wasteTypes?.join(', ') || '—'}</dd><dt>Quantity</dt><dd>{detail.wasteAmount ?? '—'} kg</dd><dt>Contact phone</dt><dd>{detail.phone || 'Not provided'}</dd></dl></article>
      <article className="citizen-card"><h2>Collection status</h2><div className="tracking-note"><Truck size={22} /><div><strong>{statusLabel(detail.status)}</strong><p>{detail.status === 'pending' ? 'Your request is waiting for collection scheduling.' : detail.status === 'in-progress' ? 'Collection is in progress.' : detail.status === 'completed' ? 'This request is marked completed by the service team.' : 'This request was cancelled.'}</p></div></div><dl><dt>Assigned driver / truck</dt><dd>{detail.driverName || detail.truckId || 'No assignment provided'}</dd><dt>Estimated arrival</dt><dd>{detail.estimatedArrival ? dateText(detail.estimatedArrival) : 'No arrival estimate provided'}</dd><dt>Completion information</dt><dd>{detail.completedAt ? dateText(detail.completedAt) : 'No completion details provided'}</dd></dl>
        {detail.status === 'pending' && <button className="citizen-button danger" disabled={saving} onClick={() => cancel(detail)}><XCircle size={17} /> Cancel request</button>}
      </article>
    </div>
    {error && <div className="citizen-alert error" role="alert">{error}</div>}{notice && <div className="citizen-alert success" role="status">{notice}</div>}
  </section>

  return <section className="citizen-page">
    <header className="citizen-page-heading"><div><p className="citizen-eyebrow">Collection history</p><h1>My pickup requests</h1><p>Track your requests and review previous collections.</p></div><button className="citizen-button primary" onClick={() => setShowForm(true)}><Plus size={18} /> Request pickup</button></header>
    {error && <div className="citizen-alert error" role="alert">{error}<button onClick={load}>Retry</button></div>}{notice && <div className="citizen-alert success" role="status"><CheckCircle2 size={17} />{notice}</div>}
    <div className="citizen-filterbar"><label>Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="pending">Pending</option><option value="in-progress">In progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label><label>From<input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label><label>To<input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} /></label><button className="citizen-button small secondary" onClick={load} disabled={loading}><RefreshCw size={15} /> Refresh</button></div>
    {loading ? <div className="citizen-card citizen-skeleton" aria-label="Loading requests"><div /><div /><div /></div> : filtered.length ? <div className="citizen-request-list">{filtered.map((item) => <article className="citizen-request-row" key={item._id}><div className="request-icon"><FileText size={20} /></div><div className="request-info"><strong>{item.wasteTypes?.join(', ') || 'Pickup request'}</strong><span><MapPin size={14} />{item.location}</span><small>{dateText(item.createdAt)} · {item.wasteAmount} kg</small></div><Status value={item.status} /><Link className="citizen-button small secondary" to={`/my-requests/${item._id}`}>View details</Link></article>)}</div> : <div className="citizen-card citizen-empty"><div className="empty-icon"><Clock3 size={24} /></div><h2>{requests.length ? 'No matching requests' : 'No pickup requests yet'}</h2><p>{requests.length ? 'Try changing your status or date filters.' : 'When you submit a pickup request, its status and details will appear here.'}</p>{requests.length ? <button className="citizen-button secondary" onClick={() => { setStatusFilter('all'); setFromDate(''); setToDate('') }}>Clear filters</button> : <button className="citizen-button primary" onClick={() => setShowForm(true)}><Plus size={18} /> Request your first pickup</button>}</div>}

    {showForm && <div className="citizen-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setShowForm(false) }}><form className="citizen-modal" onSubmit={submit} aria-labelledby="request-form-title"><div className="modal-heading"><div><p className="citizen-eyebrow">New collection</p><h2 id="request-form-title">Request a pickup</h2></div><button type="button" aria-label="Close" className="citizen-icon-button" onClick={() => setShowForm(false)}><XCircle size={20} /></button></div>
      {error && <div className="citizen-alert error" role="alert">{error}</div>}
      <div className="citizen-form-grid"><label>Name<input value={user?.name || ''} readOnly /></label><label>Phone (optional)<input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} autoComplete="tel" /></label><label className="span-all">Pickup address<input required value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Street, building, area" autoComplete="street-address" /></label>
        <div className="span-all coordinate-box"><div><strong>Pickup coordinates</strong><p>Required so the collection team can locate your pickup point.</p></div><button type="button" className="citizen-button small secondary" onClick={useCurrentLocation}><LocateFixed size={16} /> Use my location</button><label>Latitude<input type="number" min="-90" max="90" step="any" required value={form.lat} onChange={(event) => setForm({ ...form, lat: event.target.value })} /></label><label>Longitude<input type="number" min="-180" max="180" step="any" required value={form.lng} onChange={(event) => setForm({ ...form, lng: event.target.value })} /></label><p className="span-all location-help" role="status">{locationMessage}</p></div>
        <fieldset className="span-all"><legend>Waste type <span aria-hidden="true">*</span></legend><div className="waste-options">{wasteOptions.map((type) => <label key={type} className={form.wasteTypes.includes(type) ? 'selected' : ''}><input type="checkbox" checked={form.wasteTypes.includes(type)} onChange={() => setForm((previous) => ({ ...previous, wasteTypes: previous.wasteTypes.includes(type) ? previous.wasteTypes.filter((value) => value !== type) : [...previous.wasteTypes, type] }))} />{type}</label>)}</div></fieldset>
        <label className="span-all">Estimated quantity (kg)<input type="number" min="0.1" step="0.1" required value={form.wasteAmount} onChange={(event) => setForm({ ...form, wasteAmount: event.target.value })} /></label>
      </div><footer className="citizen-modal-actions"><button type="button" className="citizen-button secondary" disabled={saving} onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="citizen-button primary" disabled={saving}>{saving ? 'Submitting…' : 'Submit pickup request'}</button></footer>
    </form></div>}
  </section>
}
