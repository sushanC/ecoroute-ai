import { useState, useEffect } from 'react'
import { Trash2, RefreshCw, Plus, MapPin } from 'lucide-react'

export default function SmartBins() {
  const [bins, setBins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    binId: '',
    location: '',
    fillLevel: '',
    lat: '',
    lng: '',
    status: 'LOW',
  })

  const fetchBins = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/bins')
      if (res.ok) {
        const data = await res.json()
        setBins(data)
      }
    } catch (error) {
      console.error('Failed to fetch bins', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBins()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAddBin = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:5000/api/bins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fillLevel: Number(formData.fillLevel),
          lat: Number(formData.lat),
          lng: Number(formData.lng),
        }),
      })

      if (res.ok) {
        setShowForm(false)
        setFormData({ binId: '', location: '', fillLevel: '', lat: '', lng: '', status: 'LOW' })
        fetchBins()
      } else {
        alert('Failed to add bin')
      }
    } catch (error) {
      console.error(error)
      alert('Server error')
    }
  }

  const handleEmptyBin = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bins/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fillLevel: 0, status: 'LOW' }),
      })
      if (res.ok) fetchBins()
    } catch (error) {
      console.error('Failed to empty bin', error)
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'LOW': return 'badge-success'
      case 'MEDIUM': return 'badge-info'
      case 'HIGH': return 'badge-warning'
      case 'OVERFLOW': return 'badge-danger'
      default: return 'badge-neutral'
    }
  }

  const getProgressBarColor = (fill) => {
    if (fill >= 91) return 'var(--status-danger)'
    if (fill >= 71) return 'var(--status-warning)'
    if (fill >= 31) return 'var(--status-info)'
    return 'var(--status-success)'
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Smart Bins</h1>
          <p>Monitor and manage MG Road smart bin network</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary" onClick={fetchBins} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={14} /> Add Bin
          </button>
        </div>
      </div>

{showForm && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15,23,42,0.45)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}
  >
    <div
      style={{
        width: '100%',
        maxWidth: '760px',
        background: '#ffffff',
        borderRadius: '22px',
        padding: '28px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}
    >
      <h2
        style={{
          fontSize: '28px',
          fontWeight: 700,
          marginBottom: '22px',
          color: '#0f172a'
        }}
      >
        Add Smart Bin
      </h2>

      <form onSubmit={handleAddBin}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '18px'
          }}
        >
          {[
            ['Bin ID', 'binId', 'text', 'e.g. BIN-001'],
            ['Location', 'location', 'text', 'e.g. MG Road Metro'],
            ['Fill Level (%)', 'fillLevel', 'number', '0-100'],
            ['Latitude', 'lat', 'number', '12.9716'],
            ['Longitude', 'lng', 'number', '77.5946']
          ].map(([label, name, type, placeholder]) => (
            <div key={name}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                {label}
              </label>
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={formData[name]}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          ))}

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '15px'
              }}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="OVERFLOW">OVERFLOW</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px'
          }}
        >
          <button
            type="button"
            onClick={() => setShowForm(false)}
            style={{
              padding: '12px 18px',
              borderRadius: '12px',
              border: '1px solid #d1d5db',
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            style={{
              padding: '12px 18px',
              borderRadius: '12px',
              border: 'none',
              background: '#16a34a',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Save Bin
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      <div className="grid grid-cols-4">
        {bins.map((bin) => (
          <div key={bin._id} className="card flex flex-col justify-between" style={{ padding: '20px' }}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 style={{ fontSize: '1.125rem', color: 'var(--text-primary)' }}>{bin.binId}</h3>
                  <div className="flex items-center gap-1 text-sm text-secondary mt-1">
                    <MapPin size={12} /> {bin.location}
                  </div>
                </div>
                <span className={`badge ${getStatusBadgeClass(bin.status)}`}>{bin.status}</span>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-secondary">Fill Level</span>
                  <span className="font-bold text-primary">{bin.fillLevel}%</span>
                </div>
                <div className="progress-bar-wrapper">
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: `${bin.fillLevel}%`, 
                      background: getProgressBarColor(bin.fillLevel)
                    }} 
                  />
                </div>
              </div>
            </div>

            <button 
              className="btn btn-secondary w-full" 
              onClick={() => handleEmptyBin(bin._id)}
              disabled={bin.fillLevel === 0}
              style={{ justifyContent: 'center' }}
            >
              <Trash2 size={14} /> Empty Bin
            </button>
          </div>
        ))}

        {bins.length === 0 && !loading && (
          <div style={{ gridColumn: 'span 4' }}>
            <div className="empty-state">
              <div className="empty-state-icon">
                <Trash2 size={24} />
              </div>
              <h3>No bins deployed</h3>
              <p>Add a smart bin to start monitoring fill levels.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}