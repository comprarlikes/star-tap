import {
  AdMob,
  InterstitialAdPluginEvents,
  BannerAdPluginEvents,
  BannerAdPosition,
  BannerAdSize,
  RewardAdPluginEvents,
  AdMobRewardItem,
  AdMobError,
  AdOptions,
  RewardAdOptions
} from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

/**
 * STAR TAP Google AdMob Central Configuration
 * Separates Official Google Test IDs (Development/Testing) from Real Production IDs.
 */
export const ADMOB_TEST_IDS = {
  appId: 'ca-app-pub-3940256099942544~3347511713',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  appOpen: 'ca-app-pub-3940256099942544/9257395921',
  banner: 'ca-app-pub-3940256099942544/6300978111',
};

export const ADMOB_PRODUCTION_IDS = {
  appId: 'ca-app-pub-4623925469377930~9302870404',
  interstitial: 'ca-app-pub-4623925469377930/5770819509',
  rewarded: 'ca-app-pub-4623925469377930/5770819509',
  appOpen: 'ca-app-pub-4623925469377930/8716547044',
  banner: 'ca-app-pub-3940256099942544/6300978111',
};

// Check if running in development environment
const isDevelopment = process.env.NODE_ENV !== 'production';

export function getAdMobIds() {
  return isDevelopment ? ADMOB_TEST_IDS : ADMOB_PRODUCTION_IDS;
}

export function isAdTesting(): boolean {
  return isDevelopment;
}

/**
 * AdMob Global State Interface
 */
export interface AdMobState {
  isInitialized: boolean;
  isInterstitialLoading: boolean;
  isInterstitialReady: boolean;
  isInterstitialShowing: boolean;
  isRewardedLoading: boolean;
  isRewardedReady: boolean;
  isRewardedShowing: boolean;
}

export interface RewardedAdResult {
  success: boolean;
  rewarded: boolean;
  reward?: AdMobRewardItem;
  error?: string;
}

export interface InterstitialAdResult {
  success: boolean;
  error?: string;
}

let state: AdMobState = {
  isInitialized: false,
  isInterstitialLoading: false,
  isInterstitialReady: false,
  isInterstitialShowing: false,
  isRewardedLoading: false,
  isRewardedReady: false,
  isRewardedShowing: false,
};

const listeners = new Set<(currentState: AdMobState) => void>();

function updateState(partial: Partial<AdMobState>) {
  state = { ...state, ...partial };
  listeners.forEach((cb) => {
    try {
      cb(state);
    } catch (e) {
      console.error('[AdMob] State listener error:', e);
    }
  });
}

export function subscribeAdState(callback: (currentState: AdMobState) => void): () => void {
  listeners.add(callback);
  callback(state);
  return () => {
    listeners.delete(callback);
  };
}

export function getAdMobState(): AdMobState {
  return { ...state };
}

/**
 * Initialize Google AdMob SDK on Native platforms
 */
let isInitInProgress = false;

export async function initializeAdMob(): Promise<boolean> {
  if (state.isInitialized) return true;
  if (!Capacitor.isNativePlatform()) {
    console.log('[AdMob] Running in Web environment. Real AdMob requires a native mobile container (Capacitor Android/iOS).');
    return false;
  }

  if (isInitInProgress) return false;
  isInitInProgress = true;

  try {
    const isTest = isAdTesting();
    await AdMob.initialize({
      testingDevices: isTest ? ['EMULATOR'] : [],
      initializeForTesting: isTest,
    });

    updateState({ isInitialized: true });
    console.log('[AdMob Native] Google Mobile Ads SDK initialized successfully (Test Mode:', isTest, ')');
    return true;
  } catch (err: any) {
    console.warn('[AdMob Native] SDK Initialization warning:', err?.message || err);
    return false;
  } finally {
    isInitInProgress = false;
  }
}

/**
 * SHOW REWARDED AD (Real AdMob SDK flow only)
 *
 * Flow:
 * 1. Checks if ad is already showing or loading (prevents duplicates).
 * 2. Checks native platform availability. If on Web, returns false (no fake reward).
 * 3. Prepares Rewarded Video via AdMob SDK.
 * 4. Listens specifically to onRewardedVideoAdReward.
 * 5. Shows ad via AdMob SDK.
 * 6. Returns { rewarded: true } ONLY if official SDK rewarded event fired.
 */
