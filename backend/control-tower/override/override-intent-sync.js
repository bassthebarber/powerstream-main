// backend/control-tower/override/override-intent-sync.js
const intentProcessor = require("../../ai/intentProcessor");
const overrideRouter = require("./override-router");

module.exports = {
    async processOverrideIntent(intent, context = {}) {
        console.log(`🎯 [OverrideIntentSync] Processing intent: ${intent}`);
        const mappedCommand = intentProcessor.mapIntentToCommand(intent);
        if (mappedCommand) {
            await overrideRouter.routeCommand(mappedCommand, context);
            console.log(`✅ Override executed for intent: ${intent}`);
        } else {
            console.log(`⚠️ No matching override command for intent: ${intent}`);
        }
    }
};
