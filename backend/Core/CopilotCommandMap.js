// CopilotCommandMap.js

export const commandMap = {
  '::nolimit broadcast freestyle': {
    action: 'triggerBroadcast',
    system: 'nolimit',
    description: 'Launch NoLimit freestyle stream on frontend and backend'
  },
  '::nolimit lock comments': {
    action: 'lockFanMessages',
    system: 'nolimit',
    description: 'Disable fan message input temporarily'
  },
  '::southernpower override station': {
    action: 'systemOverride',
    system: 'southernPower',
    description: 'Run platform override on a given target station'
  },
  '::southernpower restart studio': {
    action: 'restartSubsystem',
    system: 'recordingStudio',
    description: 'Restarts the full recording studio node'
  }
};
