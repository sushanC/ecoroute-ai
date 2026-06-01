import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
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
          <h2>Intelligent waste routing for modern cities.</h2>
          <p>Sign in to manage your fleet, track bins, and optimize collection paths in real-time.</p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Login to your account to continue</p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-btn" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Create an account</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
