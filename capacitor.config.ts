import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nishaantech.exploreindia',
  appName: 'India Explorer',
  webDir: 'dist/client',
  android: {
    preferredStatusBarStyle: 'dark',
    backgroundColor: '#FFFFFF'
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
