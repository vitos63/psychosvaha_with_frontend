type WebAppFormName = 'client' | 'therapist_first' | 'therapist_second';

export const notifyTelegramWebAppFormSubmitted = (form: WebAppFormName): void => {
    const webApp = window.Telegram?.WebApp;

    if (!webApp || typeof webApp.sendData !== 'function') {
        return;
    }

    webApp.sendData(
        JSON.stringify({
            action: 'form_submitted',
            form,
        }),
    );

    if (typeof webApp.close === 'function') {
        webApp.close();
    }
};
