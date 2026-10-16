import type { CapacitorConfig } from '@capacitor/cli';

// Default background matches Skeumorphism theme default
const DEFAULT_BACKGROUND = '#F5F5F5';

const config: CapacitorConfig = {
  appId: 'com.nishaantech.exploreindia',
  appName: 'India Explorer',
  webDir: 'dist/client',
  android: {
    preferredStatusBarStyle: 'dark',
    backgroundColor: DEFAULT_BACKGROUND
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      androidScaleType: 'center',
      androidSpinnerStyle: 'large',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK'
    },
    TextToSpeech: {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      category: 'Ambient',
      categoryOptions: [],
      language: 'en-US'
    }
  }
};

export default config;
