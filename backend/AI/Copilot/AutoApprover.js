export const autoApprove = (intent, context) => {
  const user = context.user || { role: 'guest' };

  if (user.role === 'admin') {
    return { allowed: true };
  }

  if (intent.action === 'uploadVideo' && user.role === 'creator') {
    return { allowed: true };
  }

  return { allowed: false, reason: 'Insufficient permissions' };
};
