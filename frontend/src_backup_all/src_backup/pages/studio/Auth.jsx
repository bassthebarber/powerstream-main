import { useState } from 'react';
import axios from 'axios';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await axios.post(endpoint, form);
      localStorage.setItem('studioToken', res.data.token);
      setMessage('Success! You are logged in.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="bg-black text-gold p-6 text-center">
      <h2 className="text-2xl mb-4">{isLogin ? 'Artist Login' : 'Register to Use Studio'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <input name="name" placeholder="Name" onChange={handleChange} className="px-3 py-2" required />
        )}
        <input name="email" placeholder="Email" type="email" onChange={handleChange} className="px-3 py-2" required />
        <input name="password" placeholder="Password" type="password" onChange={handleChange} className="px-3 py-2" required />
        <button type="submit" className="bg-yellow-500 px-4 py-2 rounded text-black">
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      <p className="mt-4">{message}</p>
      <button onClick={() => setIsLogin(!isLogin)} className="text-sm mt-2 underline">
        {isLogin ? 'Need to register?' : 'Already have an account?'}
      </button>
    </div>
  );
};

export default Auth;
