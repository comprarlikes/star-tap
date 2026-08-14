import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

let isNotificationPermissionGranted = false;

export async function initNotifications(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display === 'granted') {
        isNotificationPermissionGranted = true;
      } else {
        const req = await LocalNotifications.requestPermissions();
        isNotificationPermissionGranted = req.display === 'granted';
      }

      // Create a default notification channel for Android
      if (Capacitor.getPlatform() === 'android') {
        await LocalNotifications.createChannel({
          id: 'arcade_rewards',
          name: 'Recompensas y Misiones',
          description: 'Notificaciones sobre misiones diarias y subidas de nivel',
          importance: 4, // High importance
          visibility: 1,
          sound: 'notification.wav',
          vibration: true,
        });
      }

      console.log('[Push Notifications] Native permissions status:', isNotificationPermissionGranted);
      return isNotificationPermissionGranted;
    } catch (err) {
      console.warn('[Push Notifications] Native permission check failed:', err);
    }
  } else if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      if (Notification.permission === 'granted') {
        isNotificationPermissionGranted = true;
      } else if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        isNotificationPermissionGranted = perm === 'granted';
      }
      console.log('[Push Notifications] Web permissions status:', isNotificationPermissionGranted);
      return isNotificationPermissionGranted;
    } catch (err) {
      console.warn('[Push Notifications] Web permission check failed:', err);
    }
  }
  return false;
}

export async function sendLocalNotification(
  id: number,
  title: string,
  body: string,
  data?: Record<string, any>
) {
  console.log(`[Push Notification Trigger] ID: ${id} | ${title} - ${body}`);

  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title,
            body,
            channelId: 'arcade_rewards',
            smallIcon: 'ic_stat_icon_config_sample',
            extra: data || {},
          },
        ],
      });
      console.log('[Push Notifications] Scheduled native local notification successfully.');
      return;
    } catch (err) {
      console.warn('[Push Notifications] Native schedule failed:', err);
    }
  }

  // Web Browser Notification Fallback
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png',
        tag: `notification_${id}`,
      });
    } catch (e) {
      console.warn('[Push Notifications] Web notification fallback error:', e);
    }
  }
}

export async function notifyDailyQuestsUpdated(questCount: number = 3) {
  await sendLocalNotification(
    1001,
    '📅 ¡Misiones Diarias Actualizadas!',
    `Tus ${questCount} misiones de hoy ya están listas. ¡Complétalas para ganar gemas, XP y monedas!`,
    { type: 'quests_reset' }
  );
}

export async function notifyLevelUpReward(newLevel: number, bonusCoins: number) {
  await sendLocalNotification(
    2000 + newLevel,
    `🎉 ¡Subiste al Nivel ${newLevel}!`,
    `¡Enhorabuena! Has desbloqueado nuevas recompensas e insignias. Recibiste +${bonusCoins} monedas estelares.`,
    { type: 'level_up', level: newLevel }
  );
}

export async function scheduleDailyQuestReminder() {
  if (Capacitor.isNativePlatform()) {
    try {
      // Schedule reminder for tomorrow at 9:00 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);

      await LocalNotifications.schedule({
        notifications: [
          {
            id: 9001,
            title: '⭐ ¡Nuevas Misiones Diarias Disponibles!',
            body: 'Entra a Star Tap Arcade ahora para reclamar tus monedas y mantener tu racha activa.',
            schedule: { at: tomorrow },
            channelId: 'arcade_rewards',
          },
        ],
      });
      console.log('[Push Notifications] Scheduled 24h daily quest reminder.');
    } catch (err) {
      console.warn('[Push Notifications] Failed to schedule reminder:', err);
    }
  }
}

export async function cancelDailyQuestReminder() {
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.cancel({
        notifications: [{ id: 9001 }],
      });
      console.log('[Push Notifications] Cancelled daily quest reminder.');
    } catch (err) {
      console.warn('[Push Notifications] Failed to cancel reminder:', err);
    }
  }
}

export async function toggleDailyQuestReminder(enabled: boolean) {
  if (enabled) {
    const granted = await initNotifications();
    if (granted) {
      await scheduleDailyQuestReminder();
    }
  } else {
    await cancelDailyQuestReminder();
  }
}


