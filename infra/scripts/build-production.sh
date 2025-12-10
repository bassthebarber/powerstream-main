#!/bin/bash

# ============================================
# POWERSTREAM PRODUCTION BUILD SCRIPT
# ============================================
# Usage: ./build-production.sh [web|ios|android|all]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   PowerStream Production Build${NC}"
echo -e "${BLUE}========================================${NC}"

# ========================================
# HELPER FUNCTIONS
# ========================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

check_requirements() {
    log_info "Checking requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
    fi
    
    log_success "All requirements met"
}

# ========================================
# BACKEND BUILD
# ========================================

build_backend() {
    log_info "Building backend..."
    
    cd "$PROJECT_ROOT/backend"
    
    # Install production dependencies
    npm ci --production
    
    # Run any build steps (TypeScript, etc.)
    if [ -f "tsconfig.json" ]; then
        npm run build 2>/dev/null || true
    fi
    
    log_success "Backend build complete"
}

# ========================================
# WEB BUILD (Vite)
# ========================================

build_web() {
    log_info "Building web frontend..."
    
    cd "$PROJECT_ROOT/frontend"
    
    # Install dependencies
    npm ci
    
    # Set production environment
    export NODE_ENV=production
    
    # Build with Vite
    npm run build
    
    # Verify output
    if [ -d "dist" ]; then
        log_success "Web build complete: $(du -sh dist | cut -f1)"
    else
        log_error "Web build failed: dist directory not found"
    fi
    
    # Build Studio app
    log_info "Building Studio app..."
    cd "$PROJECT_ROOT/frontend/studio-app"
    npm ci
    npm run build
    
    if [ -d "dist" ]; then
        log_success "Studio build complete: $(du -sh dist | cut -f1)"
    else
        log_error "Studio build failed"
    fi
}

# ========================================
# iOS BUILD
# ========================================

build_ios() {
    log_info "Building iOS app..."
    
    # Check for Xcode
    if ! command -v xcodebuild &> /dev/null; then
        log_warning "Xcode not found. Skipping iOS build."
        return
    fi
    
    cd "$PROJECT_ROOT/frontend"
    
    # Sync with Capacitor
    npx cap sync ios
    
    # Install CocoaPods
    cd ios/App
    pod install
    
    # Build with Fastlane
    if [ -f "$PROJECT_ROOT/infra/mobile/ios/Fastfile" ]; then
        log_info "Running Fastlane build..."
        cd "$PROJECT_ROOT/infra/mobile/ios"
        fastlane build_release
    else
        # Manual build
        xcodebuild -workspace App.xcworkspace \
            -scheme App \
            -configuration Release \
            -destination 'generic/platform=iOS' \
            -archivePath "$PROJECT_ROOT/build/PowerStream.xcarchive" \
            archive
    fi
    
    log_success "iOS build complete"
}

# ========================================
# ANDROID BUILD
# ========================================

build_android() {
    log_info "Building Android app..."
    
    # Check for Android SDK
    if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
        log_warning "Android SDK not found. Skipping Android build."
        return
    fi
    
    cd "$PROJECT_ROOT/frontend"
    
    # Sync with Capacitor
    npx cap sync android
    
    cd android
    
    # Build with Gradle
    if [ -f "$PROJECT_ROOT/infra/mobile/android/Fastfile" ]; then
        log_info "Running Fastlane build..."
        cd "$PROJECT_ROOT/infra/mobile/android"
        fastlane build_bundle
    else
        # Manual build
        ./gradlew bundleRelease
    fi
    
    log_success "Android build complete"
}

# ========================================
# BUILD ALL
# ========================================

build_all() {
    build_backend
    build_web
    build_ios
    build_android
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}   All builds completed successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
}

# ========================================
# MAIN
# ========================================

check_requirements

case "${1:-all}" in
    web)
        build_web
        ;;
    ios)
        build_web
        build_ios
        ;;
    android)
        build_web
        build_android
        ;;
    backend)
        build_backend
        ;;
    all)
        build_all
        ;;
    *)
        echo "Usage: $0 [web|ios|android|backend|all]"
        exit 1
        ;;
esac

echo ""
log_success "Build completed at $(date)"



