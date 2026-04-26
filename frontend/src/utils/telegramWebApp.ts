type WebAppFormName = 'client' | 'therapist_first' | 'therapist_second';

export const notifyTelegramWebAppFormSubmitted = async (
    _form: WebAppFormName,
    _tgId?: number,
): Promise<void> => {
    return Promise.resolve();
};
