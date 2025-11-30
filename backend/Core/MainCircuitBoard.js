// /backend/core/MainCircuitBoard.js

import { FailSafeEngine } from './FailSafeEngine.js';

...

const MainCircuitBoard = {
  async connectDatabase() {
    FailSafeEngine.wrapStartupTask(async () => {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('🔌 MongoDB Connected');
    }, 'MongoDB_Connection');
  },

  initCloudinary() {
    FailSafeEngine.wrapStartupTask(() => {
      cloudinary.v2.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      console.log('☁️ Cloudinary Initialized');
    }, 'Cloudinary_Init');
  },

  initSystems(app, server) {
    // Replace direct calls with wrapped async routes
    initAuthRoutes(app, FailSafeEngine);
    initFeedRoutes(app, FailSafeEngine);
    initAudioSystem(app, FailSafeEngine);
    initVideoSystem(app, FailSafeEngine);
    initCoinEngine(app, FailSafeEngine);
    initTVStation(app, FailSafeEngine);
    initWithdrawals(app, FailSafeEngine);
    initChatSystem(server);
    console.log('⚙️ All PowerStream Modules Activated');
  },

  boot(app, server) {
    this.connectDatabase();
    this.initCloudinary();
    this.initSystems(app, server);
    FailSafeEngine.monitorProcess();
    console.log('✅ PowerStream Main Circuit Board Fully Engaged');
  },
};

export default MainCircuitBoard;
