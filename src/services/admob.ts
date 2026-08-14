import {
  AdMob,
  InterstitialAdPluginEvents,
  BannerAdPluginEvents,
  RewardAdPluginEvents,
  AdMobError
} from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

export const ADMOB_APP_ID = 'ca-app-pub-4623925469377930~9302870404';
export const ADMOB_APP_OPEN_ID = 'ca-app-pub-4623925469377930/8716547044';
export const ADMOB_CONSENT_AD_ID = 'ca-app-pub-4623925469377930/2039134652';
export const ADMOB_INTERSTITIAL_ID = 'ca-app-pub-4623925469377930/5770819509'; // Rewarded Interstitial Ad Unit
export const ADMOB_REWARDED_INTERSTITIAL_ID = 'ca-app-pub-4623925469377930/5770819509';
export const ADMOB_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111'; // Standard test banner
export const ADMOB_REWARDED_ID = 'ca-app-pub-4623925469377930/5770819509';

let isInitialized = false;
let isListenersRegistered = false;
let adLoadedState = false;
let adLoadingState = false;

const adStateListeners = new Set<(isReady: boolean, isLoading: boolean) => void>();

export function subscribeAdState(callback: (isReady: boolean, isLoading: boolean) => void) {
  adStateListeners.add(callback);
  callback(adLoadedState, adLoadingState);
  return () => adStateListeners.delete(callback);
}

function notifyAdStateChange(isReady: boolean, isLoading: boolean) {
  adLoadedState = isReady;
  adLoadingState = isLoading;
  adStateListeners.forEach(cb => cb(isReady, isLoading));
}

export function isAdReady(): boolean {
  return adLoadedState;
}

export function isAdLoading(): boolean {
  return adLoadingState;
}

export function setupAdMobListeners() {
  if (isListenersRegistered || !Capacitor.isNativePlatform()) return;

  try {
    // Interstitial Event Listeners
    AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
      console.log('[AdMob Event] onAdLoaded: Interstitial ad loaded successfully.');
      notifyAdStateChange(true, false);
    });

    AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (error: AdMobError) => {
      console.error('[AdMob Event] onAdFailedToLoad: Interstitial ad failed to load:', error);
      notifyAdStateChange(false, false);
    });

    AdMob.addListener(InterstitialAdPluginEvents.Showed, () => {
      console.log('[AdMob Event] onAdImpression: Interstitial ad showed / impression recorded.');
      notifyAdStateChange(false, false);
    });

    AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
      console.log('[AdMob Event] onAdDismissed: Interstitial ad closed.');
      notifyAdStateChange(false, false);
    });

    AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, (error: AdMobError) => {
      console.error('[AdMob Event] onAdFailedToShow: Interstitial ad failed to show:', error);
      notifyAdStateChange(false, false);
    });

    // Check for Clicked and Impression events if available in plugin enum or string listeners
    try {
      AdMob.addListener('interstitialAdClicked' as any, () => {
        console.log('[AdMob Event] onAdClicked: Interstitial ad clicked.');
      });
      AdMob.addListener('interstitialAdImpression' as any, () => {
        console.log('[AdMob Event] onAdImpression: Interstitial ad impression recorded.');
      });
    } catch (e) {
      // safe fallback
    }

    // Banner Event Listeners
    AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
      console.log('[AdMob Event] onAdLoaded: Banner ad loaded successfully.');
    });

    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error: AdMobError) => {
      console.error('[AdMob Event] onAdFailedToLoad: Banner ad failed to load:', error);
    });

    AdMob.addListener(BannerAdPluginEvents.Opened, () => {
      console.log('[AdMob Event] onAdClicked: Banner ad opened / clicked.');
    });

    AdMob.addListener(BannerAdPluginEvents.Closed, () => {
      console.log('[AdMob Event] Banner ad closed.');
    });

    // Rewarded Video Event Listeners
    AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
      console.log('[AdMob Event] onAdLoaded: Rewarded ad loaded successfully.');
      notifyAdStateChange(true, false);
    });

    AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error: AdMobError) => {
      console.error('[AdMob Event] onAdFailedToLoad: Rewarded ad failed to load:', error);
      notifyAdStateChange(false, false);
    });

    AdMob.addListener(RewardAdPluginEvents.Showed, () => {
      console.log('[AdMob Event] onAdImpression: Rewarded ad impression recorded.');
    });

    AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
      console.log('[AdMob Event] Rewarded ad dismissed by user.');
      notifyAdStateChange(false, false);
    });

    AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: any) => {
      console.log('[AdMob Event] User earned reward:', reward);
    });

    AdMob.addListener(RewardAdPluginEvents.FailedToShow, (error: AdMobError) => {
      console.error('[AdMob Event] onAdFailedToShow: Rewarded ad failed to show:', error);
      notifyAdStateChange(false, false);
    });

    try {
      AdMob.addListener('rewardedVideoAdClicked' as any, () => {
        console.log('[AdMob Event] onAdClicked: Rewarded ad clicked.');
      });
    } catch (e) {
      // safe fallback
    }

    isListenersRegistered = true;
    console.log('[AdMob SDK] Detailed event listeners (onAdLoaded, onAdFailedToLoad, onAdClicked, onAdImpression) initialized.');
  } catch (err) {
    console.warn('[AdMob SDK] Failed to set up listeners:', err);
  }
}

