import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Form.css'
import { TherapistSecondFormErrors } from 'interfaces/Errors';
import { updateTherapist } from '../../api/therapistApi';
import { checkCity } from '../../api/checkCity';
import { TAG_CATEGORIES, TAG_CATEGORY_LABELS, type TagCategoryKey } from '../../constants/tags';

function TherapistSecondFormComponent({ client_id }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        city: null,
        phone: null,
        about: null,
        website: null,
        sex: '',
        age: '',
        email: null,
        experience: '',
        min_client_age: '',
        max_client_age: '',
        contacts_for_client: '',
        online: false,
        isPsychiatrist: false,
        isGerontologist: false,
        isFamilyTherapist: false,
        doesGroupTherapy: false,
        isSupervisor: false,
        consent: false,
        availableToCall: false
    })

    const [currency_amount, setCurrencies] = useState([
        { code: 'rub', name: 'Рубли', selected: false, amount: '' },
        { code: 'usd', name: 'Доллары', selected: false, amount: '' },
        { code: 'eur', name: 'Евро', selected: false, amount: '' }
    ]);

    type FormElement = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [errors, setErrors] = useState<TherapistSecondFormErrors>({})


    const toggleCurrency = (code) => {
        setCurrencies(currency_amount.map(currency => {
            if (currency.code === code) {
                const updated = { ...currency, selected: !currency.selected };
                if (!updated.selected) {
                    updated.amount = '';
                }
                return updated;
            }
            return currency;
        }));
        if (errors.currency_amount) {
            setErrors(prev => ({ ...prev, currency_amount: '' }));
        }
    };

    const updateAmount = (code, value) => {
        const numericValue = value.replace(/\D/g, '');
        setCurrencies(currency_amount.map(currency =>
            currency.code === code
                ? { ...currency, amount: numericValue }
                : currency
        ));
    };


    const handleInputChange = (e: FormElement) => {
        const { name, value, type } = e.target;
        const target = e.target;
        const checked = (target as HTMLInputElement).checked;
        if (name === 'isPsychiatrist') {
            if (!checked) {
                setFormData(prev => ({
                    ...prev,
                    [name]: checked,
                    isGerontologist: false
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [name]: checked
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (name === 'online' && errors.city) {
            setErrors(prev => ({ ...prev, city: '' }));
        }
    };

    const handleTagToggle = (tagId: number) => {
        setSelectedTags(prev => {
            if (prev.includes(tagId)) {
                return prev.filter(id => id !== tagId);
            } else {
                return [...prev, tagId];
            }
        });
    };

    const validateForm = async () => {
        const newErrors: TherapistSecondFormErrors = {}

        if (!formData.first_name.trim()) {
            newErrors.first_name = "Введите ваше имя"
        }

        if (!formData.last_name.trim()) {
            newErrors.last_name = "Введите вашу фамилию"
        }

        const cityValue = (formData.city ?? '').trim();
        const phoneValue = (formData.phone ?? '').trim();
        const emailValue = (formData.email ?? '').trim();

        if (!cityValue && !formData.online) {
            newErrors.city = "Укажите город или отметьте, что принимаете онлайн"
        }

        else if (cityValue) {
                const isValidCity = await checkCity(cityValue)
                if (!isValidCity){
                    newErrors.city = "Мы не смогли найти такой город, пожалуйста, проверьте правильность его написания"
                }
                
                else if (typeof isValidCity == 'string'){
                    newErrors.city = `Мы не смогли найти такой город, возможно вы имели в виду ${isValidCity}?`
                }
            }

        if (phoneValue && !/^\+?[0-9\s\-\(\)]+$/.test(phoneValue)) {
            newErrors.phone = "Введите корректный номер телефона"
        }

        if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
            newErrors.email = "Введите корректный email адрес"
        }

        if (!formData.sex){
            newErrors.sex = "Выберите ваш пол"
        }

        if (!formData.age) {
            newErrors.age = "Введите ваш возраст"
        } else {
            const ageNum = parseInt(formData.age, 10);
            if (ageNum < 18 || ageNum > 100){ 
            newErrors.age = "Возраст должен быть от 18 до 100 лет"}
        } 

        if (!formData.experience) {
            newErrors.experience = "Введите ваш стаж работы"
        } else {
            const experienceNum = parseInt(formData.experience, 10);
        if (experienceNum < 0 || experienceNum > 80) {
            newErrors.experience = "Стаж должен быть от 0 до 80 лет"
        }
    }
        
        const experienceNum = parseInt(formData.experience, 10);
        const ageNum = parseInt(formData.age, 10);
        if (ageNum - experienceNum <= 20){
            newErrors.experience = "К сожалению я не верю, что вы могли начать работать в таком раннем возрасте"
        }

        if (!formData.min_client_age) {
            newErrors.min_client_age = "Введите минимальный возраст клиента"
        } else 
            {
            const min_client_ageNum = parseInt(formData.min_client_age, 10);
            if (min_client_ageNum < 1 || min_client_ageNum > 100) {
            newErrors.min_client_age = "Минимальный возраст должен быть от 1 до 100 лет"
        }
    }

        if (!formData.max_client_age) {
            newErrors.max_client_age = "Введите максимальный возраст клиента"
        } else  {
            const max_client_ageNum = parseInt(formData.max_client_age, 10);
            if(max_client_ageNum < 1 || max_client_ageNum > 100){
            newErrors.max_client_age = "Максимальный возраст должен быть от 1 до 100 лет"
        }
    }

        if (formData.min_client_age && formData.max_client_age &&
            parseInt(formData.min_client_age) > parseInt(formData.max_client_age)) {
            newErrors.min_client_age = "Минимальный возраст не может быть больше максимального";
            newErrors.max_client_age = "Максимальный возраст не может быть меньше минимального";
        }

        if (!formData.consent) {
            newErrors.consent = "Дайте согласие на обработку персональных данных"
        }

        if (!formData.contacts_for_client) {
            newErrors.contacts_for_client = "Напишите контакты для клиента, где и как с вами можно связаться?"
        }
        

    const hasSelectedCurrency = currency_amount.some(c => c.selected);
    if (!hasSelectedCurrency) {
        newErrors.currency_amount = 'Выберите хотя бы одну валюту';
    }

    else {
        currency_amount.forEach(currency => {
            if (currency.selected && !currency.amount.trim()) {
                newErrors[`currency_${currency.code}`] = `Введите сумму в ${currency.name}`;
            }
        });
    }

    return newErrors;
};

const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = await validateForm();

    if (formData.isPsychiatrist){
        setSelectedTags(prev => [...prev, 4])
    }

    if (formData.isSupervisor){
        setSelectedTags(prev => [...prev, 42])
    }

    if (formData.isGerontologist){
        setSelectedTags(prev => [...prev, 35])
    }

    if (formData.isFamilyTherapist){
        setSelectedTags(prev => [...prev, 25])
    }

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

    const submissionData = {
        ...formData,
        sex: formData.sex,
        currency_amount: currency_amount.reduce((acc, curr) => {
            if (curr.selected) {
                acc[curr.code.toUpperCase()] = parseInt(curr.amount) || 0;
                    }
                    return acc;
                }, {} as Record<string, number>),
        tag_ids: selectedTags
    };
    console.log('Данные для отправки:', submissionData);
    try {
        await updateTherapist(submissionData, client_id);
        navigate('/form-success', {
            state: {
                title: 'Анкета терапевта отправлена',
                message:
                    'Спасибо! Мы получили вашу анкету. После проверки данные появятся в каталоге, если всё в порядке.',
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

        <fieldset className={`form-field ${errors.sex ? 'error-fieldset' : ''}`}>
            <legend>Выберите ваш пол *</legend>
            <label>
                <input
                    type="radio"
                    name="sex"
                    value="Мужчина"
                    checked={formData.sex === 'Мужчина'}
                    onChange={handleInputChange}
                />
                Мужской
            </label>
            <br />
            <label>
                <input
                    type="radio"
                    name="sex"
                    value="Женщина"
                    checked={formData.sex === 'Женщина'}
                    onChange={handleInputChange}
                />
                Женский
            </label>
            <br />
            <label>
                <input
                    type="radio"
                    name="sex"
                    value="Не указывать"
                    checked={formData.sex === 'Не указывать'}
                    onChange={handleInputChange}
                />
                Не указывать
            </label>
        </fieldset>

        <div className="form-field">
            <input
                name="age"
                placeholder="Введите ваш возраст (18-100) *"
                type="number"
                min={18}
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
                placeholder="Введите ваш город"
                type="text"
                value={formData.city}
                onChange={handleInputChange}
                className={errors.city ? 'error' : ''}
            />
            {errors.city && <span className="error-message">{errors.city}</span>}
            <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                Если не укажете город, отметьте, что принимаете онлайн
            </small>
        </div>

        <div className="form-field">
            <label>
                <input
                    type="checkbox"
                    name="online"
                    checked={formData.online}
                    onChange={handleInputChange}
                />
                Принимаете ли клиентов онлайн?
            </label>
        </div>

        <fieldset className={`form-field ${errors.currency_amount ? 'error-fieldset' : ''}`} data-error="currency_amount">
            <legend>В каких валютах готовы платить? (можно выбрать несколько) *</legend>
            {errors.currency_amount && <span className="error-message">{errors.currency_amount}</span>}

            {currency_amount.map(currency => (
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

        <div className="form-field">
            <input
                name="phone"
                placeholder="Введите ваш телефон (необязательно)"
                type="text"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>

        <div className="form-field">
            <input
                name="email"
                placeholder="Введите ваш email (необязательно)"
                type="text"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-field">
            <textarea
                name="about"
                placeholder="Расскажите о себе (необязательно)"
                rows={4}
                value={formData.about}
                onChange={handleInputChange}
            />
        </div>

        <div className="form-field">
            <input
                name="website"
                placeholder="Введите адрес вашего сайта (необязательно)"
                type="text"
                value={formData.website}
                onChange={handleInputChange}
                className={errors.website ? 'error' : ''}
            />
            {errors.website && <span className="error-message">{errors.website}</span>}
        </div>

        <div className="form-field">
            <input
                name="experience"
                placeholder="Введите ваш стаж работы в годах (0-80) *"
                type="number"
                min={0}
                max={80}
                value={formData.experience}
                onChange={handleInputChange}
                className={errors.experience ? 'error' : ''}
            />
            {errors.experience && <span className="error-message">{errors.experience}</span>}
        </div>

        <div className="form-row">
            <div className="form-field">
                <input
                    name="min_client_age"
                    placeholder="Минимальный возраст клиента (1-100) *"
                    type="number"
                    min={1}
                    max={100}
                    value={formData.min_client_age}
                    onChange={handleInputChange}
                    className={errors.min_client_age ? 'error' : ''}
                />
                {errors.min_client_age && <span className="error-message">{errors.min_client_age}</span>}
            </div>

            <div className="form-field">
                <input
                    name="max_client_age"
                    placeholder="Максимальный возраст клиента (1-100) *"
                    type="number"
                    min={1}
                    max={100}
                    value={formData.max_client_age}
                    onChange={handleInputChange}
                    className={errors.max_client_age ? 'error' : ''}
                />
                {errors.max_client_age && <span className="error-message">{errors.max_client_age}</span>}
            </div>
        </div>

        <div className="form-field">
            <label>
                <input
                    type="checkbox"
                    name="isPsychiatrist"
                    checked={formData.isPsychiatrist}
                    onChange={handleInputChange}
                />
                Вы психиатр?
            </label>
        </div>

        {formData.isPsychiatrist && (
            <div className="form-field">
                <label>
                    <input
                        type="checkbox"
                        name="isGerontologist"
                        checked={formData.isGerontologist}
                        onChange={handleInputChange}
                    />
                    Вы геронтолог?
                </label>
            </div>
        )}

        <div className="form-field">
            <label>
                <input
                    type="checkbox"
                    name="isFamilyTherapist"
                    checked={formData.isFamilyTherapist}
                    onChange={handleInputChange}
                />
                Вы семейный терапевт?
            </label>
        </div>

        <div className="form-field">
            <label>
                <input
                    type="checkbox"
                    name="doesGroupTherapy"
                    checked={formData.doesGroupTherapy}
                    onChange={handleInputChange}
                />
                Вы проводите групповую терапию?
            </label>
        </div>

        <div className="form-field">
            <label>
                <input
                    type="checkbox"
                    name="isSupervisor"
                    checked={formData.isSupervisor}
                    onChange={handleInputChange}
                />
                Вы супервизор?
            </label>
        </div>

        {(Object.keys(TAG_CATEGORIES) as TagCategoryKey[]).map((category) => {
          const tags = TAG_CATEGORIES[category];
          return (
            <fieldset key={category} className="form-field tags-fieldset">
                <legend>{TAG_CATEGORY_LABELS[category]} (можно выбрать несколько)</legend>
                <div className="tags-container">
                    {tags.map(tagObj => (
                        <label key={tagObj.id} className="tag-label">
                            <input
                                type="checkbox"
                                checked={selectedTags.includes(tagObj.id)}
                                onChange={() => handleTagToggle(tagObj.id)}
                            />
                            <span className="tag-text">{tagObj.title}</span>
                        </label>
                    ))}
                </div>
            </fieldset>
          );
        })}

        <div className="form-field">
            <label>
                <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleInputChange}
                />
                Даю согласие на обработку персональных данных *
            </label>
            {errors.consent && <span className="error-message" style={{ display: 'block' }}>{errors.consent}</span>}
        </div>

        <div className="form-field">
            <input
                name="contacts_for_client"
                placeholder="Напишите контакты для клиента, как и где с вам можно связаться"
                type="text"
                value={formData.contacts_for_client}
                onChange={handleInputChange}
                className={errors.contacts_for_client ? 'error' : ''}
            />
            {errors.contacts_for_client && <span className="error-message">{errors.contacts_for_client}</span>}
        </div>


        <div className="form-field">
            <label>
                <input
                    type="checkbox"
                    name="availableToCall"
                    checked={formData.availableToCall}
                    onChange={handleInputChange}
                />
                Готов принимать клиентов
            </label>
        </div>

        <div className="form-actions">
            <button type="submit" className="submit-btn">Отправить заявку</button>
        </div>
    </form>
);
}

export default TherapistSecondFormComponent;