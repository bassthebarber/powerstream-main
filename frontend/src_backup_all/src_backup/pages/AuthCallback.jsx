import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const nav = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => nav('/'), 800);
    return () => clearTimeout(t);
  }, []);
  return <div style={{color:'#FFD700', textAlign:'center', marginTop:80}}>Signing you in…</div>;
}


