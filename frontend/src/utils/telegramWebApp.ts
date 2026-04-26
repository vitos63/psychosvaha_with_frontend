type WebAppFormName = 'client' | 'therapist_first' | 'therapist_second';

const API_BASE_URL: string = process.env.REACT_APP_API_URL;

export const notifyTelegramWebAppFormSubmitted = async (
    form: WebAppFormName,
    tgId?: number,
): Promise<void> => {
    const telegramUserId = tgId ?? window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

    if (!telegramUserId || !API_BASE_URL) {
        return;
    }

    await fetch(`${API_BASE_URL}/tg-webapp/form-submitted`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tg_id: telegramUserId,
            type: form,
        }),
    });
};
