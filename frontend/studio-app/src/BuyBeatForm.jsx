import React, { useMemo, useState } from "react";

/**
 * BuyBeatForm
 * Props:
 *  - beatId: string
 *  - beatTitle?: string
 *  - apiBase?: string  (defaults to VITE_API_BASE or window.location.origin + '/api')
 *  - onCheckoutUrl?: (url: string) => void // optional override
 */
export default function BuyBeatForm({
  beatId,
  beatTitle = "Selected Beat",
  apiBase,
  onCheckoutUrl,
}) {
  const API_BASE =
    apiBase ||
    import.meta.env?.VITE_API_BASE ||
    `${window.location.origin}/api`;

  const [tier, setTier] = useState("mp3"); // mp3 | wav | trackouts | exclusive
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const price = useMemo(() => {
    switch (tier) {
      case "mp3":
        return 29;
      case "wav":
        return 59;
      case "trackouts":
        return 149;
      case "exclusive":
        return 800;
      default:
        return 0;
    }
  }, [tier]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setOk("");
    if (!name.trim() || !email.trim()) {
      setErr("Name and email are required.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/beats/${beatId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tier, name, email, coupon }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Checkout failed (${res.status})`);
      }
      const data = await res.json(); // { url: 'https://checkout/...' } or {paymentIntentId,...}
      const url = data.url || data.checkoutUrl;
      if (url) {
        onCheckoutUrl ? onCheckoutUrl(url) : (window.location.href = url);
      } else {
        setOk("Order created. Check your email for the license & download.");
      }
    } catch (e) {
      setErr(e.message || "Could not start checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="buy-beat-form"
      style={{
        display: "grid",
        gap: 12,
        padding: 16,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(0,0,0,0.35)",
        maxWidth: 560,
      }}
    >
      <h3 style={{ margin: 0 }}>Buy License — {beatTitle}</h3>

      <label style={{ display: "grid", gap: 6 }}>
        <span>License Tier</span>
        <select value={tier} onChange={(e) => setTier(e.target.value)}>
          <option value="mp3">MP3 (non-exclusive) — $29</option>
          <option value="wav">WAV (non-exclusive) — $59</option>
          <option value="trackouts">Trackouts (non-exclusive) — $149</option>
          <option value="exclusive">Exclusive — $800</option>
        </select>
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Artist / Purchaser Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Email for receipt & files</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>
      </div>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Coupon (optional)</span>
        <input
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          placeholder="DISCOUNT10"
        />
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ marginLeft: "auto", fontWeight: 700 }}>${price}</div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "#22c55e",
            color: "#000",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading ? "Processing…" : "Continue to Checkout"}
        </button>
      </div>

      {err && <div style={{ color: "#f87171" }}>{err}</div>}
      {ok && <div style={{ color: "#34d399" }}>{ok}</div>}

      <small style={{ opacity: 0.7 }}>
        By purchasing you agree to the license terms. Non-exclusive tiers remain available to others.
      </small>
    </form>
  );
}
