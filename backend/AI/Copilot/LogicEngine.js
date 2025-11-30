export const executeLogic = async (intent, context) => {
  console.log(`⚙️ Executing logic for action: ${intent.action}`);

  switch (intent.action) {
    case 'uploadVideo':
      return { message: 'Uploading video now...' };

    case 'checkUserStatus':
      return { user: context.user || 'anonymous', status: 'active' };

    default:
      return { message: 'No matching logic found.' };
  }
};
