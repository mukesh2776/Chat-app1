import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res =await axios.post("https://chat-app1-backend.onrender.com/api/login", { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.user.username);
      router.push('/chat');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-image">
          <img src="/profile-image.jpg" alt="Welcome" />
        </div>
        <div className="auth-form">
          <h2>Log in</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="btn primary-btn" type="submit">Login</button>
          </form>
          <p className="small-text">
            Don’t have an account? <a href="/register">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}
