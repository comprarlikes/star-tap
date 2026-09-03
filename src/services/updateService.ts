import { AppUpdateInfo } from '../types';
import { Capacitor } from '@capacitor/core';

export const CURRENT_APP_VERSION = '2.4.0';
export const CURRENT_BUILD_NUMBER = 240;

const STORAGE_KEY_DISMISSED_VERSION = 'startap_dismissed_update_version';
const STORAGE_KEY_DISMISSED_TIME = 'startap_dismissed_update_time';
const STORAGE_KEY_CLAIMED_UPDATE_REWARD = 'startap_claimed_update_rewards';
const STORAGE_KEY_SIMULATED_UPDATE = 'startap_simulated_update_mode';

/**
 * Compare two semver strings (e.g., '2.5.0' vs '2.4.0')
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if v1 === v2
 */
export function compareVersions(v1: string, v2: string): number {
  const cleanV1 = v1.replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0);
  const cleanV2 = v2.replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0);

  const maxLength = Math.max(cleanV1.length, cleanV2.length);
  for (let i = 0; i < maxLength; i++) {
    const num1 = cleanV1[i] || 0;
    const num2 = cleanV2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

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

  getSimulatedUpdate(): 'optional' | 'mandatory' | 'none' {
    try {
      const mode = localStorage.getItem(STORAGE_KEY_SIMULATED_UPDATE);
      if (mode === 'optional' || mode === 'mandatory') return mode;
    } catch {
      // Ignore storage errors
    }
    return 'none';
  },

  setSimulatedUpdate(mode: 'optional' | 'mandatory' | 'none'): void {
    try {
      if (mode === 'none') {
        localStorage.removeItem(STORAGE_KEY_SIMULATED_UPDATE);
        localStorage.removeItem(STORAGE_KEY_DISMISSED_VERSION);
      } else {
        localStorage.setItem(STORAGE_KEY_SIMULATED_UPDATE, mode);
        localStorage.removeItem(STORAGE_KEY_DISMISSED_VERSION); // Reset dismiss so it shows right away
      }
    } catch (e) {
      console.warn('Could not save simulated update mode:', e);
    }
  },

  /**
   * Check for updates against remote /version.json or simulated configuration
   */
  async checkForUpdates(forceRefresh = false): Promise<{
    hasUpdate: boolean;
    isMandatory: boolean;
    updateInfo: AppUpdateInfo | null;
  }> {
    // 1. Check for developer simulation first
    const simulatedMode = this.getSimulatedUpdate();
    if (simulatedMode !== 'none') {
      const isMandatory = simulatedMode === 'mandatory';
      const mockInfo: AppUpdateInfo = {
        version: isMandatory ? '3.0.0' : '2.5.0',
        buildNumber: isMandatory ? 300 : 250,
        currentVersion: CURRENT_APP_VERSION,
        currentBuildNumber: CURRENT_BUILD_NUMBER,
        minRequiredVersion: isMandatory ? '3.0.0' : '2.4.0',
        minRequiredBuild: isMandatory ? 300 : 240,
        forceUpdate: isMandatory,
        apkDownloadUrl: 'https://github.com/startap-arcade/releases/download/v2.5.0/star-tap-arcade.apk',
        fileSizeMb: 28.5,
        releaseDate: new Date().toISOString().split('T')[0],
        title: {
          es: isMandatory ? '⚠️ Actualización Crítica Requerida (v3.0.0)' : '🚀 ¡Nueva Versión Galáctica v2.5.0!',
          en: isMandatory ? '⚠️ Critical Update Required (v3.0.0)' : '🚀 New Galactic Version v2.5.0!',
        },
        highlights: {
          es: [
            '⚔️ Nuevo motor de emparejamiento 1v1 en tiempo real sin latencia',
            '🏛️ Bóveda y Donaciones de Constelaciones con bonos de clan',
            '✨ Recompensas exclusivas de Polvo Estelar y multiplicadores cósmicos',
            '⚡ Optimización de FPS y rendimiento para pantallas de 120Hz',
            '🛡️ Corrección de errores y mayor estabilidad en duelos y ranking',
          ],
          en: [
            '⚔️ New zero-latency real-time 1v1 matchmaking engine',
            '🏛️ Constellation Clan Vault & Resource Donations with clan buffs',
            '✨ Exclusive Stardust rewards and cosmic multipliers',
            '⚡ 120Hz display optimizations and smooth FPS performance',
            '🛡️ Bug fixes and enhanced stability in duels & rankings',
          ],
        },
        rewardCoins: 500,
        rewardStardust: 100,
      };

      return {
        hasUpdate: true,
        isMandatory,
        updateInfo: mockInfo,
      };
    }

    // 2. Fetch live remote version manifest
    try {
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: forceRefresh ? 'no-store' : 'default',
      });

      if (!response.ok) {
        return { hasUpdate: false, isMandatory: false, updateInfo: null };
      }

      const data = await response.json();
      const remoteVersion = data.version || '2.4.0';
      const remoteBuild = data.buildNumber || 240;
      const minRequiredBuild = data.minRequiredBuild || 240;
      const minRequiredVersion = data.minRequiredVersion || '2.4.0';

      const hasNewerBuild = remoteBuild > CURRENT_BUILD_NUMBER;
      const hasNewerVersion = compareVersions(remoteVersion, CURRENT_APP_VERSION) > 0;
      const hasUpdate = hasNewerBuild || hasNewerVersion;

      if (!hasUpdate) {
        return { hasUpdate: false, isMandatory: false, updateInfo: null };
      }

      // Check if update is mandatory / blocking
      const isMandatory =
        Boolean(data.forceUpdate) ||
        CURRENT_BUILD_NUMBER < minRequiredBuild ||
        compareVersions(CURRENT_APP_VERSION, minRequiredVersion) < 0;

      const updateInfo: AppUpdateInfo = {
        version: remoteVersion,
        buildNumber: remoteBuild,
        currentVersion: CURRENT_APP_VERSION,
        currentBuildNumber: CURRENT_BUILD_NUMBER,
        minRequiredVersion,
        minRequiredBuild,
        forceUpdate: isMandatory,
        apkDownloadUrl: data.apkDownloadUrl || 'https://github.com/startap-arcade/releases/download/v2.5.0/star-tap-arcade-v2.5.0.apk',
        fileSizeMb: data.fileSizeMb || 28.5,
        releaseDate: data.releaseDate || new Date().toISOString().split('T')[0],
        title: data.title || {
          es: '¡Nueva Versión Galáctica Disponible!',
          en: 'New Galactic Version Available!',
        },
        highlights: data.highlights || {
          es: [
            '⚔️ Mejoras de rendimiento en duelos 1v1',
            '🏛️ Nuevas funciones en Constelaciones y chat del clan',
            '⚡ Mayor fluidez en pantallas táctiles de alta frecuencia',
          ],
          en: [
            '⚔️ Performance improvements in 1v1 duels',
            '🏛️ New features in Constellations & clan chat',
            '⚡ Smoother responsiveness on high refresh rate displays',
          ],
        },
        rewardCoins: data.rewardCoins || 500,
        rewardStardust: data.rewardStardust || 100,
      };

      return {
        hasUpdate: true,
        isMandatory,
        updateInfo,
      };
    } catch (err) {
      console.warn('Update check failed (offline or server error):', err);
      return { hasUpdate: false, isMandatory: false, updateInfo: null };
    }
  },

  /**
   * Check if user dismissed this version in the last 24 hours (for optional updates only)
   */
  isUpdateDismissed(version: string): boolean {
    try {
      const dismissedVer = localStorage.getItem(STORAGE_KEY_DISMISSED_VERSION);
      const dismissedTime = localStorage.getItem(STORAGE_KEY_DISMISSED_TIME);
      if (dismissedVer === version && dismissedTime) {
        const timeDiff = Date.now() - parseInt(dismissedTime, 10);
        // Remind again after 24 hours
        if (timeDiff < 24 * 60 * 60 * 1000) {
          return true;
        }
      }
    } catch {
      // Ignore
    }
    return false;
  },

  /**
   * Dismiss update notice for 24 hours
   */
  dismissUpdate(version: string): void {
    try {
      localStorage.setItem(STORAGE_KEY_DISMISSED_VERSION, version);
      localStorage.setItem(STORAGE_KEY_DISMISSED_TIME, Date.now().toString());
    } catch {
      // Ignore
    }
  },

  /**
   * Check if player has already claimed the reward for this version
   */
  isUpdateRewardClaimed(version: string): boolean {
    try {
      const claimed = JSON.parse(localStorage.getItem(STORAGE_KEY_CLAIMED_UPDATE_REWARD) || '[]');
      return Array.isArray(claimed) && claimed.includes(version);
    } catch {
      return false;
    }
  },

  /**
   * Mark update bonus as claimed
   */
  claimUpdateReward(version: string): boolean {
    try {
      const claimed = JSON.parse(localStorage.getItem(STORAGE_KEY_CLAIMED_UPDATE_REWARD) || '[]');
      if (!claimed.includes(version)) {
        claimed.push(version);
        localStorage.setItem(STORAGE_KEY_CLAIMED_UPDATE_REWARD, JSON.stringify(claimed));
        return true;
      }
    } catch {
      // Ignore
    }
    return false;
  },
};
