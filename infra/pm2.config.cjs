// PM2 Ecosystem Configuration
// Production process management for PowerStream

module.exports = {
  apps: [
    // ============================================================
    // MAIN BACKEND API
    // ============================================================
    {
      name: 'powerstream-api',
      script: 'server.js',
      cwd: './backend',
      instances: 'max',  // Use all CPU cores
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5001,
      },
      // Logs
      log_file: './logs/powerstream-api.log',
      out_file: './logs/powerstream-api-out.log',
      error_file: './logs/powerstream-api-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Graceful reload
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      // Health monitoring
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      restart_delay: 4000,
    },
    
    // ============================================================
    // V2 API (New Architecture)
    // ============================================================
    {
      name: 'powerstream-api-v2',
      script: 'src/server.js',
      cwd: './backend',
      instances: 2,  // Fewer instances for v2 during transition
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5003,  // Different port for v2
      },
      // Logs
      log_file: './logs/powerstream-api-v2.log',
      out_file: './logs/powerstream-api-v2-out.log',
      error_file: './logs/powerstream-api-v2-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
    
    // ============================================================
    // ML SERVICE
    // ============================================================
    {
      name: 'powerstream-ml',
      script: 'main.py',
      cwd: './backend/src/ml/python',
      interpreter: 'python3',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',  // ML models can be memory-intensive
      env: {
        ML_SERVICE_PORT: 5200,
        ML_DEBUG: 'false',
      },
      // Logs
      log_file: './logs/powerstream-ml.log',
      out_file: './logs/powerstream-ml-out.log',
      error_file: './logs/powerstream-ml-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    
    // ============================================================
    // RECORDING STUDIO
    // ============================================================
    {
      name: 'powerstream-studio',
      script: 'RecordingStudioServer.js',  // Full server with all routes (not server.js)
      cwd: './backend/recordingStudio',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        STUDIO_PORT: 5100,  // Match frontend expectations
      },
      // Logs
      log_file: './logs/powerstream-studio.log',
      out_file: './logs/powerstream-studio-out.log',
      error_file: './logs/powerstream-studio-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    
    // ============================================================
    // BACKGROUND WORKERS (Optional)
    // ============================================================
    {
      name: 'powerstream-worker',
      script: 'jobs/worker.js',
      cwd: './backend',
      instances: 2,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        WORKER_MODE: 'true',
      },
      // Only start if worker file exists
      ignore_watch: ['node_modules', 'logs'],
      log_file: './logs/powerstream-worker.log',
      out_file: './logs/powerstream-worker-out.log',
      error_file: './logs/powerstream-worker-error.log',
    },
  ],

  // ============================================================
  // DEPLOYMENT CONFIGURATION
  // ============================================================
  deploy: {
    production: {
      user: 'deploy',
      host: ['powerstream.app'],
      ref: 'origin/main',
      repo: 'git@github.com:powerstream/powerstream.git',
      path: '/var/www/powerstream',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload pm2.config.cjs --env production',
      'pre-setup': '',
      env: {
        NODE_ENV: 'production',
      },
    },
    staging: {
      user: 'deploy',
      host: ['staging.powerstream.app'],
      ref: 'origin/develop',
      repo: 'git@github.com:powerstream/powerstream.git',
      path: '/var/www/powerstream-staging',
      'post-deploy': 'npm install && pm2 reload pm2.config.cjs --env development',
      env: {
        NODE_ENV: 'development',
      },
    },
  },
};

