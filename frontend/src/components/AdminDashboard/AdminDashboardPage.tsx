import { useCallback, useEffect, useState } from 'react';
import { fetchAdminMainInfo } from '../../api/api';
import { AdminMainInfoResponse } from '../../interfaces/AdminMainInfoInterface';
import '../Form.css';
import './AdminDashboardPage.css';

type AdminDashboardPageProps = {
  tgId: number | undefined;
};

function AdminDashboardPage({ tgId }: AdminDashboardPageProps) {
  const [data, setData] = useState<AdminMainInfoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const therapists = data?.not_approved_therapists;
  const clients = data?.not_approved_client_requests;
  const therapistsCount = Array.isArray(therapists) ? therapists.length : 0;
  const clientsCount = Array.isArray(clients) ? clients.length : 0;

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

      {!loading && !error && data && (
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
            <button type="button" className="admin-dashboard__action">
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
            <button type="button" className="admin-dashboard__action">
              Посмотреть
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminDashboardPage;
