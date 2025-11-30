// backend/hooks/onUploadSuccess.js

exports.onUploadSuccess = async ({ userId, fileUrl, type }) => {
  console.log(`✅ Upload Success: ${type} file by user ${userId}`);
  // Future: Add notification, update activity logs, etc.
};
