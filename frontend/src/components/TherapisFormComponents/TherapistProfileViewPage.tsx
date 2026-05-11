import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ApiError, avatarPathToMediaUrl } from '../../api/api'
import { getTherapistByTgId } from '../../api/therapistApi'
import {
    TAG_CATEGORIES,
    TAG_CATEGORY_SHORT_LABELS,
    type TagCategoryKey,
} from '../../constants/tags'
import { TherapistByTgIdResponse } from '../../interfaces/TherapistInterface'
import '../Form.css'

const CURRENCY_META: Record<string, { name: string; symbol: string; locale: string }> = {
    RUB: { name: 'Рубли', symbol: '₽', locale: 'ru-RU' },
    USD: { name: 'Доллары', symbol: '$', locale: 'en-US' },
    EUR: { name: 'Евро', symbol: '€', locale: 'de-DE' },
}

function formatAmount(amount: number, locale: string): string {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(amount)
}

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
type TherapistSpecialization = { id: number; title: string }

const THERAPIST_SPECIALIZATIONS: ReadonlyArray<TherapistSpecialization> = [
    { id: 4, title: 'психиатр' },
    { id: 35, title: 'геронтолог' },
    { id: 25, title: 'семейный терапевт' },
    { id: 43, title: 'групповая терапия' },
    { id: 42, title: 'супервизор' },
]

function buildTagsByCategory(
    selectedTagIds: number[],
): Array<{ category: TagCategoryKey; titles: string[] }> {
    const idSet = new Set(selectedTagIds)
    const result: Array<{ category: TagCategoryKey; titles: string[] }> = []

    for (const category of Object.keys(TAG_CATEGORIES) as TagCategoryKey[]) {
        const tags = TAG_CATEGORIES[category] as ReadonlyArray<TagEntry>
        const titles = tags.filter((t) => idSet.has(t.id)).map((t) => t.title)
        if (titles.length > 0) {
            result.push({ category, titles })
        }
    }
    return result
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

    const tagsByCategory = useMemo(() => {
        if (!profile?.tag_ids?.length) {
            return []
        }
        return buildTagsByCategory(profile.tag_ids)
    }, [profile])

    const specializations = useMemo(() => {
        if (!profile?.tag_ids?.length) {
            return [] as string[]
        }
        const selectedTagIds = new Set(profile.tag_ids)
        return THERAPIST_SPECIALIZATIONS.filter(({ id }) => selectedTagIds.has(id)).map(
            ({ title }) => title,
        )
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

    const currencyChips = useMemo(() => {
        if (!profile?.currency_amount || typeof profile.currency_amount !== 'object') {
            return [] as Array<{ code: string; name: string; symbol: string; formatted: string }>
        }
        const m = profile.currency_amount as Record<string, number>
        const order: Array<keyof typeof CURRENCY_META> = ['RUB', 'USD', 'EUR']
        return order
            .filter((code) => code in m && (m[code] ?? 0) > 0)
            .map((code) => {
                const meta = CURRENCY_META[code]
                return {
                    code,
                    name: meta.name,
                    symbol: meta.symbol,
                    formatted: formatAmount(m[code], meta.locale),
                }
            })
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
            {row('Специализация', specializations.length > 0 ? specializations.join(', ') : undefined)}
            {row('Принимаете ли онлайн?', profile.online ? 'Да' : 'Нет')}
            {row('Готов принимать клиентов', profile.available_to_call ? 'Да' : 'Нет')}
            {row('Контакты для клиента', profile.contacts_for_client ?? undefined)}

            <div className="profile-view-row" style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: '#636e72', marginBottom: 8 }}>
                    Стоимость сессии
                </div>
                {currencyChips.length > 0 ? (
                    <div className="currency-chips">
                        {currencyChips.map((c) => (
                            <div key={c.code} className="currency-chip">
                                <span className="currency-chip-symbol">{c.symbol}</span>
                                <div className="currency-chip-body">
                                    <div className="currency-chip-amount">{c.formatted}</div>
                                    <div className="currency-chip-name">{c.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ fontSize: 15, color: '#2d3436' }}>—</div>
                )}
            </div>

            {tagsByCategory.length > 0 ? (
                <div className="profile-view-row" style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 13, color: '#636e72', marginBottom: 8 }}>
                        Работает с
                    </div>
                    <div className="tag-categories">
                        {tagsByCategory.map(({ category, titles }) => (
                            <div key={category} className="tag-category">
                                <div className="tag-category-title">
                                    {TAG_CATEGORY_SHORT_LABELS[category]}
                                </div>
                                <div className="tag-category-chips">
                                    {titles.map((title, index) => (
                                        <span
                                            key={`${category}-${title}-${index}`}
                                            className="tag-chip"
                                        >
                                            {title}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
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
