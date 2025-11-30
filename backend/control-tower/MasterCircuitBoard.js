import feedRoutes from '../routes/feedRoutes.js';
import audioRoutes from '../routes/audioRoutes.js';
import videoRoutes from '../routes/videoRoutes.js';
import authRoutes from '../routes/authRoutes.js';
import userRoutes from '../routes/userRoutes.js';
import coinRoutes from '../routes/coinRoutes.js';
import stationRoutes from '../routes/stationRoutes.js';
import streamRoutes from '../routes/streamRoutes.js';
import commandRoutes from '../routes/commandRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';
import uploadRoutes from '../routes/uploadRoutes.js';
import payoutRoutes from '../routes/payoutRoutes.js';
import subscriptionRoutes from '../routes/subscriptionRoutes.js';
import withdrawalRoutes from '../routes/withdrawalRoutes.js';
import intentRoutes from '../routes/intentRoutes.js';
import copilotRoutes from '../routes/copilotRoutes.js';

export function registerServices(app) {
  console.log('🛠️ Master Circuit Board: Initializing all backend service routes...');

  app.use('/api/feed', feedRoutes);
  app.use('/api/audio', audioRoutes);
  app.use('/api/video', videoRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/coins', coinRoutes);
  app.use('/api/stations', stationRoutes);
  app.use('/api/stream', streamRoutes);
  app.use('/api/commands', commandRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/payouts', payoutRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api/withdrawals', withdrawalRoutes);
  app.use('/api/intents', intentRoutes);
  app.use('/api/copilot', copilotRoutes);

  console.log('✅ All routes registered via Master Circuit Board.');
}
