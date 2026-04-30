import { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react'

import { ApiError, getTherapistByTgId } from '../../api/api'
import { TherapistByTgIdResponse } from '../../interfaces/TherapistInterface'
import TherapistSecondFormComponent from './TherapistSecondFormComponen'

type TherapistFormErrorBoundaryProps = {
    children: ReactNode
}

type TherapistFormErrorBoundaryState = {
    hasError: boolean
    errorMessage: string | null
}

class TherapistFormErrorBoundary extends Component<
    TherapistFormErrorBoundaryProps,
    TherapistFormErrorBoundaryState
> {
    state: TherapistFormErrorBoundaryState = {
        hasError: false,
        errorMessage: null,
    }

    static getDerivedStateFromError(error: Error): TherapistFormErrorBoundaryState {
        return {
            hasError: true,
            errorMessage: error?.message ?? 'Неизвестная ошибка',
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Ошибка отображения TherapistSecondFormComponent:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 16, border: '1px solid #f3a2a2', borderRadius: 8, background: '#fff5f5' }}>
                    Ошибка отображения формы: {this.state.errorMessage}
                </div>
            )
        }

        return this.props.children
    }
}

function TherapistProfileEditPage() {
    const [tgId, setTgId] = useState<number | null>(null)
    const [profile, setProfile] = useState<TherapistByTgIdResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const resolveTgId = (): number | null => {
            const webAppUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id
            if (typeof webAppUserId === 'number' && Number.isFinite(webAppUserId)) {
                return webAppUserId
            }

            const queryUserId = new URLSearchParams(window.location.search).get('tg_id')
            if (!queryUserId) {
                return null
            }
            const parsedId = Number(queryUserId)
            if (!Number.isFinite(parsedId)) {
                return null
            }
            return parsedId
        }

        const loadProfile = async () => {
            try {
                window.Telegram?.WebApp?.ready?.()
                window.Telegram?.WebApp?.expand?.()

                const userId = resolveTgId()
                if (!userId) {
                    setError('Не удалось определить пользователя Telegram (initDataUnsafe.user.id или tg_id в query string).')
                    setLoading(false)
                    return
                }

                setTgId(userId)
                const response = await getTherapistByTgId(userId)
                setProfile(response)
            } catch (err) {
                console.error('Ошибка загрузки анкеты специалиста:', err)
                if (err instanceof ApiError && err.status === 404) {
                    setError('Анкета специалиста не найдена. Откройте этот раздел через Telegram-бота.')
                } else {
                    setError('Не удалось загрузить анкету. Попробуйте позже.')
                }
            } finally {
                setLoading(false)
            }
        }

        void loadProfile().catch((unexpectedError) => {
            console.error('Непредвиденная ошибка loadProfile:', unexpectedError)
            setError('Критическая ошибка загрузки анкеты.')
            setLoading(false)
        })
    }, [])

    if (loading) {
        return (
            <div style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0 }}>Загрузка анкеты...</h3>
            </div>
        )
    }

    if (error) {
        return (
            <div style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0 }}>{error}</h3>
            </div>
        )
    }

    if (!tgId || !profile) {
        return (
            <div style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0 }}>Не удалось загрузить анкету.</h3>
            </div>
        )
    }

    return (
        <div className="therapist-profile-edit-page" style={{ padding: 20 }}>
            <TherapistFormErrorBoundary>
                <TherapistSecondFormComponent client_id={tgId} initialData={profile} mode="edit" />
            </TherapistFormErrorBoundary>
        </div>
    )
}

export default TherapistProfileEditPage
