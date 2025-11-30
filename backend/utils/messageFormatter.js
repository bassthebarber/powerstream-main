// backend/utils/messageFormatter.js

/**
 * Format a message with full metadata
 * @param {Object} options - message options
 * @returns {Object}
 */
function formatMessage({
  senderId,
  receiverId,
  message,
  type = 'text',
  roomId = null,
  isAI = false,
  replyTo = null,
  attachments = [],
}) {
  const timestamp = new Date().toISOString();

  return {
    senderId,
    receiverId,
    content: message,
    type,
    roomId,
    isAI,
    replyTo,           // messageId it replies to
    attachments,       // array of media links
    sentAt: timestamp,
    deliveredAt: null,
    readAt: null,
    status: 'sent',
  };
}

module.exports = formatMessage;
