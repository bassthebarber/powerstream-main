// frontend/src/utils/stations/getStationAnalytics.js
export async function getStationAnalytics(stationId) {
  try {
    const res = await fetch(`/api/stations/${stationId}/analytics`);
    if (!res.ok) throw new Error("Failed to fetch analytics");
    return await res.json();
  } catch (err) {
    console.error("Error fetching analytics:", err);
    return null;
  }
}
