// pages/login.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      router.push('/feed');
    } else {
      alert('Login failed');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '80px' }}>
      <img src="/powerfeedlogo.png" alt="PowerFeed" style={{ width: '200px' }} />
      <h2>Login to PowerFeed</h2>
      <form onSubmit={handleLogin}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" /><br />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" /><br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
