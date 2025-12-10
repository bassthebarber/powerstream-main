import { useEffect, useState } from "react";
import { fetchNotifications } from "../../services/feedExtras";
import { supabase } from "../../supabaseClient";

export default function NotificationBell({ userId = "anon" }) {
  const [count, setCount] = useState(0);

  async function refresh() {
    const rows = await fetchNotifications(userId);
    const unread = rows.filter(r => !r.read).length;
    setCount(unread);
  }

  useEffect(() => {
    refresh();
    const ch = supabase
      .channel("feed_notifications:insert")
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "feed_notifications" },
        () => refresh()
      )
      .subscribe();
    return () => { try { ch.unsubscribe(); } catch {} };
  }, []);

  return (
    <button onClick={refresh} style={{ position:"relative" }}>
      🔔
      {count > 0 && (
        <span style={{
          position:"absolute", top:-6, right:-6,
          background:"#ff8a29", color:"#000",
          borderRadius:999, padding:"2px 6px", fontSize:12, fontWeight:700
        }}>{count}</span>
      )}
    </button>
  );
}


