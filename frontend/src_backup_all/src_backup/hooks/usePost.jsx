// frontend/src/hooks/usePost.js
import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient"; // ✅ Updated to correct location

export default function usePost() {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("feed_posts_public")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error.message);
    } else {
      setPosts(data);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    refresh: fetchPosts,
  };
}


