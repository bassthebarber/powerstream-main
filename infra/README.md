# PowerStream Infrastructure

This directory contains all infrastructure configuration for deploying and running PowerStream.

## 📁 Contents

| File | Description |
|------|-------------|
| `docker-compose.yml` | Local development with all services |
| `Dockerfile.backend` | Backend Node.js container |
| `Dockerfile.frontend` | Frontend React container |
| `Dockerfile.ml` | ML Python service container |
| `nginx.conf.example` | Production Nginx reverse proxy |
| `nginx-frontend.conf` | Nginx for frontend container |
| `pm2.config.cjs` | PM2 process management |

## 🐳 Docker Development

### Quick Start

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| `backend` | 5001, 1935, 8000 | Main API + RTMP + HLS |
| `frontend` | 5173 | Vite dev server |
| `mongo` | 27017 | MongoDB database |
| `redis` | 6379 | Redis cache/queue |
| `ml-service` | 5200 | Python ML service |
| `studio` | 5002 | Recording studio (optional) |

### Including Recording Studio

```bash
docker-compose --profile studio up -d
```

## 🔧 PM2 Production

### Setup

```bash
# Install PM2 globally
npm install -g pm2

# Start all apps
pm2 start infra/pm2.config.cjs

# View status
pm2 status

# View logs
pm2 logs

# Reload all (zero-downtime)
pm2 reload all
```

### Startup Script

```bash
# Generate startup script
pm2 startup

# Save current process list
pm2 save
```

## 🌐 Nginx Production

### Installation

```bash
# Copy and customize config
sudo cp nginx.conf.example /etc/nginx/sites-available/powerstream
sudo ln -s /etc/nginx/sites-available/powerstream /etc/nginx/sites-enabled/

# Edit with your domain
sudo nano /etc/nginx/sites-available/powerstream

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### SSL with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d powerstream.app -d www.powerstream.app

# Auto-renewal (cron)
sudo certbot renew --dry-run
```

## 📋 Environment Variables

### Backend (.env)

```env
# Server
NODE_ENV=production
PORT=5001
HOST=0.0.0.0

# MongoDB
MONGO_URI=mongodb+srv://...

# Redis
USE_REDIS=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# ML Service
ML_SERVICE_URL=http://localhost:5200
```

### Frontend (.env)

```env
VITE_API_URL=https://api.powerstream.app
VITE_SOCKET_URL=wss://api.powerstream.app
```

## 🚀 Deployment Checklist

- [ ] Set all environment variables
- [ ] Configure DNS for domain
- [ ] Set up SSL certificates
- [ ] Configure Nginx reverse proxy
- [ ] Start PM2 processes
- [ ] Set up log rotation
- [ ] Configure monitoring (optional)
- [ ] Set up backups for MongoDB

## 📊 Monitoring

### PM2 Monitoring

```bash
# Built-in monitoring
pm2 monit

# Web dashboard (PM2 Plus)
pm2 plus
```

### Health Checks

```bash
# Backend health
curl http://localhost:5001/health

# ML service health
curl http://localhost:5200/health
```

## 🔄 Updates

### Zero-Downtime Deployment

```bash
# Pull latest code
git pull origin main

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Build frontend
cd frontend && npm run build

# Reload backend (graceful)
pm2 reload powerstream-api

# Clear cache if needed
redis-cli FLUSHALL
```

## 🆘 Troubleshooting

### Common Issues

**Port already in use:**
```bash
lsof -i :5001
kill -9 <PID>
```

**Docker network issues:**
```bash
docker network prune
docker-compose down && docker-compose up -d
```

**PM2 process not starting:**
```bash
pm2 logs powerstream-api --lines 100
```

**MongoDB connection failed:**
- Check MONGO_URI format
- Verify network whitelist (Atlas)
- Check authentication credentials



