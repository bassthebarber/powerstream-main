// /override/OverrideDependencyCheck.js
const path = require('path');

const requiredModules = [
    'CopilotOverrideCore.js',
    'FailsafeOverride.js',
    'OverrideCommandMapper.js',
    'OverrideEventRouter.js',
    'OverrideSecurityLayer.js'
];

function checkDependencies() {
    console.log('🔍 Checking Override Dependencies...');
    let allGood = true;

    requiredModules.forEach(moduleName => {
        try {
            require(path.join(__dirname, moduleName));
            console.log(`✅ Found dependency: ${moduleName}`);
        } catch (err) {
            console.error(`❌ Missing dependency: ${moduleName}`);
            allGood = false;
        }
    });

    if (!allGood) {
        console.error('🚨 Missing dependencies detected! Override cannot start.');
        return false;
    }

    console.log('✅ All Override Dependencies Present.');
    return true;
}

module.exports = { checkDependencies };
