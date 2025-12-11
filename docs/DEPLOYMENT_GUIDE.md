# PowerStream Deployment Guide

**Version:** 1.0  
**Last Updated:** December 6, 2025

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Web Deployment](#web-deployment)
4. [iOS Deployment](#ios-deployment)
5. [Android Deployment](#android-deployment)
6. [Server Configuration](#server-configuration)
7. [PM2 Cluster Mode](#pm2-cluster-mode)
8. [Nginx Configuration](#nginx-configuration)
9. [SSL/TLS Setup](#ssltls-setup)
10. [Monitoring & Logging](#monitoring--logging)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

PowerStream supports deployment across:
- **Web:** Vite-built SPA served via Nginx
- **iOS:** Native app via App Store
- **Android:** Native app via Google Play Store
- **Backend:** Node.js with PM2 cluster mode

### Architecture

```
                    ┌─────────────────┐
                    │   Cloudflare    │
                    │   (CDN/WAF)     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │     Nginx       │
                    │  (Load Balancer)│
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼────┐         ┌─────▼─────┐        ┌────▼────┐
   │   API   │         │   API     │        │ Studio  │
   │ :5001   │         │  :5002    │        │ :5100   │
   └────┬────┘         └─────┬─────┘        └────┬────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │    MongoDB      │
                    │    Atlas        │
                    └─────────────────┘
```

---

## ⚙️ Prerequisites

### Server Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Storage | 50 GB SSD | 100+ GB NVMe |
| OS | Ubuntu 22.04 | Ubuntu 22.04 LTS |

### Software Requirements

```bash
# Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2
npm install -g pm2

# Nginx
sudo apt install -y nginx

# Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx

# FFmpeg (for audio processing)
sudo apt install -y ffmpeg
```

---

## 🌐 Web Deployment

### 1. Build Frontend

```bash
# Clone repository
git clone https://github.com/yourorg/powerstream.git
cd powerstream

# Install dependencies
cd frontend
npm ci

# Build for production
npm run build

# Build Studio app
cd studio-app
npm ci
npm run build
```

### 2. Configure Environment

```bash
# Copy and edit environment
cp infra/env.production.example backend/.env
nano backend/.env
```

### 3. Deploy

```bash
# Using deployment script
chmod +x infra/scripts/deploy-production.sh
./infra/scripts/deploy-production.sh deploy
```

### 4. Manual Deployment

```bash
# On server
cd /var/www/powerstream

# Install backend dependencies
cd backend
npm ci --production

# Start with PM2
pm2 start infra/pm2/ecosystem.config.cjs --env production
pm2 save
```

---

## 🍎 iOS Deployment

### Prerequisites

- macOS with Xcode 15+
- Apple Developer Account ($99/year)
- Fastlane installed

### Setup

```bash
# Install Fastlane
brew install fastlane

# Navigate to iOS config
cd infra/mobile/ios

# Initialize match for code signing
fastlane match init
```

### Build & Deploy

```bash
# TestFlight (Beta)
fastlane beta

# App Store (Production)
fastlane release
```

### App Store Connect Setup

1. Create app in App Store Connect
2. Set Bundle ID: `tv.powerstream.app`
3. Configure capabilities:
   - Push Notifications
   - Background Audio
   - Associated Domains

---

## 🤖 Android Deployment

### Prerequisites

- Android Studio
- Google Play Developer Account ($25 one-time)
- Fastlane installed

### Setup

```bash
# Generate upload key
keytool -genkey -v -keystore powerstream-release.keystore \
  -alias powerstream -keyalg RSA -keysize 2048 -validity 10000

# Configure Fastlane
cd infra/mobile/android
fastlane init
```

### Build & Deploy

```bash
# Internal Testing
fastlane internal

# Beta (Closed Testing)
fastlane beta

# Production
fastlane release
```

### Play Console Setup

1. Create app in Google Play Console
2. Set package name: `tv.powerstream.app`
3. Upload app signing key
4. Configure store listing

---

## 🖥️ Server Configuration

### Directory Structure

```
/var/www/powerstream/
├── backend/
│   ├── server.js
│   ├── .env
│   └── recordingStudio/
├── frontend/
│   ├── dist/
│   └── studio-app/
│       └── dist/
├── infra/
│   ├── pm2/
│   └── nginx/
└── logs/
```

### File Permissions

```bash
# Set ownership
sudo chown -R deploy:deploy /var/www/powerstream

# Set permissions
sudo chmod -R 755 /var/www/powerstream
sudo chmod 600 /var/www/powerstream/backend/.env
```

---

## 🔄 PM2 Cluster Mode

### Start Cluster

```bash
cd /var/www/powerstream
pm2 start infra/pm2/ecosystem.config.cjs --env production
```

### Useful Commands

```bash
# View status
pm2 ls

# View logs
pm2 logs powerstream-api

# Reload (zero-downtime)
pm2 reload powerstream-api

# Restart
pm2 restart powerstream-api

# Stop
pm2 stop powerstream-api

# Delete
pm2 delete powerstream-api
```

### Auto-start on Boot

```bash
pm2 startup
pm2 save
```

---

## ⚡ Nginx Configuration

### Install Configuration

```bash
# Copy config
sudo cp infra/nginx/powerstream.conf /etc/nginx/sites-available/

# Enable site
sudo ln -s /etc/nginx/sites-available/powerstream.conf /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Performance Tuning

Edit `/etc/nginx/nginx.conf`:

```nginx
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 65535;
    multi_accept on;
    use epoll;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
}
```

---

## 🔐 SSL/TLS Setup

### Using Certbot

```bash
# Obtain certificate
sudo certbot --nginx -d powerstream.tv -d www.powerstream.tv -d studio.powerstream.tv

# Auto-renewal
sudo certbot renew --dry-run
```

### Certificate Renewal Cron

```bash
# Add to crontab
0 0 1 * * /usr/bin/certbot renew --quiet && systemctl reload nginx
```

---

## 📊 Monitoring & Logging

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Web dashboard
pm2 plus
```

### Log Locations

```
/var/log/powerstream/
├── api-combined.log
├── api-out.log
├── api-error.log
├── studio-combined.log
├── studio-out.log
└── studio-error.log
```

### Log Rotation

```bash
# Install logrotate config
sudo tee /etc/logrotate.d/powerstream << EOF
/var/log/powerstream/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 deploy deploy
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

### Health Checks

```bash
# API health
curl https://api.powerstream.tv/api/health

# Studio health
curl https://studio.powerstream.tv/api/health
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. 502 Bad Gateway

```bash
# Check if PM2 is running
pm2 ls

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Restart services
pm2 restart all
sudo systemctl restart nginx
```

#### 2. MongoDB Connection Failed

```bash
# Test connection
mongosh "mongodb+srv://..." --eval "db.adminCommand('ping')"

# Check environment variable
grep MONGODB_URI /var/www/powerstream/backend/.env
```

#### 3. File Upload Failures

```bash
# Check Nginx client_max_body_size
grep client_max_body_size /etc/nginx/sites-enabled/*

# Check disk space
df -h

# Check upload directory permissions
ls -la /var/www/powerstream/uploads
```

#### 4. SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal
```

### Rollback

```bash
# Using deployment script
./infra/scripts/deploy-production.sh rollback

# Manual rollback
ls /var/www/powerstream_backup_*
mv /var/www/powerstream /var/www/powerstream_failed
mv /var/www/powerstream_backup_TIMESTAMP /var/www/powerstream
pm2 reload all
```

---

## 📝 Quick Reference

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret (32+ chars) |
| `CLOUDINARY_*` | Yes | Media storage credentials |
| `OPENAI_API_KEY` | No | AI features |
| `STRIPE_SECRET_KEY` | No | Payments |

### Ports

| Service | Port |
|---------|------|
| Main API | 5001 |
| Studio API | 5100 |
| Nginx | 80, 443 |
| MongoDB | 27017 |

### Useful Commands

```bash
# Full deployment
./infra/scripts/deploy-production.sh deploy

# Build only
./infra/scripts/build-production.sh all

# Reload PM2 (zero-downtime)
pm2 reload ecosystem.config.cjs --env production

# View logs
pm2 logs --lines 100

# Monitor resources
htop
```

---

*PowerStream Deployment Guide - Enterprise Production Ready*


