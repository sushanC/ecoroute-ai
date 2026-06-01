import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  Truck as TruckIcon,
  MapPin,
  CheckCircle,
  Plus,
  Info,
} from 'lucide-react'

export default function TruckManagement() {
  const { user } = useAuth()

  const [trucks, setTrucks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    truckId: '',
    capacity: '',
    currentLoad: '',
    lat: '',
    lng: '',
    route: '',
    status: 'Available',
  })

  const isAdmin = user?.role === 'admin'

  const fetchTrucks = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/trucks')
      if (res.ok) {
        let data = await res.json()

        // Driver sees only one truck
        if (!isAdmin) {
          data = data.filter((t) => t.truckId === 'TRK-01')
        }

        setTrucks(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrucks()
  }, [isAdmin])

  const handleChange = (e) =>
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })

  const handleAddTruck = async (e) => {
    e.preventDefault()

    try {
      const res = await fetch('http://localhost:5000/api/trucks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacity: Number(formData.capacity),
          currentLoad: Number(formData.currentLoad),
          lat: Number(formData.lat),
          lng: Number(formData.lng),
        }),
      })

      if (res.ok) {
        setShowForm(false)
        setFormData({
          truckId: '',
          capacity: '',
          currentLoad: '',
          lat: '',
          lng: '',
          route: '',
          status: 'Available',
        })
        fetchTrucks()
      } else {
        alert('Failed to add truck')
      }
    } catch (error) {
      console.error(error)
      alert('Server error')
    }
  }

  return (
    <div>
      {/* Header */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
            {isAdmin ? 'Truck Management' : 'Driver Panel'}
          </h1>

          <p style={{ color: '#64748b', marginTop: '6px' }}>
            {isAdmin
              ? 'Monitor active fleet and assignments'
              : 'Manage your assigned truck and route'}
          </p>
        </div>

        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={14} /> Add Truck
          </button>
        )}
      </div>

      {/* Add Truck Modal */}
      {isAdmin && showForm && (
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
            padding: '20px',
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
              overflowY: 'auto',
            }}
          >
            <h2
              style={{
                fontSize: '28px',
                fontWeight: 700,
                marginBottom: '22px',
              }}
            >
              Add Truck
            </h2>

            <form onSubmit={handleAddTruck}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '18px',
                }}
              >
                {[
                  ['Truck ID', 'truckId', 'text', 'TRK-003'],
                  ['Route Name', 'route', 'text', 'MG Road Route'],
                  ['Capacity (kg)', 'capacity', 'number', '500'],
                  ['Current Load (kg)', 'currentLoad', 'number', '0'],
                  ['Latitude', 'lat', 'number', '12.9716'],
                  ['Longitude', 'lng', 'number', '77.5946'],
                ].map(([label, name, type, placeholder]) => (
                  <div key={name}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 600,
                      }}
                    >
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
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                ))}

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: 600,
                    }}
                  >
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
                      fontSize: '15px',
                    }}
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  marginTop: '24px',
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
                    cursor: 'pointer',
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
                    cursor: 'pointer',
                  }}
                >
                  Save Truck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {trucks.map((truck) => {
          const percent = (truck.currentLoad / truck.capacity) * 100

          return (
            <div
              key={truck._id}
              style={{
                padding: '24px',
                borderRadius: '22px',
                background: '#ffffff',
                border: '1px solid #eef2f7',
                boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
              }}
            >
              {/* Top */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '14px',
                  paddingBottom: '18px',
                  marginBottom: '18px',
                  borderBottom: '1px solid #eef2f7',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      background: '#dcfce7',
                      color: '#16a34a',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <TruckIcon size={22} />
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                      {truck.truckId}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.9rem',
                        color: '#64748b',
                        marginTop: '4px',
                      }}
                    >
                      Capacity: {truck.capacity} kg
                    </p>
                  </div>
                </div>

                <span
                  className={`badge ${
                    truck.status === 'Available'
                      ? 'badge-success'
                      : truck.status === 'Busy'
                      ? 'badge-warning'
                      : 'badge-danger'
                  }`}
                >
                  {truck.status}
                </span>
              </div>

              {/* Route */}
              <div style={{ marginBottom: '20px' }}>
                <p
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: '#64748b',
                  }}
                >
                  Current Route
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: '#f8fafc',
                    border: '1px solid #eef2f7',
                  }}
                >
                  <MapPin size={16} color="#16a34a" />
                  <span style={{ fontWeight: 600 }}>
                    {truck.route}
                  </span>
                </div>
              </div>

              {/* Load */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    fontSize: '0.92rem',
                  }}
                >
                  <span style={{ color: '#64748b', fontWeight: 600 }}>
                    Current Load
                  </span>

                  <span style={{ fontWeight: 700 }}>
                    {truck.currentLoad} / {truck.capacity} kg
                  </span>
                </div>

                <div
                  style={{
                    height: '10px',
                    borderRadius: '999px',
                    background: '#e5e7eb',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${percent}%`,
                      height: '100%',
                      background:
                        percent >= 90 ? '#ef4444' : '#16a34a',
                    }}
                  />
                </div>
              </div>

              {/* Driver Button */}
              {!isAdmin && (
                <div
                  style={{
                    marginTop: '22px',
                    paddingTop: '18px',
                    borderTop: '1px solid #eef2f7',
                  }}
                >
                  <button
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircle size={16} />
                    Mark Route Completed
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Empty */}
        {trucks.length === 0 && !loading && (
          <div
            style={{
              gridColumn: '1 / -1',
              background: '#fff',
              borderRadius: '20px',
              padding: '40px',
              textAlign: 'center',
              border: '1px solid #eef2f7',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 14px',
                borderRadius: '16px',
                background: '#f1f5f9',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Info size={24} />
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              No trucks assigned
            </h3>

            <p style={{ color: '#64748b', marginTop: '8px' }}>
              There are currently no active trucks in the fleet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}