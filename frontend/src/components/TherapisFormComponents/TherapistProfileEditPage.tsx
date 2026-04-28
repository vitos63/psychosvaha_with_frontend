import { useEffect, useState } from 'react'

import { ApiError, getTherapistByTgId } from '../../api/api'
import { TherapistByTgIdResponse } from '../../interfaces/TherapistInterface'
import TherapistSecondFormComponent from './TherapistSecondFormComponen'

function TherapistProfileEditPage() {
    const [tgId, setTgId] = useState<number | null>(null)
    const [profile, setProfile] = useState<TherapistByTgIdResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id

        if (!userId) {
            setError('Не удалось определить пользователя Telegram. Откройте страницу через Telegram.')
            setLoading(false)
            return
        }

        setTgId(userId)

        const loadProfile = async () => {
            try {
                const response = await getTherapistByTgId(userId)
                setProfile(response)
            } catch (err) {
                if (err instanceof ApiError && err.status === 404) {
                    setError('Анкета специалиста не найдена. Откройте этот раздел через Telegram-бота.')
                } else {
                    setError('Не удалось загрузить анкету. Попробуйте позже.')
                }
            } finally {
                setLoading(false)
            }
        }

        void loadProfile()
    }, [])

    if (loading) {
        return <div style={{ padding: 20 }}>Загрузка анкеты...</div>
    }

    if (error) {
        return <div style={{ padding: 20 }}>{error}</div>
    }

    if (!tgId || !profile) {
        return <div style={{ padding: 20 }}>Не удалось загрузить анкету.</div>
    }

    return <TherapistSecondFormComponent client_id={tgId} initialData={profile} mode="edit" />
}

export default TherapistProfileEditPage
