// backend/hooks/onUploadSuccess.js

export async function onUploadSuccess({ userId, fileUrl, type }) {
  console.log(`✅ Upload Success: ${type} file by user ${userId}`);
  // Future: Add notification, update activity logs, etc.
}

export default { onUploadSuccess };
