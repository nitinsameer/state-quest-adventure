import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nishaantech.exploroindia',
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
    }
  }
};

export default config;
