// frontend/hooks/UseStreamSchedule.js
import { useState } from 'react';

export default function useStreamSchedule() {
  const [schedule, setSchedule] = useState([]);

  const addScheduleItem = (title, date, time) => {
    if (!title || !date || !time) return;
    const newItem = { title, date, time };
    setSchedule((prev) => [...prev, newItem]);
    console.log('Scheduled:', newItem);
  };

  const removeScheduleItem = (index) => {
    setSchedule((prev) => prev.filter((_, idx) => idx !== index));
  };

  return {
    schedule,
    addScheduleItem,
    removeScheduleItem,
  };
}


