// backend/services/intentService.js (ESM)
export default async function interpretIntent(text) {
  const t = String(text || '').toLowerCase();
  if (!t) return null;

  if (t.includes('hello') || t.includes('hi')) return { action: 'GREET' };
  if (t.includes('feed')) return { action: 'LAUNCH_FEED' };
  if (t.includes('video')) return { action: 'LAUNCH_VIDEO' };
  if (t.includes('audio')) return { action: 'LAUNCH_AUDIO' };
  if (t.includes('reboot')) return { action: 'REBOOT_SYSTEM' };
  if (t.includes('build') && t.includes('powerfeed')) return { action: 'BUILD_POWERFEED' };

  return null;
}
