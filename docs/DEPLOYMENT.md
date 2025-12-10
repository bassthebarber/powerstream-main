# PowerStream Deployment Guide

This guide covers deploying the PowerStream platform to a production environment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Recording Studio Deployment](#recording-studio-deployment)
- [RTMP Streaming Setup](#rtmp-streaming-setup)
- [Nginx Configuration](#nginx-configuration)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [PM2 Process Management](#pm2-process-management)
- [Health Checks & Monitoring](#health-checks--monitoring)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** Atlas cluster or self-hosted MongoDB 6+
- **Linux server** (Ubuntu 22.04 recommended) or cloud platform
- **Domain name** with DNS configured
- **SSL certificate** (Let's Encrypt recommended)
- **Nginx** for reverse proxy (recommended)
- **PM2** for process management

---

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/PowerStreamMain.git
cd PowerStreamMain
```

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env.local
nano .env.local
```

**Critical production settings:**

```env
NODE_ENV=production
HOST=127.0.0.1
PORT=5001

# Use a strong, unique JWT secret (generate with: openssl rand -base64 64)
JWT_SECRET=your-production-jwt-secret-minimum-32-characters

# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/powerstream?retryWrites=true&w=majority

# Production CORS origins
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Frontend/Backend URLs
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

### 3. Configure Frontend Environment

```bash
cd ../frontend
cp .env.example .env
nano .env
```

**Production settings:**

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_SOCKET_URL=https://api.yourdomain.com
VITE_STUDIO_API_URL=https://studio.yourdomain.com/api
```

---

## Backend Deployment

### 1. Install Dependencies

```bash
cd backend
npm ci --production
```

### 2. Test the Server

```bash
node server.js
# Should see: 🚀 PowerStream API listening at http://127.0.0.1:5001
# Press Ctrl+C to stop
```

### 3. Start with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start the backend
pm2 start server.js --name powerstream-api

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 4. Verify

```bash
curl http://127.0.0.1:5001/api/health
# Should return: {"status":"ok","service":"powerstream-api",...}
```

---

## Frontend Deployment

### 1. Install Dependencies

```bash
cd frontend
npm ci
```

### 2. Build for Production

```bash
npm run build
```

This creates a `dist/` folder with static files.

### 3. Deploy Static Files

**Option A: Serve with Nginx (recommended)**

Copy the `dist/` folder to your web server:

```bash
sudo cp -r dist/* /var/www/powerstream/
```

**Option B: Serve with Node.js**

```bash
npm install -g serve
pm2 start "serve -s dist -l 3000" --name powerstream-frontend
```

**Option C: Deploy to Vercel/Netlify**

```bash
# Vercel
npx vercel --prod

# Netlify
npx netlify deploy --prod --dir=dist
```

---

## Recording Studio Deployment

```bash
cd backend/recordingStudio
cp .env.example .env
nano .env  # Configure MONGO_URI, etc.

npm ci --production
pm2 start server.js --name powerstream-studio
```

---

## RTMP Streaming Setup

PowerStream uses Node Media Server for RTMP streaming.

### Ports Required

| Port | Protocol | Purpose |
|------|----------|---------|
| 1935 | TCP | RTMP ingest |
| 8000 | TCP | HTTP-FLV playback |

### Firewall Configuration

```bash
# Ubuntu/Debian with UFW
sudo ufw allow 1935/tcp comment 'RTMP Streaming'
sudo ufw allow 8000/tcp comment 'HTTP-FLV'

# CentOS/RHEL with firewalld
sudo firewall-cmd --permanent --add-port=1935/tcp
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

### Environment Variables

```env
RTMP_PORT=1935
STREAMING_HTTP_PORT=8000
STREAMING_HTTP_ALLOW_ORIGIN=*
```

### Testing RTMP

Stream to:
```
rtmp://your-server-ip:1935/live/stream-key
```

Playback URL:
```
http://your-server-ip:8000/live/stream-key.flv
```

---

## Nginx Configuration

### Install Nginx

```bash
sudo apt update
sudo apt install nginx
```

### Main Configuration

Create `/etc/nginx/sites-available/powerstream`:

```nginx
# PowerStream API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}

# PowerStream Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/powerstream;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Recording Studio API (optional)
server {
    listen 80;
    server_name studio.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/powerstream /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificates (will auto-configure Nginx)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com -d studio.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## PM2 Process Management

### Ecosystem File

Create `ecosystem.config.cjs` in the project root:

```javascript
module.exports = {
  apps: [
    {
      name: 'powerstream-api',
      cwd: './backend',
      script: 'server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001
      }
    },
    {
      name: 'powerstream-studio',
      cwd: './backend/recordingStudio',
      script: 'server.js',
      instances: 1,
      env_production: {
        NODE_ENV: 'production',
        PORT: 5100
      }
    }
  ]
};
```

### PM2 Commands

```bash
# Start all apps
pm2 start ecosystem.config.cjs --env production

# View status
pm2 status

# View logs
pm2 logs powerstream-api
pm2 logs powerstream-studio

# Restart
pm2 restart powerstream-api

# Stop
pm2 stop all

# Monitor
pm2 monit
```

---

## Health Checks & Monitoring

### Health Endpoints

| Service | Endpoint | Expected Response |
|---------|----------|-------------------|
| Backend API | `GET /api/health` | `{"status":"ok"}` |
| Backend API | `GET /health` | `{"status":"ok"}` |

### Simple Health Check Script

Create `health-check.sh`:

```bash
#!/bin/bash
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5001/api/health)

if [ "$API_HEALTH" != "200" ]; then
    echo "API unhealthy! Status: $API_HEALTH"
    pm2 restart powerstream-api
fi
```

Add to crontab:
```bash
*/5 * * * * /path/to/health-check.sh >> /var/log/powerstream-health.log 2>&1
```

---

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
lsof -i :5001
kill -9 <PID>
```

**MongoDB connection failed:**
- Check `MONGO_URI` is correct
- Ensure IP is whitelisted in MongoDB Atlas
- Verify network connectivity: `nc -zv cluster.mongodb.net 27017`

**CORS errors:**
- Verify `CORS_ALLOWED_ORIGINS` includes your frontend domain
- Check for trailing slashes in origins

**PM2 not starting on boot:**
```bash
pm2 startup
pm2 save
```

**Nginx 502 Bad Gateway:**
- Check if backend is running: `pm2 status`
- Check backend logs: `pm2 logs powerstream-api`

### Log Locations

| Service | Log Location |
|---------|--------------|
| PM2 | `~/.pm2/logs/` |
| Nginx | `/var/log/nginx/` |
| System | `/var/log/syslog` |

### Useful Commands

```bash
# Check all running Node processes
ps aux | grep node

# Check port usage
netstat -tlnp | grep -E '5001|5100|1935|8000'

# Tail all PM2 logs
pm2 logs --lines 100

# Restart everything
pm2 restart all
sudo systemctl restart nginx
```

---

## Quick Reference

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `JWT_SECRET`
- [ ] Configure MongoDB Atlas with IP whitelist
- [ ] Set production CORS origins
- [ ] Configure SSL certificates
- [ ] Setup PM2 with startup script
- [ ] Configure Nginx reverse proxy
- [ ] Open firewall ports (80, 443, 1935, 8000)
- [ ] Setup monitoring/health checks
- [ ] Configure backups for MongoDB

### Default Ports

| Service | Port |
|---------|------|
| Backend API | 5001 |
| Recording Studio | 5100 |
| Frontend (dev) | 5173 |
| RTMP | 1935 |
| HTTP-FLV | 8000 |
| Nginx HTTP | 80 |
| Nginx HTTPS | 443 |

---

*Last updated: December 2024*




