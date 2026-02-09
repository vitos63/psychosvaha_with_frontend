import { useState } from 'react';
import '../Form.css'
import { createClientRequest } from '../../api/api';
import { ClientRequestInterface } from '../../interfaces/ClientRequestInterface';
import { ClientFormErrors } from '@/interfaces/Errors';

function ClientFormComponent({ client_id }: { client_id: number }) {
    const [formData, setFormData] = useState({
        problem_description: '',
        need_psychiatrist: null,
        sex: '',
        age: '',
        city: '',
        is_online: false,
        psychotherapist_sex: '',
        consent: false
    })

    const [currencies, setCurrencies] = useState([
        { code: 'rub', name: 'Рубли', selected: false, amount: '' },
        { code: 'usd', name: 'Доллары', selected: false, amount: '' },
        { code: 'eur', name: 'Евро', selected: false, amount: '' }
    ]);

    const [errors, setErrors] = useState<ClientFormErrors>({})
    
    type FormElement = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    type FormValue = string | boolean

    const handleInputChange = (e: FormElement) => {
        const target = e.target;
        const name = target.name as keyof FormData;
        const { value, type } = target;
        
        let fieldValue: FormValue;
        
        if (type === 'checkbox') {
            fieldValue = (target as HTMLInputElement).checked;
        } else if (type === 'number') {
            fieldValue = (target as HTMLInputElement).valueAsNumber.toString();
        } else {
            fieldValue = value;
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: fieldValue
        }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (name === 'is_online' as keyof FormData && errors.city) {
            setErrors(prev => ({ ...prev, city: '' }));
        }
};

    const toggleCurrency = (code: string) => {
        setCurrencies(currencies.map(currency => {
            if (currency.code === code) {
                const updated = { ...currency, selected: !currency.selected };
                if (!updated.selected) {
                    updated.amount = '';
                }
                return updated;
            }
            return currency;
        }));
        if (errors.currencies) {
            setErrors(prev => ({ ...prev, currencies: '' }));
        }
    };

    const updateAmount = (code, value) => {
        const numericValue = value.replace(/\D/g, '');
        setCurrencies(currencies.map(currency =>
            currency.code === code
                ? { ...currency, amount: numericValue }
                : currency
        ));
    };

    const validateForm = () => {
        const newErrors: ClientFormErrors = {}
        if (!formData.problem_description.trim()) {
            newErrors.problem_description = "Опишите проблему клиента"
        }

        else if (formData.problem_description.trim().length < 10) {
            newErrors.problem_description = "Описание проблемы должно содержать не менее 10 символов"
        }

        if (!formData.need_psychiatrist){
            newErrors.need_psychiatrist = "Выберите, нужен ли психиатр"
        }

        if (!formData.sex) {
            newErrors.sex = "Выберите пол клиента"
        }

        if (!formData.age) {
            newErrors.age = "Введите возраст клиента"
        }

        else {
            const ageNum = parseInt(formData.age, 10);
            if (ageNum < 1 || ageNum > 100) {
                newErrors.age = "Возраст должен быть от 1 до 100 лет";
            }
        }

        if (!formData.city.trim() && !formData.is_online) {
            newErrors.city = "Введите город или дайте согласие на онлайн терапию"
        }

        if (!formData.psychotherapist_sex) {
            newErrors.psychotherapist_sex = 'Выберите предпочитаемый пол терапевта';
        }

        if (!formData.consent) {
            newErrors.consent = "Необходимо дать согласие на обработку персональных данных"
        }

    const hasSelectedCurrency = currencies.some(c => c.selected);
        if (!hasSelectedCurrency) {
            newErrors.currencies = 'Выберите хотя бы одну валюту';
        }
        
        else {
            currencies.forEach(currency => {
                if (currency.selected && !currency.amount.trim()) {
                    newErrors[`currency_${currency.code}`] = `Введите сумму в ${currency.name}`;
                }
            });
        }

        return newErrors;
    };


     const handleSubmit = (e) => {
        e.preventDefault();
        const ClientFormErrors = validateForm();
        
        if (Object.keys(ClientFormErrors).length > 0) {
            setErrors(ClientFormErrors);
            const firstErrorField = Object.keys(ClientFormErrors)[0];
            const errorElement: HTMLElement = document.querySelector(`[name="${firstErrorField}"]`) || 
                                document.querySelector(`[data-error="${firstErrorField}"]`);
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                errorElement.focus();
            }
            return;
        }

        const submissionData = {
            ...formData,
            client_id: client_id,
             currency_amount: currencies.reduce((acc, curr) => {
            if (curr.selected) {
                acc[curr.code.toUpperCase()] = parseInt(curr.amount) || 0;
                    }
                    return acc;
                }, {} as Record<string, number>)
        };

        createClientRequest(submissionData)
    };

     return (
        <form onSubmit={handleSubmit} className="client-form">
            <div className="form-field">
                <textarea 
                    name="problem_description"
                    placeholder="Опишите проблему клиента *"
                    value={formData.problem_description}
                    onChange={handleInputChange}
                    className={errors.problem_description ? 'error' : ''}
                />
                {errors.problem_description && <span className="error-message">{errors.problem_description}</span>}
            </div>

            <fieldset className={`form-field ${errors.need_psychiatrist ? 'error-fieldset' : ''}`}>
                <legend>Клиенту нужен психиатр? *</legend>
                <label>
                    <input 
                        type="radio" 
                        name="need_psychiatrist" 
                        value="yes" 
                        checked={formData.need_psychiatrist === 'yes'}
                        onChange={handleInputChange}
                    />
                    Да
                </label>
                <br />
                <label>
                    <input 
                        type="radio" 
                        name="need_psychiatrist" 
                        value="no" 
                        checked={formData.need_psychiatrist === 'no'}
                        onChange={handleInputChange}
                    />
                    Нет
                </label>
                <br />
                <label>
                    <input 
                        type="radio" 
                        name="need_psychiatrist" 
                        value="dont_know" 
                        checked={formData.need_psychiatrist === 'dont_know'}
                        onChange={handleInputChange}
                    />
                    Не знаю
                </label>
                {errors.need_psychiatrist && <span className="error-message">{errors.need_psychiatrist}</span>}
            </fieldset>

            <fieldset className={`form-field ${errors.sex ? 'error-fieldset' : ''}`}>
                <legend>Выберите пол клиента *</legend>
                <label>
                    <input 
                        type="radio" 
                        name="sex" 
                        value="male" 
                        checked={formData.sex === 'male'}
                        onChange={handleInputChange}
                    />
                    Мужской
                </label>
                <br />
                <label>
                    <input 
                        type="radio" 
                        name="sex" 
                        value="female" 
                        checked={formData.sex === 'female'}
                        onChange={handleInputChange}
                    />
                    Женский
                </label>
                <br />
                <label>
                    <input 
                        type="radio" 
                        name="sex" 
                        value="not_specified" 
                        checked={formData.sex === 'not_specified'}
                        onChange={handleInputChange}
                    />
                    Не указывать
                </label>
                {errors.sex && <span className="error-message">{errors.sex}</span>}
            </fieldset>

            <div className="form-field">
                <input 
                    name="age"
                    placeholder="Введите возраст клиента (1-100) *" 
                    type="number" 
                    min={1} 
                    max={100}
                    value={formData.age}
                    onChange={handleInputChange}
                    className={errors.age ? 'error' : ''}
                />
                {errors.age && <span className="error-message">{errors.age}</span>}
            </div>

            <div className="form-field">
                <input 
                    name="city"
                    placeholder="Введите город, в котором ищете терапевта" 
                    type="text" 
                    value={formData.city}
                    onChange={handleInputChange}
                    className={errors.city ? 'error' : ''}
                />
                {errors.city && <span className="error-message">{errors.city}</span>}
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                Если не укажете город, отметьте, что готовы к онлайн терапии
            </small>
            </div>

            <div className="form-field">
                <label>
                    <input 
                        type="checkbox" 
                        name="is_online"
                        checked={formData.is_online}
                        onChange={handleInputChange}
                    />
                    Готов ли клиент к онлайн терапии?
                </label>
            </div>

            <fieldset className={`form-field ${errors.currencies ? 'error-fieldset' : ''}`} data-error="currencies">
                <legend>В каких валютах готовы платить? (можно выбрать несколько) *</legend>
                {errors.currencies && <span className="error-message">{errors.currencies}</span>}
                
                {currencies.map(currency => (
                    <div key={currency.code} className="currency-option">
                        <label>
                            <input
                                type="checkbox"
                                checked={currency.selected}
                                onChange={() => toggleCurrency(currency.code)}
                            />
                            {currency.name}
                        </label>
                        {currency.selected && (
                            <div className="currency-amount">
                                <input
                                    type="text"
                                    placeholder={`Сумма в ${currency.name.toLowerCase()} *`}
                                    value={currency.amount}
                                    onChange={(e) => updateAmount(currency.code, e.target.value)}
                                    onInput={(e) => (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/\D/g, '')}
                                    className={errors[`currency_${currency.code}`] ? 'error' : ''}
                                />
                                {errors[`currency_${currency.code}`] && (
                                    <span className="error-message">{errors[`currency_${currency.code}`]}</span>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </fieldset>

            <fieldset className={`form-field ${errors.psychotherapist_sex ? 'error-fieldset' : ''}`}>
                <legend>Выберите предпочитаемый пол психотерапевта *</legend>
                <label>
                    <input 
                        type="radio" 
                        name="psychotherapist_sex" 
                        value="male" 
                        checked={formData.psychotherapist_sex === 'male'}
                        onChange={handleInputChange}
                    />
                    Мужской
                </label>
                <br />
                <label>
                    <input 
                        type="radio" 
                        name="psychotherapist_sex" 
                        value="female" 
                        checked={formData.psychotherapist_sex === 'female'}
                        onChange={handleInputChange}
                    />
                    Женский
                </label>
                <br />
                <label>
                    <input 
                        type="radio" 
                        name="psychotherapist_sex" 
                        value="no_preference" 
                        checked={formData.psychotherapist_sex === 'no_preference'}
                        onChange={handleInputChange}
                    />
                    Не имеет значения
                </label>
                {errors.psychotherapist_sex && <span className="error-message">{errors.psychotherapist_sex}</span>}
            </fieldset>

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
                {errors.consent && <span className="error-message">{errors.consent}</span>}
            </div>

            <div className="form-actions">
                <button type="submit" className="submit-btn">Отправить заявку</button>
            </div>
        </form>
    );
}

export default ClientFormComponent;