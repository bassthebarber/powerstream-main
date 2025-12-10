// /override/OverrideTestSuite.js
const fs = require('fs');
const path = require('path');

const modulesToTest = [
    'CopilotOverrideCore.js',
    'FailsafeOverride.js',
    'OverrideAIHandler.js',
    'OverrideCommandMapper.js',
    'OverrideEventRouter.js',
    'OverrideKeyMaster.js',
    'OverrideSecurityLayer.js',
    'OverrideSignalSync.js'
];

function testModule(moduleName) {
    try {
        require(path.join(__dirname, moduleName));
        console.log(`✅ ${moduleName} loaded successfully`);
        return true;
    } catch (err) {
        console.error(`❌ ${moduleName} failed: ${err.message}`);
        return false;
    }
}

function runTestSuite() {
    console.log('🚀 Running Override System Test Suite...\n');
    let passed = 0;
    modulesToTest.forEach(module => {
        if (testModule(module)) passed++;
    });
    console.log(`\n📊 ${passed}/${modulesToTest.length} modules loaded successfully.`);
    if (passed !== modulesToTest.length) {
        console.error(`⚠️ Some override modules failed to load! Check logs.`);
    } else {
        console.log(`✅ Override System Integrity: OK`);
    }
}

module.exports = { runTestSuite };
