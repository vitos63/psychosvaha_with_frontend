import { useCallback, useEffect, useMemo, useState } from 'react';
import { approveClientRequest, approveTherapist, fetchAdminMainInfo, disapproveTherapist } from '../../api/adminApi';
import {
  TAG_CATEGORIES,
  TAG_CATEGORY_LABELS,
  TAG_OPTIONS,
  type TagCategoryKey,
} from '../../constants/tags';
import { AdminMainInfoResponse } from '../../interfaces/AdminMainInfoInterface';
import '../Form.css';
import './AdminDashboardPage.css';
import { useFormState } from 'react-dom';

type AdminDashboardPageProps = {
  tgId: number | undefined;
};

function AdminDashboardPage({ tgId }: AdminDashboardPageProps) {
  const [data, setData] = useState<AdminMainInfoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'main' | 'clients' | 'therapists'>('main');
  const [clientIndex, setClientIndex] = useState(0);
  const [therapistIndex, setTherapistIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [selectedClientTags, setSelectedClientTags] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const knownTagTitles = useMemo(() => new Set(TAG_OPTIONS), []);

  /** Теги из заявок, которых нет в справочнике категорий (показываем отдельным блоком). */
  const extraTagsFromRequests = useMemo(() => {
    if (!data?.not_approved_client_requests) {
      return [];
    }
    const out = new Set<string>();
    data.not_approved_client_requests.forEach((request) => {
      request.tags.forEach((tag) => {
        if (!knownTagTitles.has(tag)) {
          out.add(tag);
        }
      });
    });
    return Array.from(out).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [data, knownTagTitles]);

  const load = useCallback(async () => {
    if (tgId === undefined) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const json = await fetchAdminMainInfo(tgId);
      setData(json);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }, [tgId]);

  useEffect(() => {
    void load();
  }, [load]);

  const therapists = data?.not_approved_therapists ?? [];
  const clients = data?.not_approved_client_requests ?? [];
  const therapistsCount = Array.isArray(therapists) ? therapists.length : 0;
  const clientsCount = Array.isArray(clients) ? clients.length : 0;
  const currentClient = clients[clientIndex];
  const currentTherapist = therapists[therapistIndex];

  useEffect(() => {
    if (currentClient) {
      setSelectedClientTags(currentClient.tags);
    } else {
      setSelectedClientTags([]);
    }
  }, [currentClient]);

  const handleClientTagToggle = (tag: string) => {
    setSelectedClientTags((prevTags) => {
      if (prevTags.includes(tag)) {
        return prevTags.filter((item) => item !== tag);
      }
      return [...prevTags, tag];
    });
  };

  const handleOpenClients = () => {
    setClientIndex(0);
    setView('clients');
  };

  const handleDelete = async () => {
    await disapproveTherapist({
      tg_id: currentTherapist.tg_id
    })
    setShowConfirm(false);
    handlePostponeTherapist()
  };

  const handleOpenTherapists = () => {
    setTherapistIndex(0);
    setView('therapists');
  };

  const handleApproveClient = async () => {
    if (!currentClient) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await approveClientRequest({
        id: currentClient.id,
        problem_description: currentClient.problem_description,
        tags: selectedClientTags,
      });

      setData((prevData) => {
        if (!prevData) {
          return prevData;
        }
        return {
          ...prevData,
          not_approved_client_requests: prevData.not_approved_client_requests.filter(
            (request) => request.id !== currentClient.id,
          ),
        };
      });
      setClientIndex(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось одобрить заявку клиента');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveTherapist = async () => {
    if (!currentTherapist) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await approveTherapist(currentTherapist);
      setData((prevData) => {
        if (!prevData) {
          return prevData;
        }
        return {
          ...prevData,
          not_approved_therapists: prevData.not_approved_therapists.filter(
            (therapist) => therapist.tg_id !== currentTherapist.tg_id,
          ),
        };
      });
      setTherapistIndex(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось одобрить терапевта');
    } finally {
      setSaving(false);
    }
  };

  const handlePostponeTherapist = () => {
    if (therapists.length <= 1) {
      return;
    }
    setTherapistIndex((prevIndex) => (prevIndex + 1) % therapists.length);
  };

  if (tgId === undefined) {
    return (
      <div className="client-form admin-dashboard">
        <p className="admin-dashboard__hint">
          Откройте страницу из Telegram Mini App, чтобы определить администратора.
        </p>
      </div>
    );
  }

  return (
    <div className="client-form admin-dashboard">
      <h1 className="admin-dashboard__title">Панель администратора</h1>

      {loading && <p className="admin-dashboard__status">Загрузка...</p>}
      {error && (
        <p className="admin-dashboard__error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && data && view === 'main' && (
        <div className="admin-dashboard__grid">
          <section className="admin-dashboard__card" aria-labelledby="admin-therapists-heading">
            <h2 id="admin-therapists-heading" className="admin-dashboard__card-title">
              Терапевты на модерации
            </h2>
            <p
              className={
                therapistsCount === 0
                  ? 'admin-dashboard__count admin-dashboard__count--empty'
                  : 'admin-dashboard__count'
              }
            >
              {therapistsCount === 0
                ? 'Нет терапевтов для модерации'
                : therapistsCount}
            </p>
            <button
              type="button"
              className="admin-dashboard__action"
              disabled={therapistsCount === 0}
              onClick={handleOpenTherapists}
            >
              Посмотреть
            </button>
          </section>

          <section className="admin-dashboard__card" aria-labelledby="admin-clients-heading">
            <h2 id="admin-clients-heading" className="admin-dashboard__card-title">
              Заявки клиентов на модерации
            </h2>
            <p
              className={
                clientsCount === 0
                  ? 'admin-dashboard__count admin-dashboard__count--empty'
                  : 'admin-dashboard__count'
              }
            >
              {clientsCount === 0
                ? 'Нет клиентов для модерации'
                : clientsCount}
            </p>
            <button
              type="button"
              className="admin-dashboard__action"
              disabled={clientsCount === 0}
              onClick={handleOpenClients}
            >
              Посмотреть
            </button>
          </section>
        </div>
      )}

      {!loading && data && view === 'clients' && (
        <section className="admin-dashboard__details" aria-labelledby="admin-client-details-heading">
          <h2 id="admin-client-details-heading" className="admin-dashboard__card-title">
            Заявки клиентов на модерации
          </h2>
          <button
            type="button"
            className="admin-dashboard__back"
            onClick={() => setView('main')}
            disabled={saving}
          >
            Назад
          </button>

          {!currentClient && <p className="admin-dashboard__status">Нет заявок клиентов для модерации</p>}

          {currentClient && (
            <>
              <p className="admin-dashboard__meta">
                Заявка {clientIndex + 1} из {clients.length}
              </p>
              <p className="admin-dashboard__problem">{currentClient.problem_description}</p>

              {(Object.keys(TAG_CATEGORIES) as TagCategoryKey[]).map((category) => {
                const tags = TAG_CATEGORIES[category];
                return (
                  <fieldset key={category} className="form-field tags-fieldset">
                    <legend>
                      {TAG_CATEGORY_LABELS[category]} (можно выбрать несколько)
                    </legend>
                    <div className="tags-container">
                      {tags.map((tagObj) => (
                        <label key={tagObj.id} className="tag-label">
                          <input
                            type="checkbox"
                            checked={selectedClientTags.includes(tagObj.title)}
                            onChange={() => handleClientTagToggle(tagObj.title)}
                            disabled={saving}
                          />
                          <span className="tag-text">{tagObj.title}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                );
              })}

              {extraTagsFromRequests.length > 0 && (
                <fieldset className="form-field tags-fieldset">
                  <legend>Другие теги из заявок (можно выбрать несколько)</legend>
                  <div className="tags-container">
                    {extraTagsFromRequests.map((tag) => (
                      <label key={tag} className="tag-label">
                        <input
                          type="checkbox"
                          checked={selectedClientTags.includes(tag)}
                          onChange={() => handleClientTagToggle(tag)}
                          disabled={saving}
                        />
                        <span className="tag-text">{tag}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              <div className="admin-dashboard__actions">
                <button
                  type="button"
                  className="admin-dashboard__action"
                  onClick={handleApproveClient}
                  disabled={saving}
                >
                  {saving ? 'Сохраняем...' : 'Одобрить заявку'}
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {!loading && data && view === 'therapists' && (
        <section className="admin-dashboard__details" aria-labelledby="admin-therapist-details-heading">
          <h2 id="admin-therapist-details-heading" className="admin-dashboard__card-title">
            Терапевты на модерации
          </h2>
          <button
            type="button"
            className="admin-dashboard__back"
            onClick={() => setView('main')}
            disabled={saving}
          >
            Назад
          </button>

          {!currentTherapist && <p className="admin-dashboard__status">Нет терапевтов для модерации</p>}

          {currentTherapist && (
            <>
              <p className="admin-dashboard__meta">
                Терапевт {therapistIndex + 1} из {therapists.length}
              </p>
              <p className="admin-dashboard__problem">
                {currentTherapist.last_name} {currentTherapist.first_name}
              </p>
              <div className="admin-dashboard__actions">
                <button
                  type="button"
                  className="admin-dashboard__action admin-dashboard__action--secondary"
                  onClick={handlePostponeTherapist}
                  disabled={saving || therapists.length <= 1}
                >
                  Отложить
                </button>
                <button
                  type="button"
                  className="admin-dashboard__action"
                  onClick={handleApproveTherapist}
                  disabled={saving}
                >
                  {saving ? 'Сохраняем...' : 'Одобрить'}
                </button>
                <button
                  type="button"
                  className="admin-dashboard__action admin-dashboard__action--secondary"
                  onClick={() => setShowConfirm(true)}
                >
                  Отклонить
                </button>
              {showConfirm && (
              <div className="confirm-panel">
                <p>Вы уверены?</p>
                <button onClick={handleDelete}>
                  Да
                </button>
                <button onClick={() => setShowConfirm(false)}>
                  Отмена
                </button>
              </div>
            )}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}

export default AdminDashboardPage;
