import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

/**
 * Returns latest stories that have not expired.
 * Shape: [{ id, user_id, media_url, caption, created_at, profiles:{display_name,avatar_url} }]
 */
export function useStories(limit = 20) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      const nowISO = new Date().toISOString();

      // join profiles for name/avatar
      const { data, error } = await supabase
        .from("stories")
        .select(`
          id, user_id, media_url, caption, created_at, expires_at,
          profiles:profiles!inner ( display_name, avatar_url )
        `)
        .gt("expires_at", nowISO)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!isMounted) return;
      if (error) {
        console.error("stories error", error);
        setStories([]);
      } else {
        setStories(data || []);
      }
      setLoading(false);
    }

    load();

    // real-time refresh when a new story arrives
    const chan = supabase
      .channel("stories-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "stories" },
        () => load()
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(chan);
    };
  }, [limit]);

  return { stories, loading };
}


