import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../Loader/Loader';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // Wait while session loads
  if (loading) {
    return <Loader message="Verifying session..." />;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Normalize role
  const userRole = String(user.role).toLowerCase().trim();

  // Role check
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(userRole)
  ) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          background: '#f8fafc',
          color: '#dc2626',
        }}
      >
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>

        <button
          onClick={() => window.history.back()}
          style={{
            marginTop: '16px',
            padding: '10px 16px',
            border: 'none',
            borderRadius: '8px',
            background: '#16a34a',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return children;
}