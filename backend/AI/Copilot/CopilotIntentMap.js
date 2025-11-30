export const getIntent = (command = '') => {
  const cmd = command.toLowerCase();

  if (cmd.includes('upload') && cmd.includes('video')) {
    return { action: 'uploadVideo', autoApprove: true };
  }

  if (cmd.includes('reboot system')) {
    return { action: 'rebootSystem', override: true };
  }

  if (cmd.includes('check user')) {
    return { action: 'checkUserStatus', autoApprove: false };
  }

  return null;
};