export async function initializeAdMob() {
  if (!Capacitor.isNativePlatform()) {
    console.log('[AdMob Web] Running in browser preview environment. Visual ad overlay active.');
    return;
  }

  try {
    setupAdMobListeners();
    await AdMob.initialize({
      testingDevices: [],
      initializeForTesting: false,
    });
    isInitialized = true;
    console.log('[AdMob Native] SDK Initialized with App ID:', ADMOB_APP_ID);
  } catch (err) {
    console.warn('[AdMob Native] Init warning (fallback active):', err);
  }
}

export async function prepareAndShowInterstitialAd(): Promise<boolean> {
  console.log('[AdMob Request] Triggering Interstitial / Rewarded Ad Placement: ', ADMOB_INTERSTITIAL_ID);
  notifyAdStateChange(false, true);

  if (Capacitor.isNativePlatform()) {
    try {
      if (!isInitialized) {
        await initializeAdMob();
      }

      console.log('[AdMob Native] Preparing ad for unit:', ADMOB_INTERSTITIAL_ID);
      try {
        await AdMob.prepareRewardVideoAd({
          adId: ADMOB_REWARDED_INTERSTITIAL_ID,
          isTesting: false,
        });
        console.log('[AdMob Event] onAdLoaded: Rewarded ad ready. Showing now...');
        notifyAdStateChange(true, false);
        await AdMob.showRewardVideoAd();
        console.log('[AdMob Event] onAdImpression: Rewarded ad shown.');
        return true;
      } catch (rewardErr) {
        console.log('[AdMob Native] Falling back to standard interstitial prepare:', rewardErr);
        await AdMob.prepareInterstitial({
          adId: ADMOB_INTERSTITIAL_ID,
          isTesting: false,
        });
        console.log('[AdMob Event] onAdLoaded: Interstitial ad ready. Showing now...');
        notifyAdStateChange(true, false);
        await AdMob.showInterstitial();
        console.log('[AdMob Event] onAdImpression: Interstitial ad shown.');
        return true;
      }
    } catch (err) {
      console.error('[AdMob Event] onAdFailedToLoad / onAdFailedToShow:', err);
      notifyAdStateChange(false, false);
    }
  } else {
    console.log('[AdMob Web] Simulation mode: Loading ad...');
    setTimeout(() => {
      console.log('[AdMob Event] onAdLoaded: Web simulated ad loaded.');
      notifyAdStateChange(true, false);
    }, 1200);
  }

  return false;
}

export async function prepareAndShowConsentAd(): Promise<boolean> {
  console.log('[AdMob Request] Triggering Consent Ad Unit:', ADMOB_CONSENT_AD_ID);
  notifyAdStateChange(false, true);

  if (Capacitor.isNativePlatform()) {
    try {
      if (!isInitialized) {
        await initializeAdMob();
      }

      console.log('[AdMob Native] Preparing consent ad unit:', ADMOB_CONSENT_AD_ID);
      try {
        await AdMob.prepareInterstitial({
          adId: ADMOB_CONSENT_AD_ID,
          isTesting: false,
        });
        console.log('[AdMob Event] onAdLoaded: Consent Ad ready. Showing now...');
        notifyAdStateChange(true, false);
        await AdMob.showInterstitial();
        console.log('[AdMob Event] onAdImpression: Consent Ad shown.');
        return true;
      } catch (err) {
        console.error('[AdMob Native] Failed to load/show consent interstitial:', err);
        notifyAdStateChange(false, false);
      }
    } catch (err) {
      console.error('[AdMob Event] Consent Ad Error:', err);
      notifyAdStateChange(false, false);
    }
  } else {
    console.log('[AdMob Web] Simulation mode: Loading consent ad unit ca-app-pub-4623925469377930/2039134652...');
    setTimeout(() => {
      console.log('[AdMob Event] onAdLoaded: Web simulated consent ad loaded.');
      notifyAdStateChange(true, false);
    }, 1000);
  }

  return false;
}

