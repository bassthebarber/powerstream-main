export const overrideCommand = (intent, context) => {
  console.log('🚨 Copilot Override Activated:', intent.action);

  switch (intent.action) {
    case 'rebootSystem':
      // Trigger backend restart logic here
      return { message: 'System reboot sequence initiated.' };

    default:
      return { message: 'Override command not recognized.' };
  }
};
