type WebAppFormName = 'client' | 'therapist_first' | 'therapist_second';

export const notifyTelegramWebAppFormSubmitted = async (
    form: WebAppFormName,
    tgId?: number,
): Promise<void> => {
    const telegramUserId = tgId ?? window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

    if (!telegramUserId) {
        return;
    }

    await fetch(`${process.env.REACT_APP_API_URL}/tg-webapp/form-submitted`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tg_id: telegramUserId,
            form_type: form,
        }),
    });
};
