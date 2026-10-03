export const tg = window.Telegram?.WebApp;

export function initTelegram() {
  if (!tg) return;
  tg.ready();
  tg.expand();
  try {
    tg.setHeaderColor('#243f5e');
    tg.setBackgroundColor('#243f5e');
    tg.disableVerticalSwipes?.();
  } catch {}
}

export const getInitData = () => tg?.initData || '';
export const getTgUser = () => tg?.initDataUnsafe?.user || null;

export function haptic(type = 'light') {
  try {
    if (type === 'success' || type === 'error') tg?.HapticFeedback?.notificationOccurred(type);
    else tg?.HapticFeedback?.impactOccurred(type);
  } catch {}
}

export function openLink(url) {
  if (tg?.openLink) tg.openLink(url);
  else window.open(url, '_blank');
}
