// PM2 Ecosystem Configuration for PowerStream
// Production cluster mode with auto-scaling

module.exports = {
  apps: [
    // ========================================
    // MAIN API SERVER
    // ========================================
    {
      name: 'powerstream-api',
      script: './backend/server.js',
      cwd: process.env.APP_ROOT || '/var/www/powerstream',
      
      // Cluster Mode Configuration
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      
      // Environment
      node_args: '--experimental-specifier-resolution=node',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001,
      },
      
      // Auto-restart Configuration
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 3000,
      
      // Graceful Shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Logging
      log_file: '/var/log/powerstream/api-combined.log',
      out_file: '/var/log/powerstream/api-out.log',
      error_file: '/var/log/powerstream/api-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Health Monitoring
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Source Maps
      source_map_support: true,
    },
    
    // ========================================
    // STUDIO API SERVER
    // ========================================
    {
      name: 'powerstream-studio',
      script: './backend/recordingStudio/RecordingStudioServer.js',
      cwd: process.env.APP_ROOT || '/var/www/powerstream',
      
      // Cluster Mode (fewer instances for studio)
      instances: 2,
      exec_mode: 'cluster',
      
      // Environment
      node_args: '--experimental-specifier-resolution=node',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5100,
      },
      
      // Auto-restart Configuration
      watch: false,
      max_memory_restart: '2G', // Studio uses more memory
      restart_delay: 3000,
      
      // Graceful Shutdown
      kill_timeout: 10000, // Longer for audio processing
      wait_ready: true,
      listen_timeout: 15000,
      
      // Logging
      log_file: '/var/log/powerstream/studio-combined.log',
      out_file: '/var/log/powerstream/studio-out.log',
      error_file: '/var/log/powerstream/studio-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Health Monitoring
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
  
  // ========================================
  // DEPLOYMENT CONFIGURATION
  // ========================================
  deploy: {
    production: {
      user: 'deploy',
      host: ['api1.powerstream.tv', 'api2.powerstream.tv'],
      ref: 'origin/main',
      repo: 'git@github.com:yourorg/powerstream.git',
      path: '/var/www/powerstream',
      
      'pre-deploy-local': '',
      
      'post-deploy': `
        npm ci --production &&
        npm run build:backend &&
        pm2 reload ecosystem.config.cjs --env production
      `,
      
      'pre-setup': `
        mkdir -p /var/log/powerstream &&
        mkdir -p /var/www/powerstream/uploads
      `,
      
      env: {
        NODE_ENV: 'production',
      },
    },
    
    staging: {
      user: 'deploy',
      host: 'staging.powerstream.tv',
      ref: 'origin/develop',
      repo: 'git@github.com:yourorg/powerstream.git',
      path: '/var/www/powerstream-staging',
      
      'post-deploy': `
        npm ci &&
        npm run build:backend &&
        pm2 reload ecosystem.config.cjs --env staging
      `,
      
      env: {
        NODE_ENV: 'staging',
      },
    },
  },
};


