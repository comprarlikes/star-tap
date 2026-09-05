import { Capacitor } from '@capacitor/core';

export const CURRENT_APP_VERSION = '2.5.0';
export const CURRENT_BUILD_NUMBER = 250;
export const GOOGLE_PLAY_PACKAGE_ID = 'com.startap.arcade';
export const GOOGLE_PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${GOOGLE_PLAY_PACKAGE_ID}`;
export const GOOGLE_PLAY_MARKET_URI = `market://details?id=${GOOGLE_PLAY_PACKAGE_ID}`;

export const updateService = {
  getCurrentVersion(): string {
    return CURRENT_APP_VERSION;
  },

  getCurrentBuildNumber(): number {
    return CURRENT_BUILD_NUMBER;
  },

  isNativeAndroid(): boolean {
    return (
      Capacitor.isNativePlatform() ||
      /android/i.test(navigator.userAgent || '')
    );
  },

  /**
   * Open the official Google Play Store page for Star Tap
   */
  openGooglePlayStore(): void {
    if (this.isNativeAndroid()) {
      try {
        window.location.href = GOOGLE_PLAY_MARKET_URI;
        return;
      } catch {
        // Fallback to web link below
      }
    }
    window.open(GOOGLE_PLAY_STORE_URL, '_blank', 'noopener,noreferrer');
  },
};
