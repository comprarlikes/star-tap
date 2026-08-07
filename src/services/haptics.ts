import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

class HapticManager {
  private enabled: boolean = true;

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // Subtle light vibration for normal star taps and menu button clicks
  public async lightTap() {
    if (!this.enabled) return;
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (err) {
        // Safe fallback
      }
    } else if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch (e) {}
    }
  }

  // Medium vibration for golden stars, multipliers, power-ups
  public async mediumTap() {
    if (!this.enabled) return;
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch (err) {
        // Safe fallback
      }
    } else if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch (e) {}
    }
  }

  // Heavy impact for diamond stars, rainbow bonus, fever mode activation
  public async heavyTap() {
    if (!this.enabled) return;
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } catch (err) {
        // Safe fallback
      }
    } else if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(45);
      } catch (e) {}
    }
  }

  // Strong error pulse for hitting bombs or losing life
  public async bombExplosion() {
    if (!this.enabled) return;
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.notification({ type: NotificationType.Error });
      } catch (err) {
        try {
          await Haptics.impact({ style: ImpactStyle.Heavy });
        } catch (e) {}
      }
    } else if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate([60, 40, 90]);
      } catch (e) {}
    }
  }

  // Success notification vibration for Level Up, claiming quests, victory
  public async success() {
    if (!this.enabled) return;
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.notification({ type: NotificationType.Success });
      } catch (err) {
        try {
          await Haptics.impact({ style: ImpactStyle.Medium });
        } catch (e) {}
      }
    } else if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate([20, 30, 20]);
      } catch (e) {}
    }
  }

  // Combo feedback - escalates with higher combos
  public async comboTrigger(comboCount: number) {
    if (!this.enabled) return;
    if (comboCount % 10 === 0) {
      this.heavyTap();
    } else if (comboCount % 5 === 0) {
      this.mediumTap();
    } else {
      this.lightTap();
    }
  }

  // Selection change feedback for tab navigation or toggles
  public async selection() {
    if (!this.enabled) return;
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.selectionStart();
        await Haptics.selectionChanged();
      } catch (err) {
        this.lightTap();
      }
    } else {
      this.lightTap();
    }
  }
}

export const hapticManager = new HapticManager();
