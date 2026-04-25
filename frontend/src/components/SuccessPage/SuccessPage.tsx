import { useLocation } from 'react-router-dom';
import './SuccessPage.css';

export type SuccessPageState = {
  title?: string;
  message?: string;
};

const DEFAULT_TITLE = 'Анкета отправлена';
const DEFAULT_MESSAGE =
  'Спасибо! Мы получили ваши данные и свяжемся с вами, когда появится подходящая информация.';

function SuccessPage() {
  const location = useLocation();
  const state = (location.state as SuccessPageState | null) ?? {};

  const title = state.title?.trim() || DEFAULT_TITLE;
  const message = state.message?.trim() || DEFAULT_MESSAGE;

  return (
    <div className="success-page" role="status" aria-live="polite">
      <div className="success-page__icon" aria-hidden>
        ✓
      </div>
      <h1 className="success-page__title">{title}</h1>
      <p className="success-page__text">{message}</p>
    </div>
  );
}

export default SuccessPage;
