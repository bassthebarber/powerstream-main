export default function transferOwnership(currentOwnerId, newOwnerId) {
  if (!currentOwnerId || !newOwnerId) {
    throw new Error("Missing ownership transfer parameters");
  }

  // Example API call to backend
  return fetch(`/api/security/transfer-ownership`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentOwnerId, newOwnerId })
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to transfer ownership");
      return res.json();
    })
    .catch(err => {
      console.error("Ownership transfer failed:", err);
      throw err;
    });
}
