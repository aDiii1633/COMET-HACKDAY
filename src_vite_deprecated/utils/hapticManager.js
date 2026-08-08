/**
 * SafeSphere AI — Haptic Vibration Patterns Manager
 * Provides tactile feedback for safety warnings and user interactions.
 */

export const triggerHaptic = (type = 'light') => {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (type) {
      case 'light':
        // Soft tactile press for buttons
        navigator.vibrate(15);
        break;

      case 'medium':
        // Navigation step change
        navigator.vibrate(40);
        break;

      case 'warning_level1':
        // Double pulse warning for approaching high-risk area
        navigator.vibrate([100, 50, 100]);
        break;

      case 'danger_level2':
        // Persistent high-urgency vibration pattern for critical escalation
        navigator.vibrate([200, 100, 200, 100, 300]);
        break;

      case 'success':
        // Route safely started / target reached
        navigator.vibrate([30, 30, 60]);
        break;

      default:
        navigator.vibrate(20);
        break;
    }
  } catch (error) {
    console.warn('Haptic vibration failed or blocked by device:', error);
  }
};
