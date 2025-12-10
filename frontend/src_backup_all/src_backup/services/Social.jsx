// frontend/src/services/Social.jsx

export const getFriends = async () => {
  const res = await fetch("/api/social/friends");
  return await res.json();
};


