// SystemBootloader.js
const InfinityCore = require('../Infinity/InfinityCore');

async function bootSystem() {
  console.log('[🧠 SystemBootloader] PowerStream system boot initiated...');
  await InfinityCore.init();
}

bootSystem();
