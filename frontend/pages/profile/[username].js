// pages/profile/[username].js
import React from 'react';
import { useRouter } from 'next/router';

export default function UserProfile() {
  const { username } = useRouter().query;

  return (
    <div className="user-profile">
      <h1>Profile: {username}</h1>
      <p>User's videos, stations, and activity.</p>
      {/* TODO: Fetch user data */}
    </div>
  );
}
