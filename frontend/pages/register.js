// pages/register.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      router.push('/feed');
    } else {
      alert('Registration failed');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '80px' }}>
      <img src="/powerfeedlogo.png" alt="PowerFeed" style={{ width: '200px' }} />
      <h2>Create Your PowerFeed Account</h2>
      <form onSubmit={handleRegister}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" /><br />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" /><br />
        <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" /><br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;
