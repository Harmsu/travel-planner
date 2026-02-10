import { useState } from 'react';
import { login } from '../api';

function LoginPage({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError('');
    try {
      await login(password);
      onLogin();
    } catch (err) {
      setError('Väärä salasana');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="spain-flag"></span>
          <h1>Harmsun retki</h1>
          <p>Bilbao ja San Sebastián</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Salasana"
              autoFocus
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? 'Kirjaudutaan...' : 'Kirjaudu'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
