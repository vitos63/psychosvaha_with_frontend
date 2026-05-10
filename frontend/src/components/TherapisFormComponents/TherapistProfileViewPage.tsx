import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ApiError, avatarPathToMediaUrl } from '../../api/api'
import { getTherapistByTgId } from '../../api/therapistApi'
import { TAG_CATEGORIES } from '../../constants/tags'
import { TherapistByTgIdResponse } from '../../interfaces/TherapistInterface'
import '../Form.css'

function resolveTgIdFromEnvironment(): number | null {
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

type TagEntry = { id: number; title: string }

function tagTitleById(tagId: number): string | null {
    const categories = Object.values(TAG_CATEGORIES) as ReadonlyArray<readonly TagEntry[]>
    for (const tags of categories) {
        const found = tags.find((t) => t.id === tagId)
        if (found) {
            return found.title
        }
    }
    return null
}

function TherapistProfileViewPage() {
    const navigate = useNavigate()
    const [profile, setProfile] = useState<TherapistByTgIdResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const avatarSrc = useMemo(() => {
        if (!profile) {
            return null
        }
        return avatarPathToMediaUrl(profile.avatar_path)
    }, [profile])

    const tagLabels = useMemo(() => {
        if (!profile?.tag_ids?.length) {
            return [] as string[]
        }
        return profile.tag_ids
            .map((id) => tagTitleById(id))
            .filter((t): t is string => Boolean(t))
    }, [profile])

    useEffect(() => {
        const loadProfile = async () => {
            try {
                window.Telegram?.WebApp?.ready?.()
                window.Telegram?.WebApp?.expand?.()

                const userId = resolveTgIdFromEnvironment()
                if (!userId) {
                    setError(
                        'Не удалось определить пользователя Telegram (initDataUnsafe.user.id или tg_id в query string).',
                    )
                    setLoading(false)
                    return
                }

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

    const currencyLines = useMemo(() => {
        if (!profile?.currency_amount || typeof profile.currency_amount !== 'object') {
            return [] as string[]
        }
        const m = profile.currency_amount as Record<string, number>
        const parts: string[] = []
        if ('RUB' in m && m.RUB > 0) {
            parts.push(`Рубли: ${m.RUB}`)
        }
        if ('USD' in m && m.USD > 0) {
            parts.push(`Доллары: ${m.USD}`)
        }
        if ('EUR' in m && m.EUR > 0) {
            parts.push(`Евро: ${m.EUR}`)
        }
        return parts
    }, [profile])

    if (loading) {
        return (
            <div style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0 }}>Загрузка профиля...</h3>
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0 }}>{error ?? 'Не удалось загрузить анкету.'}</h3>
            </div>
        )
    }

    const row = (label: string, value: string | null | undefined) => (
        <div className="profile-view-row" style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: '#636e72', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 15, color: '#2d3436', whiteSpace: 'pre-wrap' }}>
                {value && String(value).trim() ? value : '—'}
            </div>
        </div>
    )

    return (
        <div className="client-form therapist-profile-view">
            <h2 style={{ marginTop: 0, marginBottom: 8, color: '#2d3436' }}>Ваш профиль</h2>
            <p style={{ marginTop: 0, marginBottom: 24, color: '#636e72', fontSize: 14 }}>
                Данные из отправленной анкеты. Нажмите «Изменить», чтобы отредактировать форму.
            </p>

            {avatarSrc ? (
                <div style={{ marginBottom: 20, textAlign: 'center' }}>
                    <img
                        src={avatarSrc}
                        alt=""
                        style={{
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '3px solid #e9ecef',
                        }}
                    />
                </div>
            ) : null}

            {row('Имя и фамилия', `${profile.first_name} ${profile.last_name}`.trim())}
            {row('Город', profile.city ?? undefined)}
            {row('Телефон', profile.phone_number ?? undefined)}
            {row('Email', profile.email ?? undefined)}
            {row('Сайт', profile.site ?? undefined)}
            {row('О себе', profile.pitch ?? undefined)}
            {row('Пол', profile.sex)}
            {row('Возраст', String(profile.age))}
            {row('Стаж (лет)', String(profile.experience))}
            {row('Возраст клиентов', `${profile.min_client_age}–${profile.max_client_age} лет`)}
            {row('Принимаете ли онлайн?', profile.online ? 'Да' : 'Нет')}
            {row('Готов принимать клиентов', profile.available_to_call ? 'Да' : 'Нет')}
            {row('Контакты для клиента', profile.contacts_for_client ?? undefined)}
            {row('Стоимость сессии', currencyLines.length ? currencyLines.join(' · ') : undefined)}

            {tagLabels.length > 0 ? (
                <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 13, color: '#636e72', marginBottom: 8 }}>Работает с </div>
                    <ul
                        style={{
                            margin: 0,
                            paddingLeft: 20,
                            fontSize: 15,
                            color: '#2d3436',
                            lineHeight: 1.6,
                        }}
                    >
                        {tagLabels.map((title, index) => (
                            <li key={`${title}-${index}`}>{title}</li>
                        ))}
                    </ul>
                </div>
            ) : null}

            <div className="form-actions" style={{ marginTop: 28 }}>
                <button
                    type="button"
                    className="submit-btn"
                    onClick={() => navigate('/therapist/profile/edit')}
                >
                    Изменить
                </button>
            </div>
        </div>
    )
}

export default TherapistProfileViewPage
