import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, User, Mail, Lock, Shield, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import '../Login/Auth.css'; 

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await register(name, email, password, role);
    if (!result.success) {
      setError(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="auth-layout">
      {/* Left Branding Panel */}
      <div className="auth-left">
        <div className="auth-branding">
          <div style={{ background: 'white', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={24} color="var(--primary-green-dark)" />
          </div>
          EcoRoute AI
        </div>
        <div className="auth-quote">
          <h2>Join the clean city initiative.</h2>
          <p>Create an account to track waste pickups, earn rewards, and contribute to a sustainable future.</p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Get started with your free account</p>
          </div>

          {error && (
            <div className="auth-error animate-fade-in">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-icon-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  className="input auth-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="input auth-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  className="input auth-input"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="form-group">
  <label>Select Role</label>
  <div className="input-icon-wrapper">
    <Shield size={18} className="input-icon" />
    <select
      className="auth-input"
      value={role}
      onChange={(e) => setRole(e.target.value)}
      style={{ appearance: 'none', cursor: 'pointer' }}
    >
      <option value="user">Citizen / User</option>
      <option value="admin">City Admin</option>
    </select>
  </div>
</div>

            <button type="submit" className="btn btn-primary auth-btn" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
