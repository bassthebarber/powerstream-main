// backend/services/logicEngine.js  (ESM)
import interpretIntent from './intentService.js'; // make sure intentService.js exports default

export async function handleAICommand(transcript, context = {}) {
  console.log('[⚡ logicEngine] Received command:', transcript, 'ctx:', context);

  const intent = await interpretIntent(transcript);
  if (!intent) throw new Error('No valid intent detected.');

  switch (intent.action) {
    case 'GREET':
      return { response: 'Hello from PowerStream Infinity!' };

    case 'LAUNCH_FEED':
      return { command: 'NAVIGATE', target: '/feed' };

    case 'LAUNCH_VIDEO':
      return { command: 'NAVIGATE', target: '/video' };

    case 'LAUNCH_AUDIO':
      return { command: 'NAVIGATE', target: '/audio' };

    case 'REBOOT_SYSTEM':
      return { command: 'RESTART_SERVICES' };

    // Example: build trigger via Copilot
    case 'BUILD_POWERFEED':
      return { command: 'BUILD', target: 'powerfeed', args: { layout: 'default' } };

    default:
      return { response: `Unknown action: ${intent.action}` };
  }
}

// Autopilot “full system” kick-off. Wire this to your real MasterBuildCommand if you want.
export async function ignite(task = 'full-system', actor = 'copilot', meta = {}) {
  console.log(`🚀 Autopilot Ignite -> task=${task}, actor=${actor}, meta=`, meta);
  // TODO: call your real build pipeline here (MasterBuildCommand, etc.)
  return { ok: true, task, actor, startedAt: new Date().toISOString() };
}

export default { handleAICommand, ignite };
