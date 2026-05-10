import { useEffect, useMemo, useState } from 'react';
import { getRecommendedTherapists } from '../../api/clientRequestApi';
import { Therapist } from '../../interfaces/TherapistInterface';
import './SelectedTherapistsPage.css';

function SelectedTherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const recommendedTherapists = await getRecommendedTherapists(tgId);
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
  const format = useMemo(() => {
    if (currentTherapist?.online === undefined || currentTherapist?.online === null) {
      return null;
    }

    return currentTherapist.online ? 'Онлайн' : 'Очно';
  }, [currentTherapist]);

  if (loading) {
    return <div className="selected-therapists-page">Загружаем терапевтов...</div>;
  }

  if (error) {
    return <div className="selected-therapists-page">{error}</div>;
  }

  if (!therapists.length || !currentTherapist) {
    return <div className="selected-therapists-page">Пока нет рекомендованных терапевтов</div>;
  }

  const avatarSrc = currentTherapist.avatar_path || currentTherapist.photo;
  const isFirstTherapist = currentIndex === 0;
  const isLastTherapist = currentIndex === therapists.length - 1;

  return (
    <div className="selected-therapists-page">
      <div className="therapist-counter">{`${currentIndex + 1}/${therapists.length}`}</div>

      <article className="therapist-card">
        {avatarSrc ? (
          <img className="therapist-photo" src={avatarSrc} alt="Фото терапевта" />
        ) : (
          <div className="therapist-photo-placeholder">Фото отсутствует</div>
        )}

        <h2 className="therapist-name">{`${currentTherapist.first_name ?? ''} ${currentTherapist.last_name ?? ''}`.trim()}</h2>

        {currentTherapist.city && <p><strong>Город:</strong> {currentTherapist.city}</p>}
        {currentTherapist.age !== undefined && currentTherapist.age !== null && <p><strong>Возраст:</strong> {currentTherapist.age}</p>}
        {currentTherapist.experience !== undefined && currentTherapist.experience !== null && <p><strong>Опыт:</strong> {currentTherapist.experience}</p>}
        {format && <p><strong>Формат:</strong> {format}</p>}
        {currentTherapist.pitch && <p><strong>О себе:</strong> {currentTherapist.pitch}</p>}
        {currentTherapist.currency_amount && <p><strong>Стоимость:</strong> {JSON.stringify(currentTherapist.currency_amount)}</p>}
        {currentTherapist.contacts_for_client && <p><strong>Контакты:</strong> {currentTherapist.contacts_for_client}</p>}
        {currentTherapist.site && <p><strong>Сайт:</strong> <a href={currentTherapist.site} target="_blank" rel="noreferrer">{currentTherapist.site}</a></p>}
      </article>

      <div className="therapist-navigation">
        <button
          type="button"
          className="nav-button"
          onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
          disabled={isFirstTherapist}
        >
          Предыдущий
        </button>

        <button
          type="button"
          className="nav-button"
          onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, therapists.length - 1))}
          disabled={isLastTherapist}
        >
          Следующий
        </button>
      </div>
    </div>
  );
}

export default SelectedTherapistsPage;
