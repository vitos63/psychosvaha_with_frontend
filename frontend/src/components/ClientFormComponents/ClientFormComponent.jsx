import { useState } from 'react';
import '../Form.css'

function ClientFormComponent() {
    const [formData, setFormData] = useState({
        problem: '',
        psychiatrist: '',
        gender: '',
        age: '',
        city: '',
        onlineTherapy: false,
        therapistGender: '',
        consent: false
    })

    const [currencies, setCurrencies] = useState([
        { code: 'rub', name: 'Рубли', selected: false, amount: '' },
        { code: 'usd', name: 'Доллары', selected: false, amount: '' },
        { code: 'eur', name: 'Евро', selected: false, amount: '' }
    ]);

    const [errors, setErrors] = useState({})

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (name === 'onlineTherapy' && errors.city) {
            setErrors(prev => ({ ...prev, city: '' }));
        }
    };

    const toggleCurrency = (code) => {
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
        const newErrors = {}
        if (!formData.problem.trim()) {
            newErrors.problem = "Опишите проблему клиента"
        }

        else if (formData.problem.trim().length < 10) {
            newErrors.problem = "Описание проблемы должно содержать не менее 10 символов"
        }

        if (!formData.psychiatrist){
            newErrors.psychiatrist = "Выберите, нужен ли психиатр"
        }

        if (!formData.gender) {
            newErrors.gender = "Выберите пол клиента"
        }

        if (!formData.age) {
            newErrors.age = "Введите возраст клиента"
        }

        else if (formData.age < 1 || formData.age > 100) {
            newErrors.age = "Возраст должен быть от 1 до 100 лет"
        }

        if (!formData.city.trim() && !formData.onlineTherapy) {
            newErrors.city = "Введите город или дайте согласие на онлайн терапию"
        }

        if (!formData.therapistGender) {
            newErrors.therapistGender = 'Выберите предпочитаемый пол терапевта';
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
        const formErrors = validateForm();
        
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            const firstErrorField = Object.keys(formErrors)[0];
            const errorElement = document.querySelector(`[name="${firstErrorField}"]`) || 
                                document.querySelector(`[data-error="${firstErrorField}"]`);
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                errorElement.focus();
            }
            return;
        }

        const submissionData = {
            ...formData,
            currencies: currencies.filter(c => c.selected).map(c => ({
                code: c.code,
                name: c.name,
                amount: c.amount
            }))
        };

        console.log('Данные для отправки:', submissionData);
    };

     return (
        <form onSubmit={handleSubmit} className="client-form">
            <div className="form-field">
                <textarea 
                    name="problem"
                    placeholder="Опишите проблему клиента *"
                    value={formData.problem}
                    onChange={handleInputChange}
                    className={errors.problem ? 'error' : ''}
                />
                {errors.problem && <span className="error-message">{errors.problem}</span>}
            </div>

            <fieldset className={`form-field ${errors.psychiatrist ? 'error-fieldset' : ''}`}>
                <legend>Клиенту нужен психиатр? *</legend>
                <label>
                    <input 
                        type="radio" 
                        name="psychiatrist" 
                        value="yes" 
                        checked={formData.psychiatrist === 'yes'}
                        onChange={handleInputChange}
                    />
                    Да
                </label>
                <br />
                <label>
                    <input 
                        type="radio" 
                        name="psychiatrist" 
                        value="no" 
                        checked={formData.psychiatrist === 'no'}
                        onChange={handleInputChange}
                    />
                    Нет
                </label>
                <br />
                <label>
                    <input 
                        type="radio" 
                        name="psychiatrist" 
                        value="dont_know" 
                        checked={formData.psychiatrist === 'dont_know'}
                        onChange={handleInputChange}
                    />
                    Не знаю
                </label>
                {errors.psychiatrist && <span className="error-message">{errors.psychiatrist}</span>}
            </fieldset>

            <fieldset className={`form-field ${errors.gender ? 'error-fieldset' : ''}`}>
                <legend>Выберите пол клиента *</legend>
                <label>
                    <input 
                        type="radio" 
                        name="gender" 
                        value="male" 
                        checked={formData.gender === 'male'}
                        onChange={handleInputChange}
                    />
                    Мужской
                </label>
                <br />
                <label>
                    <input 
                        type="radio" 
                        name="gender" 
                        value="female" 
                        checked={formData.gender === 'female'}
                        onChange={handleInputChange}
                    />
                    Женский
                </label>
                <br />
                <label>
                    <input 
                        type="radio" 
                        name="gender" 
                        value="not_specified" 
                        checked={formData.gender === 'not_specified'}
                        onChange={handleInputChange}
                    />
                    Не указывать
                </label>
                {errors.gender && <span className="error-message">{errors.gender}</span>}
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
                        name="onlineTherapy"
                        checked={formData.onlineTherapy}
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
                                    onInput={(e) => e.target.value = e.target.value.replace(/\D/g, '')}
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

            <fieldset className={`form-field ${errors.therapistGender ? 'error-fieldset' : ''}`}>
                <legend>Выберите предпочитаемый пол психотерапевта *</legend>
                <label>
                    <input 
                        type="radio" 
                        name="therapistGender" 
                        value="male" 
                        checked={formData.therapistGender === 'male'}
                        onChange={handleInputChange}
                    />
                    Мужской
                </label>
                <br />
                <label>
                    <input 
                        type="radio" 
                        name="therapistGender" 
                        value="female" 
                        checked={formData.therapistGender === 'female'}
                        onChange={handleInputChange}
                    />
                    Женский
                </label>
                <br />
                <label>
                    <input 
                        type="radio" 
                        name="therapistGender" 
                        value="no_preference" 
                        checked={formData.therapistGender === 'no_preference'}
                        onChange={handleInputChange}
                    />
                    Не имеет значения
                </label>
                {errors.therapistGender && <span className="error-message">{errors.therapistGender}</span>}
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