#!/bin/bash

# ============================================
# POWERSTREAM PRODUCTION DEPLOYMENT SCRIPT
# ============================================
# Zero-downtime deployment with PM2 cluster

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DEPLOY_USER="${DEPLOY_USER:-deploy}"
DEPLOY_HOST="${DEPLOY_HOST:-api.powerstream.tv}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/powerstream}"
PM2_APP_NAME="${PM2_APP_NAME:-powerstream-api}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   PowerStream Production Deployment${NC}"
echo -e "${BLUE}========================================${NC}"

# ========================================
# PRE-DEPLOYMENT CHECKS
# ========================================

pre_deploy_checks() {
    echo -e "${BLUE}[1/6]${NC} Running pre-deployment checks..."
    
    # Check git status
    if [[ -n $(git status -s) ]]; then
        echo -e "${YELLOW}Warning: Uncommitted changes detected${NC}"
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Ensure we're on main branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [[ "$CURRENT_BRANCH" != "main" ]]; then
        echo -e "${YELLOW}Warning: Not on main branch (current: $CURRENT_BRANCH)${NC}"
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    echo -e "${GREEN}✓ Pre-deployment checks passed${NC}"
}

# ========================================
# BUILD
# ========================================

build() {
    echo -e "${BLUE}[2/6]${NC} Building production assets..."
    
    # Build frontend
    cd frontend
    npm ci
    npm run build
    cd ..
    
    # Build studio-app
    cd frontend/studio-app
    npm ci
    npm run build
    cd ../..
    
    echo -e "${GREEN}✓ Build complete${NC}"
}

# ========================================
# DEPLOY TO SERVER
# ========================================

deploy() {
    echo -e "${BLUE}[3/6]${NC} Deploying to $DEPLOY_HOST..."
    
    # Create deployment package
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    DEPLOY_ARCHIVE="powerstream_${TIMESTAMP}.tar.gz"
    
    # Create tarball (excluding unnecessary files)
    tar -czf "/tmp/$DEPLOY_ARCHIVE" \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='*.log' \
        --exclude='.env*' \
        --exclude='coverage' \
        --exclude='.nyc_output' \
        backend \
        frontend/dist \
        frontend/studio-app/dist \
        infra/pm2 \
        package.json
    
    # Upload to server
    scp "/tmp/$DEPLOY_ARCHIVE" "$DEPLOY_USER@$DEPLOY_HOST:/tmp/"
    
    # Deploy on server
    ssh "$DEPLOY_USER@$DEPLOY_HOST" << ENDSSH
        set -e
        
        # Backup current deployment
        if [ -d "$DEPLOY_PATH" ]; then
            sudo mv "$DEPLOY_PATH" "${DEPLOY_PATH}_backup_${TIMESTAMP}"
        fi
        
        # Extract new deployment
        sudo mkdir -p "$DEPLOY_PATH"
        sudo tar -xzf "/tmp/$DEPLOY_ARCHIVE" -C "$DEPLOY_PATH"
        sudo chown -R $DEPLOY_USER:$DEPLOY_USER "$DEPLOY_PATH"
        
        # Install backend dependencies
        cd "$DEPLOY_PATH/backend"
        npm ci --production
        
        # Copy environment file
        if [ -f "/etc/powerstream/.env" ]; then
            cp /etc/powerstream/.env "$DEPLOY_PATH/backend/.env"
        fi
        
        # Clean up
        rm -f "/tmp/$DEPLOY_ARCHIVE"
        
        # Keep only last 3 backups
        ls -dt ${DEPLOY_PATH}_backup_* 2>/dev/null | tail -n +4 | xargs -r sudo rm -rf
ENDSSH
    
    # Clean up local archive
    rm -f "/tmp/$DEPLOY_ARCHIVE"
    
    echo -e "${GREEN}✓ Deployment complete${NC}"
}

# ========================================
# DATABASE MIGRATIONS
# ========================================

run_migrations() {
    echo -e "${BLUE}[4/6]${NC} Running database migrations..."
    
    ssh "$DEPLOY_USER@$DEPLOY_HOST" << ENDSSH
        cd "$DEPLOY_PATH/backend"
        
        # Run migrations if script exists
        if [ -f "scripts/migrate.js" ]; then
            node scripts/migrate.js
        fi
ENDSSH
    
    echo -e "${GREEN}✓ Migrations complete${NC}"
}

# ========================================
# RELOAD PM2
# ========================================

reload_pm2() {
    echo -e "${BLUE}[5/6]${NC} Reloading PM2 cluster (zero-downtime)..."
    
    ssh "$DEPLOY_USER@$DEPLOY_HOST" << ENDSSH
        cd "$DEPLOY_PATH"
        
        # Reload with PM2 (zero-downtime)
        if pm2 describe $PM2_APP_NAME > /dev/null 2>&1; then
            # App exists, do graceful reload
            pm2 reload infra/pm2/ecosystem.config.cjs --env production
        else
            # First deploy, start fresh
            pm2 start infra/pm2/ecosystem.config.cjs --env production
        fi
        
        # Save PM2 process list
        pm2 save
        
        # Wait for apps to be ready
        sleep 5
        
        # Health check
        pm2 ls
ENDSSH
    
    echo -e "${GREEN}✓ PM2 reload complete${NC}"
}

# ========================================
# POST-DEPLOYMENT VERIFICATION
# ========================================

verify_deployment() {
    echo -e "${BLUE}[6/6]${NC} Verifying deployment..."
    
    # Health check
    HEALTH_URL="https://${DEPLOY_HOST}/api/health"
    HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || echo "000")
    
    if [ "$HEALTH_STATUS" = "200" ]; then
        echo -e "${GREEN}✓ Health check passed (HTTP $HEALTH_STATUS)${NC}"
    else
        echo -e "${RED}✗ Health check failed (HTTP $HEALTH_STATUS)${NC}"
        echo -e "${YELLOW}Rolling back...${NC}"
        rollback
        exit 1
    fi
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}   Deployment Successful! 🚀${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "Deployed at: $(date)"
    echo "Server: $DEPLOY_HOST"
    echo ""
}

# ========================================
# ROLLBACK
# ========================================

rollback() {
    echo -e "${YELLOW}Rolling back to previous deployment...${NC}"
    
    ssh "$DEPLOY_USER@$DEPLOY_HOST" << ENDSSH
        # Find most recent backup
        LATEST_BACKUP=\$(ls -dt ${DEPLOY_PATH}_backup_* 2>/dev/null | head -1)
        
        if [ -n "\$LATEST_BACKUP" ]; then
            # Remove failed deployment
            sudo rm -rf "$DEPLOY_PATH"
            
            # Restore backup
            sudo mv "\$LATEST_BACKUP" "$DEPLOY_PATH"
            
            # Reload PM2
            cd "$DEPLOY_PATH"
            pm2 reload infra/pm2/ecosystem.config.cjs --env production
            
            echo "Rolled back to: \$LATEST_BACKUP"
        else
            echo "No backup found to roll back to!"
            exit 1
        fi
ENDSSH
    
    echo -e "${GREEN}✓ Rollback complete${NC}"
}

# ========================================
# MAIN
# ========================================

main() {
    case "${1:-deploy}" in
        deploy)
            pre_deploy_checks
            build
            deploy
            run_migrations
            reload_pm2
            verify_deployment
            ;;
        rollback)
            rollback
            ;;
        build)
            build
            ;;
        reload)
            reload_pm2
            ;;
        *)
            echo "Usage: $0 [deploy|rollback|build|reload]"
            exit 1
            ;;
    esac
}

main "$@"



