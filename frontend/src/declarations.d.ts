interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  initData?: string;
  sendData?: (data: string) => void;
  close?: () => void;

  version?: string;
  platform?: string;
  isVersionAtLeast?: (version: string) => boolean;

  isExpanded?: boolean;
  viewportHeight?: number;
  viewportStableHeight?: number;

  isFullscreen?: boolean;
  requestFullscreen?: () => void;
  exitFullscreen?: () => void;

  isVerticalSwipesEnabled?: boolean;
  enableVerticalSwipes?: () => void;
  disableVerticalSwipes?: () => void;

  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;

  themeParams?: {
    bg_color?: string;
    secondary_bg_color?: string;
  };

  onEvent?: (eventType: string, callback: (...args: unknown[]) => void) => void;
  offEvent?: (eventType: string, callback: (...args: unknown[]) => void) => void;

  initDataUnsafe?: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      photo_url?: string;
    };
    query_id?: string;
    auth_date?: string;
    hash?: string;
  };
}

interface TelegramBackButton {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
}

interface TelegramWebApp {
  BackButton: TelegramBackButton;
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
