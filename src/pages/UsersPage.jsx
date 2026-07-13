import { useEffect, useState } from 'react'
import { Search, Filter, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetch('http://localhost:5000/api/users')
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err))
  }, [])

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadge = (role) => {
    if (role === 'admin') return <span className="badge badge-danger">Admin</span>
    if (role === 'driver') return <span className="badge badge-warning">Driver</span>
    return <span className="badge badge-success">User</span>
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
        marginBottom: '24px',
        gap: '16px',
        flexWrap: 'wrap'
      }}
    >
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>
          Users
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage platform access and user roles.
        </p>
      </div>

      <button className="btn btn-primary">
        Add User
      </button>
    </div>

    {/* Card */}
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: '22px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--border-card)'
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          padding: '18px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--border-card)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: '280px',
            flex: 1,
            maxWidth: '420px',
            background: 'var(--bg-base)',
            border: '1px solid var(--border-card)',
            borderRadius: '14px',
            padding: '10px 14px'
          }}
        >
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              fontSize: '0.95rem',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <button className="btn btn-secondary">
          <Filter size={14} /> Filter
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg-base)' }}>
            <tr>
              {['User', 'Email', 'Role', 'Rewards', 'Actions'].map((head) => (
                <th
                  key={head}
                  style={{
                    textAlign: head === 'Actions' ? 'right' : 'left',
                    padding: '14px 22px',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 700
                  }}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user._id}
                style={{
                  borderTop: '1px solid var(--border-subtle)'
                }}
              >
                <td style={{ padding: '16px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'var(--primary-green)',
                        color: 'white',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 700
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600 }}>{user.name}</span>
                  </div>
                </td>

                <td style={{ padding: '16px 22px', color: 'var(--text-secondary)' }}>
                  {user.email}
                </td>

                <td style={{ padding: '16px 22px' }}>
                  {getRoleBadge(user.role)}
                </td>

                <td style={{ padding: '16px 22px', fontWeight: 700 }}>
                  {user.rewardPoints} pt
                </td>

                <td style={{ padding: '16px 22px', textAlign: 'right' }}>
                  <button
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-card)',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No users found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '18px 22px',
          borderTop: '1px solid var(--border-card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Showing {filteredUsers.length} of {users.length} users
        </span>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" disabled>
            <ChevronLeft size={14} />
          </button>

          <button className="btn btn-secondary" disabled>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  </div>
)
}