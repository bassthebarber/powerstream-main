import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient.jsx";

export default function SignIn(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function onSubmit(e){
    e.preventDefault();
    setMsg("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setMsg(error ? error.message : "Signed in!");
  }

  return (
    <div className="auth-wrap">
      <h1>Sign In</h1>
      <form onSubmit={onSubmit} className="auth-form">
        <input required type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input required type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="gold-btn" type="submit">Sign In</button>
      </form>
      {msg && <p className="auth-msg">{msg}</p>}
    </div>
  );
}


