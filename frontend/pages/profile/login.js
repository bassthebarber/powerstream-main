import React, { useState } from "react";
import styles from "./login.module.css";

export default function ProfileLogin() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Logging in:", form);
    // TODO: call /api/auth/login
  };

  return (
    <div className={styles.container}>
      <h2>Login to Funny & Paige's Profile</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
