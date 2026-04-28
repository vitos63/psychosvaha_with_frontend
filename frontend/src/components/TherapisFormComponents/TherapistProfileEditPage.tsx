import { Component, ErrorInfo, ReactNode, useEffect, useMemo, useState } from 'react'

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
    const [lastCaughtError, setLastCaughtError] = useState<string | null>(null)
    const [runtimeError, setRuntimeError] = useState<string | null>(null)

    const telegramExists = typeof window !== 'undefined' && Boolean(window.Telegram)
    const webAppExists = Boolean(window.Telegram?.WebApp)
    const initDataExists = Boolean(window.Telegram?.WebApp?.initData)
    const initDataUnsafeUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id ?? null

    const profileState = useMemo(() => {
        if (profile) {
            return 'loaded'
        }
        return 'empty'
    }, [profile])

    useEffect(() => {
        const handleWindowError = (event: ErrorEvent) => {
            const message = event.error?.message || event.message || 'Неизвестная runtime ошибка'
            console.error('window.onerror:', event.error || event.message)
            setRuntimeError(message)
        }
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const message =
                event.reason instanceof Error
                    ? event.reason.message
                    : typeof event.reason === 'string'
                      ? event.reason
                      : 'Unhandled promise rejection'
            console.error('unhandledrejection:', event.reason)
            setRuntimeError(message)
        }

        window.addEventListener('error', handleWindowError)
        window.addEventListener('unhandledrejection', handleUnhandledRejection)

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
                    const missingUserError =
                        'Не удалось определить пользователя Telegram (initDataUnsafe.user.id или tg_id в query string).'
                    setError(missingUserError)
                    setLastCaughtError(missingUserError)
                    setLoading(false)
                    return
                }

                setTgId(userId)
                const response = await getTherapistByTgId(userId)
                setProfile(response)
            } catch (err) {
                console.error('Ошибка загрузки анкеты специалиста:', err)
                const rawErrorMessage = err instanceof Error ? err.message : String(err)
                setLastCaughtError(rawErrorMessage)
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
            const rawErrorMessage =
                unexpectedError instanceof Error ? unexpectedError.message : String(unexpectedError)
            setLastCaughtError(rawErrorMessage)
            setError('Критическая ошибка загрузки анкеты.')
            setLoading(false)
        })

        return () => {
            window.removeEventListener('error', handleWindowError)
            window.removeEventListener('unhandledrejection', handleUnhandledRejection)
        }
    }, [])

    const debugRows = [
        { label: 'window.Telegram', value: telegramExists ? 'yes' : 'no' },
        { label: 'window.Telegram.WebApp', value: webAppExists ? 'yes' : 'no' },
        { label: 'window.Telegram.WebApp.initData', value: initDataExists ? 'yes' : 'no' },
        { label: 'window.Telegram.WebApp.initDataUnsafe.user.id', value: String(initDataUnsafeUserId ?? 'null') },
        { label: 'loading', value: String(loading) },
        { label: 'error', value: error ?? 'null' },
        { label: 'profile', value: profileState },
        { label: 'lastCaughtError', value: lastCaughtError ?? 'null' },
        { label: 'runtimeError', value: runtimeError ?? 'null' },
    ]

    if (loading) {
        return (
            <div style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0 }}>Загрузка анкеты...</h3>
                <DebugPanel rows={debugRows} />
            </div>
        )
    }

    if (error) {
        return (
            <div style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0 }}>{error}</h3>
                <DebugPanel rows={debugRows} />
            </div>
        )
    }

    if (!tgId || !profile) {
        return (
            <div style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0 }}>Не удалось загрузить анкету.</h3>
                <DebugPanel rows={debugRows} />
            </div>
        )
    }

    return (
        <div style={{ padding: 20 }}>
            <DebugPanel rows={debugRows} />
            <TherapistFormErrorBoundary>
                <TherapistSecondFormComponent client_id={tgId} initialData={profile} mode="edit" />
            </TherapistFormErrorBoundary>
        </div>
    )
}

function DebugPanel({ rows }: { rows: Array<{ label: string; value: string }> }) {
    return (
        <details open style={{ marginBottom: 16, border: '1px solid #ddd', borderRadius: 8, padding: '10px 12px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Debug info</summary>
            <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
                {rows.map((row) => (
                    <div key={row.label} style={{ fontSize: 14 }}>
                        <strong>{row.label}:</strong> {row.value}
                    </div>
                ))}
            </div>
        </details>
    )
}

export default TherapistProfileEditPage
