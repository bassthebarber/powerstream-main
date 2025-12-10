import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tv.powerstream.app',
  appName: 'PowerStream',
  webDir: 'dist',
  
  // Server configuration
  server: {
    // Use this for development
    // url: 'http://localhost:5173',
    // cleartext: true,
    
    // Production: use bundled web assets
    androidScheme: 'https',
    iosScheme: 'https',
  },

  // ========== iOS Configuration ==========
  ios: {
    // Appearance
    contentInset: 'automatic',
    backgroundColor: '#000000',
    
    // Capabilities
    limitsNavigationsToAppBoundDomains: true,
    
    // Permissions
    allowsLinkPreview: true,
    scrollEnabled: true,
    
    // Build settings
    scheme: 'PowerStream',
    
    // WebView preferences
    preferredContentMode: 'mobile',
  },

  // ========== Android Configuration ==========
  android: {
    // Appearance
    backgroundColor: '#000000',
    allowMixedContent: false,
    
    // Build settings
    buildOptions: {
      keystorePath: 'keys/powerstream-release.keystore',
      keystorePassword: process.env.ANDROID_KEYSTORE_PASSWORD,
      keystoreAlias: 'powerstream',
      keystoreAliasPassword: process.env.ANDROID_KEY_PASSWORD,
      releaseType: 'AAB', // Android App Bundle for Play Store
    },
    
    // WebView
    webContentsDebuggingEnabled: false,
    
    // UI
    useLegacyBridge: false,
  },

  // ========== Plugins ==========
  plugins: {
    // Push Notifications
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    
    // Splash Screen
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      iosSpinnerStyle: 'large',
      spinnerColor: '#e6b800',
      splashFullScreen: true,
      splashImmersive: true,
    },
    
    // Status Bar
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#000000',
    },
    
    // Keyboard
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
    
    // App
    App: {
      appId: 'tv.powerstream.app',
      appName: 'PowerStream',
    },
    
    // Local Notifications
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#e6b800',
      sound: 'notification.wav',
    },
    
    // Camera (for profile photos)
    Camera: {
      presentationStyle: 'popover',
    },
    
    // Filesystem (for downloads)
    Filesystem: {
      // Use default settings
    },
  },

  // ========== Cordova (Legacy plugin support) ==========
  cordova: {
    preferences: {
      ScrollEnabled: 'true',
      BackupWebStorage: 'none',
      SplashMaintainAspectRatio: 'true',
      FadeSplashScreenDuration: '300',
      SplashShowOnlyFirstTime: 'false',
      SplashScreen: 'screen',
      SplashScreenDelay: '2000',
    },
  },
};

export default config;



