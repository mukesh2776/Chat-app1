
import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      console.log('Registering:', username, email, password);

      await axios.post("http://localhost:5000/api/register", { username, email, password });
      router.push('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-image">
          <img src="/profile-image.jpg" alt="Register" />
        </div>
        <div className="auth-form">
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
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
            <button className="btn primary-btn" type="submit">Register</button>
          </form>
          <p className="small-text">
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}
