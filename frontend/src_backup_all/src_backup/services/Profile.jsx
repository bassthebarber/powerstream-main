// frontend/src/services/Profile.jsx

export const getUserProfile = async (id) => {
  const res = await fetch(`/api/profile/${id}`);
  return await res.json();
};


