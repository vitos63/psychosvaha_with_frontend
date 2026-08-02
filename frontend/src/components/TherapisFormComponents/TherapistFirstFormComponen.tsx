import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Form.css'
import { TherapistFirstFormErrors } from 'interfaces/Errors';
import { createTherapist } from '../../api/therapistApi';
import { notifyTelegramWebAppFormSubmitted } from '../../utils/telegramWebApp';

function TherapistFirstFormComponent({therapist_id, therapist_username}) {
    const navigate = useNavigate();
    const [tgConsent, setTgConsent] = useState(false)
    const [formData, setFormData] = useState({
        tg_id: 0,
        first_name: '',
        last_name: '',
        username: null,
        consent: false,
    })

    const [errors, setErrors] = useState<TherapistFirstFormErrors>({})

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: TherapistFirstFormErrors = {}
        if (!formData.first_name.trim()) {
            newErrors.first_name = "Введите ваше имя"
        }

        if (!formData.last_name){
            newErrors.last_name = "Введите вашу фамилию"
        }

        if (!formData.consent) {
            newErrors.consent = "Дайте согласие на обработку персональных данных"
        }
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            const firstErrorField = Object.keys(formErrors)[0];
            const errorElement: HTMLElement = document.querySelector(`[name="${firstErrorField}"]`) || 
                                document.querySelector(`[data-error="${firstErrorField}"]`);
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                errorElement.focus();
            }
            return;
        }
        formData.tg_id = therapist_id;
        if (tgConsent) {
            formData.username = therapist_username;
        }
        formData.consent = true;
        try {
                await createTherapist(formData);
                await notifyTelegramWebAppFormSubmitted('therapist_first', therapist_id);
                navigate('/form-success', {
                    state: {
                        title: 'Анкета терапевта отправлена',
                        message:
                            'Спасибо! Мы получили вашу анкету. После проверки данные появятся в каталоге, если всё в порядке. Вы можете закрыть это окно',
                    },
                });
            } catch {
                window.alert('Не удалось отправить анкету. Проверьте подключение к интернету и попробуйте снова.');
            }
    };

    return (
        <form onSubmit={handleSubmit} className="client-form">
            <div className="form-field">
                <input 
                    name="first_name"
                    placeholder="Введите ваше имя *" 
                    type="text" 
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={errors.first_name ? 'error' : ''}
                />
                {errors.first_name && <span className="error-message">{errors.first_name}</span>}
            </div>

            <div className="form-field">
                <input 
                    name="last_name"
                    placeholder="Введите вашу фамилию *" 
                    type="text" 
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={errors.last_name ? 'error' : ''}
                />
                {errors.last_name && <span className="error-message">{errors.last_name}</span>}
            </div>

            <div className="form-field">
                <label>
                    <input 
                        type="checkbox" 
                        name="consent"
                        checked={formData.consent}
                        onChange={handleInputChange}
                    />
                    <Link to="/consent_of_personal_data">
                    Дайте согласие на обработку персональных данных
                    </Link>
                </label>
                </div>
                <div className="form-field">
                <label>
                    <input 
                        type="checkbox" 
                        name="tg"
                        checked={tgConsent}
                        onChange={() => {setTgConsent(!tgConsent)}}
                    />
                    Показывать мой Telegram клиентам
                </label>
                {errors.consent && <span className="error-message" style={{display: 'block'}}>{errors.consent}</span>}
            </div>

            <div className="form-actions">
                <button type="submit" className="submit-btn">Отправить заявку</button>
            </div>
        </form>
    );
}

export default TherapistFirstFormComponent;
