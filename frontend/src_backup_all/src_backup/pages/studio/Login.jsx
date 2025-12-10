import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      alert('Login successful!');
      // Redirect to dashboard (future)
    } else {
      alert(data.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-2xl mb-4">🎧 Artist Login</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-64">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="p-2 rounded" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="p-2 rounded" />
        <button type="submit" className="bg-yellow-500 text-black font-bold py-2 px-4 rounded">Login</button>
      </form>
    </div>
  );
};

export default Login;