export async function showRewardedAd(): Promise<RewardedAdResult> {
  // Prevent duplicate concurrent ad requests
  if (state.isRewardedShowing || state.isInterstitialShowing) {
    console.warn('[AdMob Rewarded] An ad is already displaying.');
    return { success: false, rewarded: false, error: 'ad_already_showing' };
  }

  if (state.isRewardedLoading) {
    console.warn('[AdMob Rewarded] An ad is currently loading.');
    return { success: false, rewarded: false, error: 'ad_loading' };
  }

  // Web Browser Fallback: Real AdMob is only available on native Android/iOS
  if (!Capacitor.isNativePlatform()) {
    console.log('[AdMob Rewarded] Native AdMob not available in web browser preview.');
    return {
      success: false,
      rewarded: false,
      error: 'not_available_on_web',
    };
  }

  updateState({ isRewardedLoading: true });

  try {
    if (!state.isInitialized) {
      await initializeAdMob();
    }

    const ids = getAdMobIds();
    const isTest = isAdTesting();

    console.log('[AdMob Rewarded] Preparing real rewarded ad unit:', ids.rewarded);

    const rewardOptions: RewardAdOptions = {
      adId: ids.rewarded,
      isTesting: isTest,
    };

    await AdMob.prepareRewardVideoAd(rewardOptions);
    updateState({ isRewardedLoading: false, isRewardedReady: true, isRewardedShowing: true });

    return await new Promise<RewardedAdResult>((resolve) => {
      let earnedReward = false;
      let rewardData: AdMobRewardItem | undefined;
      const handles: { remove: () => void }[] = [];

      const cleanup = () => {
        handles.forEach((h) => {
          try {
            h.remove();
          } catch (e) {
            // handle cleanup
          }
        });
        updateState({ isRewardedShowing: false, isRewardedReady: false });
      };

      // 1. Reward event from official Google AdMob SDK
      AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: AdMobRewardItem) => {
        console.log('[AdMob Event] onRewardedVideoAdReward: User earned reward from SDK:', reward);
        earnedReward = true;
        rewardData = reward;
      }).then((handle) => handles.push(handle));

      // 2. Dismissed event (when user or SDK closes the ad)
      AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        console.log('[AdMob Event] onRewardedVideoAdDismissed: Ad closed. Earned reward status:', earnedReward);
        cleanup();
        resolve({
          success: true,
          rewarded: earnedReward,
          reward: rewardData,
        });
      }).then((handle) => handles.push(handle));

      // 3. Failed to show event
      AdMob.addListener(RewardAdPluginEvents.FailedToShow, (error: AdMobError) => {
        console.error('[AdMob Event] onRewardedVideoAdFailedToShow:', error);
        cleanup();
        resolve({
          success: false,
          rewarded: false,
          error: error.message || 'Failed to show rewarded ad',
        });
      }).then((handle) => handles.push(handle));

      // 4. Show the ad
      AdMob.showRewardVideoAd().catch((err: any) => {
        console.error('[AdMob Rewarded] showRewardVideoAd call error:', err);
        cleanup();
        resolve({
          success: false,
          rewarded: false,
          error: err?.message || 'Error executing showRewardVideoAd',
        });
      });
    });
  } catch (err: any) {
    console.error('[AdMob Rewarded] Preparation error:', err);
    updateState({ isRewardedLoading: false, isRewardedReady: false, isRewardedShowing: false });
    return {
      success: false,
      rewarded: false,
      error: err?.message || 'Error preparing rewarded ad',
    };
  }
}

/**
 * SHOW INTERSTITIAL AD (Real AdMob SDK flow only)
 *
 * Flow:
 * 1. Checks if ad is already showing.
 * 2. Checks native platform availability.
 * 3. Prepares Interstitial via AdMob SDK.
 * 4. Shows Interstitial.
 * 5. DOES NOT GRANT ANY REWARDS OR MODIFY USER CURRENCY/XP.
 */
export async function showInterstitialAd(): Promise<InterstitialAdResult> {
  // Prevent duplicate concurrent ad requests
  if (state.isInterstitialShowing || state.isRewardedShowing) {
    console.warn('[AdMob Interstitial] An ad is already displaying.');
    return { success: false, error: 'ad_already_showing' };
  }

  if (state.isInterstitialLoading) {
    console.warn('[AdMob Interstitial] An interstitial is currently loading.');
    return { success: false, error: 'ad_loading' };
  }

  // Web Browser Fallback: Real AdMob is only available on native Android/iOS
  if (!Capacitor.isNativePlatform()) {
    console.log('[AdMob Interstitial] Native AdMob not available in web browser preview.');
    return { success: false, error: 'not_available_on_web' };
  }

  updateState({ isInterstitialLoading: true });

  try {
    if (!state.isInitialized) {
      await initializeAdMob();
    }

    const ids = getAdMobIds();
    const isTest = isAdTesting();

    console.log('[AdMob Interstitial] Preparing real interstitial ad unit:', ids.interstitial);

    const adOptions: AdOptions = {
      adId: ids.interstitial,
      isTesting: isTest,
    };

    await AdMob.prepareInterstitial(adOptions);
    updateState({ isInterstitialLoading: false, isInterstitialReady: true, isInterstitialShowing: true });

    return await new Promise<InterstitialAdResult>((resolve) => {
      const handles: { remove: () => void }[] = [];

      const cleanup = () => {
        handles.forEach((h) => {
          try {
            h.remove();
          } catch (e) {
            // handle cleanup
          }
        });
        updateState({ isInterstitialShowing: false, isInterstitialReady: false });
      };

      AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
        console.log('[AdMob Event] onInterstitialAdDismissed: Interstitial ad closed.');
        cleanup();
        resolve({ success: true });
      }).then((handle) => handles.push(handle));

      AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, (error: AdMobError) => {
        console.error('[AdMob Event] onInterstitialAdFailedToShow:', error);
        cleanup();
        resolve({ success: false, error: error.message || 'Failed to show interstitial' });
      }).then((handle) => handles.push(handle));

      AdMob.showInterstitial().catch((err: any) => {
        console.error('[AdMob Interstitial] showInterstitial call error:', err);
        cleanup();
        resolve({ success: false, error: err?.message || 'Error executing showInterstitial' });
      });
    });
  } catch (err: any) {
    console.error('[AdMob Interstitial] Preparation error:', err);
    updateState({ isInterstitialLoading: false, isInterstitialReady: false, isInterstitialShowing: false });
    return { success: false, error: err?.message || 'Error preparing interstitial' };
  }
}
