// frontend/src/utils/stations/subscribeToStation.js
export async function subscribeToStation(stationId, userId) {
  try {
    const res = await fetch(`/api/stations/${stationId}/subscription/${userId}`, {
      method: "POST"
    });
    if (!res.ok) throw new Error("Failed to subscribe");
    return await res.json();
  } catch (err) {
    console.error("Subscription error:", err);
    return null;
  }
}
