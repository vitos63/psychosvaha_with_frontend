type WebAppFormName = 'client' | 'therapist_first' | 'therapist_second';

export const notifyTelegramWebAppFormSubmitted = async (
    form: WebAppFormName,
    tgId?: number,
): Promise<void> => {
    const webApp = window.Telegram?.WebApp;

    if (!webApp?.sendData) {
        return;
    }

    webApp.sendData(JSON.stringify({
        type: 'form_submitted',
        form_type: form,
        tg_id: tgId ?? webApp.initDataUnsafe?.user?.id,
    }));
};