// SystemBootloader.js
import InfinityCore from "../Infinity/InfinityCore.js";

async function bootSystem() {
  console.log('[🧠 SystemBootloader] PowerStream system boot initiated...');
  await InfinityCore.init();
}

bootSystem();

export default bootSystem;
