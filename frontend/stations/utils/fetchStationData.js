// frontend/src/utils/stations/fetchStationData.js
export async function fetchStationData(stationId) {
  try {
    const res = await fetch(`/api/stations/${stationId}`);
    if (!res.ok) throw new Error("Failed to fetch station data");
    return await res.json();
  } catch (err) {
    console.error("Error fetching station data:", err);
    return null;
  }
}
