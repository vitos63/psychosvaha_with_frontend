import { useEffect, useMemo, useState } from 'react';

import { avatarPathToMediaUrl } from '../../api/api';
import { getRecommendedTherapists } from '../../api/clientRequestApi';
import { Therapist } from '../../interfaces/TherapistInterface';
import '../Form.css';
import './SelectedTherapistsPage.css';
import { useParams } from 'react-router-dom';

const CURRENCY_META: Record<string, { name: string; symbol: string; locale: string }> = {
  RUB: { name: 'Рубли', symbol: '₽', locale: 'ru-RU' },
  USD: { name: 'Доллары', symbol: '$', locale: 'en-US' },
  EUR: { name: 'Евро', symbol: '€', locale: 'de-DE' },
};

function formatAmount(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(amount);
}

function buildAvatarSrc(therapist: Therapist | undefined): string | null {
  if (!therapist) {
    return null;
  }
  const fromPath = avatarPathToMediaUrl(therapist.avatar_path);
  if (fromPath) {
    return fromPath;
  }
  return therapist.photo?.trim() ? therapist.photo : null;
}

function SelectedTherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { request_id } = useParams();

  useEffect(() => {
    const loadTherapists = async () => {
      const tgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

      if (typeof tgId !== 'number' || !Number.isFinite(tgId)) {
        setError('Не удалось определить пользователя Telegram');
        setLoading(false);
        return;
      }

      try {
        window.Telegram?.WebApp?.ready?.();
        window.Telegram?.WebApp?.expand?.();

        const recommendedTherapists = await getRecommendedTherapists(Number(request_id));
        setTherapists(recommendedTherapists);
      } catch (requestError) {
        console.error('Ошибка загрузки рекомендаций терапевтов:', requestError);
        setError('Не удалось загрузить рекомендации. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    void loadTherapists();
  }, []);

  const currentTherapist = therapists[currentIndex];

  const avatarSrc = useMemo(() => buildAvatarSrc(currentTherapist), [currentTherapist]);

  const onlineLabel = useMemo(() => {
    if (currentTherapist?.online === undefined || currentTherapist?.online === null) {
      return undefined;
    }
    return currentTherapist.online ? 'Да' : 'Нет';
  }, [currentTherapist]);

  const currencyChips = useMemo(() => {
    if (!currentTherapist?.currency_amount || typeof currentTherapist.currency_amount !== 'object') {
      return [] as Array<{ code: string; name: string; symbol: string; formatted: string }>;
    }
    const m = currentTherapist.currency_amount as Record<string, number>;
    const order: Array<keyof typeof CURRENCY_META> = ['RUB', 'USD', 'EUR'];
    return order
      .filter((code) => code in m && (m[code] ?? 0) > 0)
      .map((code) => {
        const meta = CURRENCY_META[code];
        return {
          code,
          name: meta.name,
          symbol: meta.symbol,
          formatted: formatAmount(m[code], meta.locale),
        };
      });
  }, [currentTherapist]);

  if (loading) {
    return (
      <div className="selected-therapists-page">
        <div className="client-form selected-therapist-card">
          <h3 style={{ marginTop: 0 }}>Загружаем терапевтов...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="selected-therapists-page">
        <div className="client-form selected-therapist-card">
          <h3 style={{ marginTop: 0 }}>{error}</h3>
        </div>
      </div>
    );
  }

  if (!therapists.length || !currentTherapist) {
    return (
      <div className="selected-therapists-page">
        <div className="client-form selected-therapist-card">
          <h3 style={{ marginTop: 0 }}>Пока нет рекомендованных терапевтов</h3>
        </div>
      </div>
    );
  }

  const isFirstTherapist = currentIndex === 0;
  const isLastTherapist = currentIndex === therapists.length - 1;
  const fullName = `${currentTherapist.first_name ?? ''} ${currentTherapist.last_name ?? ''}`.trim();

  const row = (label: string, value: string | null | undefined) => (
    <div className="profile-view-row" style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 13, color: '#636e72', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15, color: '#2d3436', whiteSpace: 'pre-wrap' }}>
        {value && String(value).trim() ? value : '—'}
      </div>
    </div>
  );

  return (
    <div className="selected-therapists-page">
      <div className="client-form selected-therapist-card">
        <div className="selected-therapist-counter">
          {currentIndex + 1} / {therapists.length}
        </div>

        {avatarSrc ? (
          <div style={{ marginBottom: 16, textAlign: 'center' }}>
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
        ) : (
          <div className="selected-therapist-photo-placeholder">Фото отсутствует</div>
        )}

        <h2 className="selected-therapist-name">{fullName || 'Без имени'}</h2>

        {row('Город', currentTherapist.city ?? undefined)}
        {row(
          'Возраст',
          currentTherapist.age !== undefined && currentTherapist.age !== null
            ? String(currentTherapist.age)
            : undefined,
        )}
        {row(
          'Стаж (лет)',
          currentTherapist.experience !== undefined && currentTherapist.experience !== null
            ? String(currentTherapist.experience)
            : undefined,
        )}
        {row('Принимает ли онлайн', onlineLabel)}
        {row('О себе', currentTherapist.pitch ?? undefined)}
        {row('Контакты для связи', currentTherapist.contacts_for_client ?? undefined)}

        <div className="profile-view-row" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: '#636e72', marginBottom: 4 }}>Сайт</div>
          {currentTherapist.site ? (
            <a
              href={currentTherapist.site}
              target="_blank"
              rel="noreferrer"
              className="selected-therapist-site-link"
            >
              {currentTherapist.site}
            </a>
          ) : (
            <div style={{ fontSize: 15, color: '#2d3436' }}>—</div>
          )}
        </div>

        <div className="profile-view-row" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: '#636e72', marginBottom: 8 }}>Стоимость сессии</div>
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

        <div className="selected-therapist-navigation">
          <button
            type="button"
            className="selected-therapist-nav-button secondary"
            onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
            disabled={isFirstTherapist}
          >
            Предыдущий
          </button>

          <button
            type="button"
            className="selected-therapist-nav-button primary"
            onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, therapists.length - 1))}
            disabled={isLastTherapist}
          >
            Следующий
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectedTherapistsPage;
