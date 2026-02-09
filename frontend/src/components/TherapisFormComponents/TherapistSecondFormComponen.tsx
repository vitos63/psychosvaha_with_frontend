import { useState } from 'react';
import '../Form.css'
import { TherapistSecondFormErrors } from '@/interfaces/Errors';

function TherapistSecondFormComponent() {
    const [formData, setFormData] = useState({
        firstName: '',
        secondName: '',
        city: '',
        phone: '',
        about: '',
        website: '',
        sex: '',
        age: '',
        experience: '',
        minClientAge: '',
        maxClientAge: '',
        contactsForClient: '',
        acceptsOnline: false,
        isPsychiatrist: false,
        isGerontologist: false,
        isFamilyTherapist: false,
        doesGroupTherapy: false,
        isSupervisor: false,
        consent: false,
        availableToCall: false
    })

    const [currencies, setCurrencies] = useState([
        { code: 'rub', name: 'Рубли', selected: false, amount: '' },
        { code: 'usd', name: 'Доллары', selected: false, amount: '' },
        { code: 'eur', name: 'Евро', selected: false, amount: '' }
    ]);

    const TAG_CATEGORIES = {
        ANXIETY_AND_DEPRESSION: [
            "БАР",
            "депрессия",
            "социофобия",
            "тревога",
            "сверхконтроль",
            "ОКР"
        ],
        CHILDREN_TOPICS: [
            "детский аутизм",
            "логопед/нейропсихолог",
            "энурез/энкопрез"
        ],
        ADDICTIONS: [
            "зависимости",
            "гэмблинг"
        ],
        TRAUMA_AND_GRIEF: [
            "горе",
            "травма"
        ],
        RPP: [
            "анорексия",
            "переедание",
            "дисморфофобия"
        ],
        SOMATIC_PROBLEMS: [
            "психосоматика",
            "сомнология",
            "хроническая боль"
        ],
        EMOTIONAL_DYSREGULATION: [
            'НРЛ',
            "ПРЛ",
            "авторы насилия",
            "селфхарм/суицид",
            "эмоциональная регуляция",
            "импульсивность"
        ],
        NEURODEVELOPMENTAL_DISORDERS: [
            "СДВГ",
            "нейроотличия, РАС"
        ],
        RELATIONSHIP: [
            "отношения",
            "сексология",
            "семейная терапия"
        ],
        COACHING_AND_ADAPTATION: [
            "выгорание",
            "коучинг",
            "трудовая адаптация",
            "эмиграция"
        ],
        THERAPY_METHODS: [
            "КПТ",
            "ДБТ",
            "АСТ",
            "МВТ",
            "РЭПТ",
            "психоанализ",
            "психодинамическая терапия",
            "схема-терапия",
        ]
    }
    
    type FormElement = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    const [selectedTags, setSelectedTags] = useState({});
    const [errors, setErrors] = useState<TherapistSecondFormErrors>({})


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

        if (name === 'acceptsOnline' && errors.city) {
            setErrors(prev => ({ ...prev, city: '' }));
        }
    };

    const handleTagToggle = (category, tag) => {
        setSelectedTags(prev => {
            const categoryTags = prev[category] || [];
            const newCategoryTags = categoryTags.includes(tag)
                ? categoryTags.filter(t => t !== tag)
                : [...categoryTags, tag];

            return {
                ...prev,
                [category]: newCategoryTags
            };
        });
    };

    const validateForm = () => {
        const newErrors: TherapistSecondFormErrors = {}

        if (!formData.firstName.trim()) {
            newErrors.firstName = "Введите ваше имя"
        }

        if (!formData.secondName.trim()) {
            newErrors.secondName = "Введите вашу фамилию"
        }

        if (!formData.city.trim() && !formData.acceptsOnline) {
            newErrors.city = "Укажите город или отметьте, что принимаете онлайн"
        }

        if (formData.phone.trim() && !/^\+?[0-9\s\-\(\)]+$/.test(formData.phone.trim())) {
            newErrors.phone = "Введите корректный номер телефона"
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

        if (!formData.minClientAge) {
            newErrors.minClientAge = "Введите минимальный возраст клиента"
        } else 
            {
            const minClientAgeNum = parseInt(formData.minClientAge, 10);
            if (minClientAgeNum < 1 || minClientAgeNum > 100) {
            newErrors.minClientAge = "Минимальный возраст должен быть от 1 до 100 лет"
        }
    }

        if (!formData.maxClientAge) {
            newErrors.maxClientAge = "Введите максимальный возраст клиента"
        } else  {
            const maxClientAgeNum = parseInt(formData.maxClientAge, 10);
            if(maxClientAgeNum < 1 || maxClientAgeNum > 100){
            newErrors.maxClientAge = "Максимальный возраст должен быть от 1 до 100 лет"
        }
    }

        if (formData.minClientAge && formData.maxClientAge &&
            parseInt(formData.minClientAge) > parseInt(formData.maxClientAge)) {
            newErrors.minClientAge = "Минимальный возраст не может быть больше максимального";
            newErrors.maxClientAge = "Максимальный возраст не может быть меньше минимального";
        }

        if (!formData.consent) {
            newErrors.consent = "Дайте согласие на обработку персональных данных"
        }

        if (!formData.contactsForClient) {
            newErrors.contactsForClient = "Напишите контакты для клиента, где и как с вами можно связаться?"
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
        selectedTags: selectedTags
    };

    console.log('Данные для отправки:', submissionData);
};

const categoryLabels = {
    ANXIETY_AND_DEPRESSION: "	Вы работаете с тревогой и депрессией? Выберите подходящие варианты:",
    CHILDREN_TOPICS: "Работаете ли вы с детьми? Выберите подходящие варианты:",
    ADDICTIONS: "Работаете ли вы с зависимостями? Выберите подходящие варианты:",
    TRAUMA_AND_GRIEF: "Вы работаете с травмами и горем? Выберите подходящие варианты:",
    RPP: "	Вы работаете с РПП? Выберите подходящие варианты:",
    SOMATIC_PROBLEMS: "	Вы работаете с психосоматическими проблемами? Выберите подходящие варианты:",
    EMOTIONAL_DYSREGULATION: "	Вы работаете с проблемами контроля поведения и регуляцией эмоций? Выберите подходящие варианты:",
    NEURODEVELOPMENTAL_DISORDERS: "Вы работаете с нарушениями нейроразвития? Выберите подходящие варианты:",
    RELATIONSHIP: "	Вы работаете с отношениями? Выберите подходящие варианты:",
    COACHING_AND_ADAPTATION: "	Вы занимаетесь коучингом и адаптацией? Выберите подходящие варианты:",
    THERAPY_METHODS: "Выберите методы терапии, с которыми вы работаете"
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

        <fieldset className={`form-field ${errors.sex ? 'error-fieldset' : ''}`}>
            <legend>Выберите ваш пол *</legend>
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
                    name="acceptsOnline"
                    checked={formData.acceptsOnline}
                    onChange={handleInputChange}
                />
                Принимаете ли клиентов онлайн?
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
                    name="minClientAge"
                    placeholder="Минимальный возраст клиента (1-100) *"
                    type="number"
                    min={1}
                    max={100}
                    value={formData.minClientAge}
                    onChange={handleInputChange}
                    className={errors.minClientAge ? 'error' : ''}
                />
                {errors.minClientAge && <span className="error-message">{errors.minClientAge}</span>}
            </div>

            <div className="form-field">
                <input
                    name="maxClientAge"
                    placeholder="Максимальный возраст клиента (1-100) *"
                    type="number"
                    min={1}
                    max={100}
                    value={formData.maxClientAge}
                    onChange={handleInputChange}
                    className={errors.maxClientAge ? 'error' : ''}
                />
                {errors.maxClientAge && <span className="error-message">{errors.maxClientAge}</span>}
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

        {Object.entries(TAG_CATEGORIES).map(([category, tags]) => (
            <fieldset key={category} className="form-field tags-fieldset">
                <legend>{categoryLabels[category]} (можно выбрать несколько)</legend>
                <div className="tags-container">
                    {tags.map(tag => (
                        <label key={tag} className="tag-label">
                            <input
                                type="checkbox"
                                checked={(selectedTags[category] || []).includes(tag)}
                                onChange={() => handleTagToggle(category, tag)}
                            />
                            <span className="tag-text">{tag}</span>
                        </label>
                    ))}
                </div>
            </fieldset>
        ))}

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
                name="contactsForClient"
                placeholder="Напишите контакты для клиента, как и где с вам можно связаться"
                type="text"
                value={formData.contactsForClient}
                onChange={handleInputChange}
                className={errors.contactsForClient ? 'error' : ''}
            />
            {errors.contactsForClient && <span className="error-message">{errors.contactsForClient}</span>}
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