interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  initData?: string;
  sendData?: (data: string) => void;
  close?: () => void;
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

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
