// backend/services/autoResponseService.js
import AutoResponse from "../models/AutoResponsemodel.js";

export async function addResponse(trigger, reply) {
  const response = new AutoResponse({ trigger, reply });
  return await response.save();
}

export async function getAutoReplies() {
  return await AutoResponse.find({});
}

export async function findReply(triggerText) {
  const entry = await AutoResponse.findOne({ trigger: triggerText });
  return entry ? entry.reply : null;
}

export default {
  addResponse,
  getAutoReplies,
  findReply,
};
