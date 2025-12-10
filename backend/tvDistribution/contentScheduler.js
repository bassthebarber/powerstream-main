// ✅ Content Scheduler AI (backend/tvDistribution/contentScheduler.js)

export const scheduleContent = (contentId, startTime, loop = false) => {
  const job = {
    contentId,
    startsAt: new Date(startTime).toISOString(),
    loop,
    createdAt: new Date().toISOString()
  };
  console.log('🗓️ Content Scheduled:', job);
  return job;
};

export default { scheduleContent };
