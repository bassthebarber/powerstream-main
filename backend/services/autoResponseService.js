// backend/services/autoResponseService.js
const AutoResponse = require('../models/AutoResponsemodel');

async function addResponse(trigger, reply) {
  const response = new AutoResponse({ trigger, reply });
  return await response.save();
}

async function getAutoReplies() {
  return await AutoResponse.find({});
}

async function findReply(triggerText) {
  const entry = await AutoResponse.findOne({ trigger: triggerText });
  return entry ? entry.reply : null;
}

module.exports = {
  addResponse,
  getAutoReplies,
  findReply,
};
