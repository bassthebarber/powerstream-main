// frontend/src/utils/stations/updateStationSchedule.js
export async function updateStationSchedule(stationId, scheduleData) {
  try {
    const res = await fetch(`/api/stations/${stationId}/schedule`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scheduleData)
    });
    if (!res.ok) throw new Error("Failed to update schedule");
    return await res.json();
  } catch (err) {
    console.error("Error updating schedule:", err);
    return null;
  }
}
