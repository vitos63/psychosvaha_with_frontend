import { useState } from 'react';
import '../Form.css'
import { TherapistFirstFormErrors } from '@/interfaces/Errors';

function TherapistFirstFormComponent() {
    const [formData, setFormData] = useState({
        firstName: '',
        secondName: '',
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
        if (!formData.firstName.trim()) {
            newErrors.firstName = "Введите ваше имя"
        }

        if (!formData.secondName){
            newErrors.secondName = "Введите вашу фамилию"
        }

        if (!formData.consent) {
            newErrors.consent = "Дайте согласие на обработку персональных данных"
        }
        
        return newErrors;
    };

    const handleSubmit = (e) => {
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

        console.log('Данные для отправки:', formData);
    };

    return (
        <form onSubmit={handleSubmit} className="client-form">
            <div className="form-field">
                <input 
                    name="firstName"
                    placeholder="Введите ваше имя *" 
                    type="text" 
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>

            <div className="form-field">
                <input 
                    name="secondName"
                    placeholder="Введите вашу фамилию *" 
                    type="text" 
                    value={formData.secondName}
                    onChange={handleInputChange}
                    className={errors.secondName ? 'error' : ''}
                />
                {errors.secondName && <span className="error-message">{errors.secondName}</span>}
            </div>

            <div className="form-field">
                <label>
                    <input 
                        type="checkbox" 
                        name="consent"
                        checked={formData.consent}
                        onChange={handleInputChange}
                    />
                    Дайте согласие на обработку персональных данных
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