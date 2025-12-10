// /override/OverrideHotReload.js
const path = require('path');

function hotReload(moduleName) {
    try {
        const modulePath = path.join(__dirname, moduleName);
        delete require.cache[require.resolve(modulePath)];
        const reloadedModule = require(modulePath);
        console.log(`♻️ Hot Reloaded: ${moduleName}`);
        return reloadedModule;
    } catch (err) {
        console.error(`❌ Failed to hot reload ${moduleName}: ${err.message}`);
        return null;
    }
}

module.exports = { hotReload };
