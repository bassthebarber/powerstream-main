import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

/**
 * Returns { loading, me } where me = { id, name, avatar }
 * Expects a `profiles` table with columns: id(uuid auth id), full_name, avatar_url
 */
export default function useMe() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (!cancelled) { setMe(null); setLoading(false); } return; }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (!cancelled) {
        setMe({
          id: user.id,
          name: data?.full_name || user.email?.split("@")[0] || "You",
          avatar: data?.avatar_url || "/logos/powerstream-logo.png",
        });
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { loading, me };
}


