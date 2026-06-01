import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { Plus, Search, RefreshCw, CheckCircle, FileText } from "lucide-react"

export default function UserRequest() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
  name: user?.name || "",
  phone: "",
  address: "",
  wasteTypes: [],
  priority: "High",
  weight: "",
})

  const isAdmin = user?.role === "admin"

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:5000/api/requests")
      if (res.ok) {
        const data = await res.json()
        setRequests(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleChange = (e) => {
  setForm({ ...form, [e.target.id]: e.target.value })
}

// ADD THIS BLOCK HERE
const handleWasteTypeToggle = (type) => {
  setForm((prev) => ({
    ...prev,
    wasteTypes: prev.wasteTypes.includes(type)
      ? prev.wasteTypes.filter((item) => item !== type)
      : [...prev.wasteTypes, type]
  }))
}

const handleSubmit = async () => {
  try {
    setLoading(true)

    const res = await fetch(
      "http://localhost:5000/api/requests",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          location: form.address,
          wasteAmount: Number(form.weight),
          wasteTypes: form.wasteTypes,
          priority: form.priority,
          status: "pending",
        }),
      }
    )

    const data = await res.json()

    console.log("STATUS:", res.status)
    console.log("RESPONSE:", data)

    if (!res.ok) {
      alert(data.message || "Request failed")
      return
    }

    setShowModal(false)
    fetchRequests()
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}
  const handleComplete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" })
      })
      if (res.ok) fetchRequests()
    } catch (error) {
      console.error(error)
    }
  }

  let filtered = requests
  if (!isAdmin) {
    filtered = filtered.filter(req => req.name === user?.name || req.name === "Demo User") // Show user's own requests
  }
  
  if (search) {
    filtered = filtered.filter(req => (req.name || "").toLowerCase().includes(search.toLowerCase()))
  }
  const wasteOptions = [
  "Organic",
  "Recyclable",
  "Plastic",
  "Glass",
  "Metal",
  "E-Waste",
  "Hazardous"
]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{isAdmin ? "All Requests" : "My Requests"}</h1>
          <p>{isAdmin ? "Manage and monitor all pickup requests" : "Track your waste pickup requests"}</p>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-secondary" onClick={fetchRequests} disabled={loading}>
            <RefreshCw size={16} /> Refresh
          </button>
          {!isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> New Request
            </button>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="mb-6 flex gap-4" style={{ width: 300 }}>
          <div className="input-wrapper w-full">
            <input
              className="input"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Waste Type</th>
                <th>Amount</th>
                <th>Priority</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req._id}>
                  <td className="font-semibold">{req.name}</td>
                  <td>{req.phone || "N/A"}</td>
                  <td>{req.location}</td>
                  <td>
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "6px"
    }}
  >
    {(req.wasteTypes || []).map((type) => (
      <span
        key={type}
        className="badge badge-success"
      >
        {type}
      </span>
    ))}
  </div>
</td>
                  <td>{req.wasteAmount} kg</td>
                  <td>
                    <span className={`badge ${req.priority === "High" ? "badge-danger" : req.priority === "Medium" ? "badge-warning" : "badge-neutral"}`}>
                      {req.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${req.status === "completed" ? "badge-success" : req.status === "in-progress" ? "badge-info" : "badge-warning"}`}>
                      {req.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => handleComplete(req._id)}
                        disabled={req.status === "completed"}
                      >
                        <CheckCircle size={14} /> Complete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7}>
                    <div className="empty-state" style={{ border: 'none', padding: '48px 0' }}>
                      <div className="empty-state-icon">
                        <FileText size={24} />
                      </div>
                      <h3>No requests found</h3>
                      <p>There are no requests matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

{showModal && (
  <div
    className="modal-overlay"
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15,23,42,0.45)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 9999,
    }}
  >
    <div
      style={{
        width: '100%',
        maxWidth: '760px',
        background: '#ffffff',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: '0 20px 50px rgba(15,23,42,0.18)',
        border: '1px solid #eef2f7',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '22px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
          New Pickup Request
        </h2>
        <p style={{ color: '#64748b', marginTop: '6px' }}>
          Submit your waste pickup request in MG Road zone.
        </p>
      </div>

      {/* Grid Form */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
          gap: '16px',
        }}
      >
        <div>
          <label className="input-label">Full Name</label>
          <input
            className="input"
            id="name"
            value={form.name}
            disabled
            style={{ background: '#f8fafc' }}
          />
        </div>

        <div>
          <label className="input-label">Phone Number</label>
          <input
            className="input"
            id="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label className="input-label">Pickup Address</label>
          <input
            className="input"
            id="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Enter full address"
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
  <label className="input-label">
    Waste Categories
  </label>

  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      marginTop: "10px"
    }}
  >
    {wasteOptions.map((type) => (
      <button
        key={type}
        type="button"
        onClick={() => handleWasteTypeToggle(type)}
        style={{
          padding: "10px 16px",
          borderRadius: "999px",
          border: form.wasteTypes.includes(type)
            ? "1px solid #16a34a"
            : "1px solid #e5e7eb",
          background: form.wasteTypes.includes(type)
            ? "#dcfce7"
            : "#fff",
          color: form.wasteTypes.includes(type)
            ? "#166534"
            : "#475569",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all .2s"
        }}
      >
        {type}
      </button>
    ))}
  </div>

  {form.wasteTypes.length > 0 && (
    <div
      style={{
        marginTop: "12px",
        display: "flex",
        flexWrap: "wrap",
        gap: "8px"
      }}
    >
      {form.wasteTypes.map((type) => (
        <span
          key={type}
          className="badge badge-success"
        >
          {type}
        </span>
      ))}
    </div>
  )}
</div>

        <div>
          <label className="input-label">Priority</label>
          <select
            className="input"
            id="priority"
            value={form.priority}
            onChange={handleChange}
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        <div>
          <label className="input-label">Estimated Weight</label>
          <input
            className="input"
            id="weight"
            type="number"
            value={form.weight}
            onChange={handleChange}
            placeholder="0 kg"
          />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: '24px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <button
          className="btn btn-secondary"
          onClick={() => setShowModal(false)}
        >
          Cancel
        </button>

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={
  loading ||
  !form.address ||
  !form.weight ||
  form.wasteTypes.length === 0
}
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  )
}