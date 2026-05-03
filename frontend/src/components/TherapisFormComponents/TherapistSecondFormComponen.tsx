import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Form.css'
import { TherapistSecondFormErrors } from 'interfaces/Errors';
import { updateTherapist } from '../../api/therapistApi';
import { avatarPathToMediaUrl } from '../../api/api';
import { checkCity } from '../../api/checkCity';
import { TAG_CATEGORIES, TAG_CATEGORY_LABELS, type TagCategoryKey } from '../../constants/tags';
import { TherapistByTgIdResponse } from '../../interfaces/TherapistInterface';
import { notifyTelegramWebAppFormSubmitted } from '../../utils/telegramWebApp';

function TherapistSecondFormComponent({
    client_id,
    initialData = null,
    mode = 'create',
}: {
    client_id: number
    initialData?: TherapistByTgIdResponse | null
    mode?: 'create' | 'edit'
}) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        city: '',
        phone: '',
        about: '',
        website: '',
        sex: '',
        age: '',
        email: '',
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
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [avatarError, setAvatarError] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        return () => {
            if (avatarPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview)
            }
        }
    }, [avatarPreview])

    const buildAvatarUrl = (pathOrBlob: string | null | undefined): string | null => {
        if (!pathOrBlob) {
            return null
        }
        if (pathOrBlob.startsWith('blob:')) {
            return pathOrBlob
        }
        return avatarPathToMediaUrl(pathOrBlob)
    }

    useEffect(() => {
        if (!initialData) {
            return
        }

        const tagIds = Array.isArray(initialData.tag_ids) ? initialData.tag_ids : []
        const currencyAmount: Record<string, number> =
            initialData.currency_amount && typeof initialData.currency_amount === 'object'
                ? initialData.currency_amount
                : {}
        setFormData({
            first_name: initialData.first_name ?? '',
            last_name: initialData.last_name ?? '',
            city: initialData.city ?? '',
            phone: initialData.phone_number ?? '',
            about: initialData.pitch ?? '',
            website: initialData.site ?? '',
            sex: initialData.sex ?? '',
            age: String(initialData.age ?? ''),
            email: initialData.email ?? '',
            experience: String(initialData.experience ?? ''),
            min_client_age: String(initialData.min_client_age ?? ''),
            max_client_age: String(initialData.max_client_age ?? ''),
            contacts_for_client: initialData.contacts_for_client ?? '',
            online: Boolean(initialData.online),
            isPsychiatrist: tagIds.includes(4),
            isGerontologist: tagIds.includes(35),
            isFamilyTherapist: tagIds.includes(25),
            doesGroupTherapy: false,
            isSupervisor: tagIds.includes(42),
            consent: Boolean(initialData.consent),
            availableToCall: Boolean(initialData.available_to_call),
        })

        setSelectedTags(tagIds.filter((tagId) => ![4, 25, 35, 42].includes(tagId)))
        setCurrencies([
            { code: 'rub', name: 'Рубли', selected: 'RUB' in currencyAmount, amount: String(currencyAmount.RUB ?? '') },
            { code: 'usd', name: 'Доллары', selected: 'USD' in currencyAmount, amount: String(currencyAmount.USD ?? '') },
            { code: 'eur', name: 'Евро', selected: 'EUR' in currencyAmount, amount: String(currencyAmount.EUR ?? '') },
        ])
        setAvatarPreview(buildAvatarUrl(initialData.avatar_path))
    }, [initialData])


    const toggleCurrency = (code: string) => {
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

    const updateAmount = (code: string, value: string) => {
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

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) {
            return
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            setAvatarFile(null)
            if (avatarPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview)
            }
            setAvatarPreview(null)
            setAvatarError('Можно загрузить только JPG, PNG или WEBP')
            e.target.value = ''
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setAvatarFile(null)
            if (avatarPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview)
            }
            setAvatarPreview(null)
            setAvatarError('Размер файла не должен превышать 5 МБ')
            e.target.value = ''
            return
        }

        if (avatarPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(avatarPreview)
        }
        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
        setAvatarError('')
    }

    const handleRemoveAvatar = () => {
        if (avatarPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(avatarPreview)
        }
        setAvatarFile(null)
        setAvatarPreview(null)
        setAvatarError('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

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

        if (phoneValue && !/^\+?[0-9\s\-()]+$/.test(phoneValue)) {
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

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formErrors = await validateForm();

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

    const tagIds = new Set(selectedTags)
    if (formData.isPsychiatrist) tagIds.add(4)
    if (formData.isSupervisor) tagIds.add(42)
    if (formData.isGerontologist) tagIds.add(35)
    if (formData.isFamilyTherapist) tagIds.add(25)

    const submissionData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        city: formData.city,
        phone_number: formData.phone,
        pitch: formData.about,
        site: formData.website,
        sex: formData.sex,
        age: formData.age,
        email: formData.email,
        experience: formData.experience,
        min_client_age: formData.min_client_age,
        max_client_age: formData.max_client_age,
        contacts_for_client: formData.contacts_for_client,
        online: formData.online,
        consent: formData.consent,
        available_to_call: formData.availableToCall,
        currency_amount: currency_amount.reduce((acc, curr) => {
            if (curr.selected) {
                acc[curr.code.toUpperCase()] = parseInt(curr.amount) || 0;
                    }
                    return acc;
                }, {} as Record<string, number>),
        tag_ids: Array.from(tagIds),
        file: avatarFile
    };
    console.log('Данные для отправки:', submissionData);
    try {
        await updateTherapist(submissionData, client_id);
        await notifyTelegramWebAppFormSubmitted('therapist_second', client_id);
        navigate('/form-success', {
            state: {
                title: mode === 'edit' ? 'Анкета терапевта обновлена' : 'Анкета терапевта отправлена',
                message:
                    mode === 'edit'
                        ? 'Изменения сохранены.'
                        : 'Спасибо! Мы получили вашу анкету. После проверки данные появятся в каталоге, если всё в порядке.',
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
            <label className="avatar-upload">
                Фотография профиля (необязательно)
                <span className="avatar-helper">JPG, PNG или WEBP, до 5 МБ</span>
            </label>

            {!avatarPreview && (
                <>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleAvatarChange}
                        className="avatar-file-input"
                        id="therapist-avatar-input"
                    />
                    <label htmlFor="therapist-avatar-input" className="avatar-upload-btn">
                        Выбрать фото
                    </label>
                </>
            )}

            {avatarError && <span className="error-message avatar-error">{avatarError}</span>}
            {avatarPreview && (
                <div className="avatar-preview">
                    <img src={avatarPreview} alt="Превью фотографии профиля" />
                    <button type="button" className="avatar-remove-btn" onClick={handleRemoveAvatar}>
                        Удалить фото
                    </button>
                </div>
            )}
        </div>

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
            <button type="submit" className="submit-btn">{mode === 'edit' ? 'Сохранить изменения' : 'Отправить заявку'}</button>
        </div>
    </form>
);
}

export default TherapistSecondFormComponent;
