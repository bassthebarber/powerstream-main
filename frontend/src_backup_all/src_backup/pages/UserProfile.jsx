import React from "react";
import { useParams } from "react-router-dom";

export default function UserProfile() {
  const { id } = useParams(); // we navigated with author_name for now
  return (
    <main style={{ color:"#ffd88a", padding:"20px" }}>
      <h1>@{id}</h1>
      <p>Profile page coming soon… posts, friends, follow, etc.</p>
    </main>
  );
}


