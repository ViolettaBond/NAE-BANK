import { useState } from 'react'
import styles from './Form.module.scss'

const initialState = {
    // персональные
    surname: '',
    firstName: '',
    patronymic: '',
    birthDate: '',
    gender: '',
    mobilePhone: '',
    email: '',
    // паспортные
    passportSeries: '',
    passportNumber: '',
    issueDate: '',
    divisionCode: '',
    birthPlace: '',
    issuedBy: '',
}

export default function Form() {
    const [values, setValues] = useState(initialState)
    const [status, setStatus] = useState({ state: 'idle', message: '' })

    const onChange = (e) => {
        const { name, value } = e.target
        setValues((v) => ({ ...v, [name]: value }))
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        setStatus({ state: 'loading', message: '' })

        // пустые строки → null, чтобы не затирать уже известные данные в БД
        const payload = Object.fromEntries(
            Object.entries(values).map(([k, v]) => [
                k,
                v.trim() === '' ? null : v.trim(),
            ])
        )

        try {
            const res = await fetch('/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.message || 'Ошибка отправки')

            setStatus({ state: 'ok', message: 'Заявка отправлена! Мы свяжемся с вами.' })
            setValues(initialState)
        } catch (err) {
            setStatus({ state: 'error', message: err.message })
        }
    }

    return (
        <>
            <header className={styles.header}>
                <div className={styles.container}>
                    <div className={styles.logo}>
                        <p className={styles.logoText}>
                            NAE-<span>BANK</span>
                        </p>
                        <p className={styles.losung}>Твой самый надёжный банк</p>
                    </div>

                    <div className={styles.headerRight}>
                        <span className={styles.badge}>Онлайн-заявка</span>
                        <p className={styles.crediText}>Анкета на кредит</p>
                    </div>
                </div>
            </header>

            <main>
                <section className={styles.hero}>
                    <div className={styles.heroInner}>
                        <h1 className={styles.heroTitle}>Заявка на кредит</h1>
                        <p className={styles.heroSubtitle}>
                            Заполните анкету — решение придёт в течение 5 минут
                        </p>
                        <div className={styles.steps}>
                            <div className={`${styles.step} ${styles.stepActive}`}>
                                <span>1</span> Персональные данные
                            </div>
                            <div className={styles.stepLine} />
                            <div className={styles.step}>
                                <span>2</span> Паспортные данные
                            </div>
                            <div className={styles.stepLine} />
                            <div className={styles.step}>
                                <span>3</span> Подтверждение
                            </div>
                        </div>
                    </div>
                </section>

                <form className={styles.form} onSubmit={onSubmit} noValidate>
                    <div className={styles.container}>
                        {/* --- Секция 1: Персональные данные --- */}
                        <fieldset className={styles.section}>
                            <legend className={styles.sectionTitle}>
                                <span className={styles.sectionIcon}>👤</span>
                                Персональные данные
                            </legend>

                            <div className={styles.grid}>
                                <label className={styles.field}>
                                    <span>Фамилия</span>
                                    <input
                                        type="text"
                                        name="surname"
                                        placeholder="Иванов"
                                        value={values.surname}
                                        onChange={onChange}
                                        autoComplete="family-name"
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>Имя</span>
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="Иван"
                                        value={values.firstName}
                                        onChange={onChange}
                                        autoComplete="given-name"
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>Отчество</span>
                                    <input
                                        type="text"
                                        name="patronymic"
                                        placeholder="Иванович"
                                        value={values.patronymic}
                                        onChange={onChange}
                                        autoComplete="additional-name"
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>Дата рождения</span>
                                    <input
                                        type="date"
                                        name="birthDate"
                                        value={values.birthDate}
                                        onChange={onChange}
                                        autoComplete="bday"
                                    />
                                </label>

                                {/* --- Пол --- */}
                                <div className={`${styles.field} ${styles.full}`}>
                                    <span>Пол</span>
                                    <div className={styles.radioGroup}>
                                        <label className={styles.radio}>
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="Мужской"
                                                checked={values.gender === 'Мужской'}
                                                onChange={onChange}
                                            />
                                            <span>Мужской</span>
                                        </label>
                                        <label className={styles.radio}>
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="Женский"
                                                checked={values.gender === 'Женский'}
                                                onChange={onChange}
                                            />
                                            <span>Женский</span>
                                        </label>
                                    </div>
                                </div>

                                <label className={styles.field}>
                                    <span>Мобильный телефон</span>
                                    <input
                                        type="tel"
                                        name="mobilePhone"
                                        placeholder="+7 (999) 123-45-67"
                                        value={values.mobilePhone}
                                        onChange={onChange}
                                        autoComplete="tel"
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>Электронная почта</span>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="example@mail.ru"
                                        value={values.email}
                                        onChange={onChange}
                                        autoComplete="email"
                                    />
                                </label>
                            </div>
                        </fieldset>

                        {/* --- Секция 2: Паспортные данные --- */}
                        <fieldset className={styles.section}>
                            <legend className={styles.sectionTitle}>
                                <span className={styles.sectionIcon}>📄</span>
                                Паспортные данные
                            </legend>

                            <div className={styles.grid}>
                                <label className={styles.field}>
                                    <span>Серия паспорта</span>
                                    <input
                                        type="text"
                                        name="passportSeries"
                                        placeholder="0000"
                                        inputMode="numeric"
                                        maxLength={4}
                                        value={values.passportSeries}
                                        onChange={onChange}
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>Номер паспорта</span>
                                    <input
                                        type="text"
                                        name="passportNumber"
                                        placeholder="000000"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={values.passportNumber}
                                        onChange={onChange}
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>Дата выдачи</span>
                                    <input
                                        type="date"
                                        name="issueDate"
                                        value={values.issueDate}
                                        onChange={onChange}
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>Код подразделения</span>
                                    <input
                                        type="text"
                                        name="divisionCode"
                                        placeholder="000-000"
                                        value={values.divisionCode}
                                        onChange={onChange}
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>Место рождения</span>
                                    <input
                                        type="text"
                                        name="birthPlace"
                                        placeholder="г. Москва"
                                        value={values.birthPlace}
                                        onChange={onChange}
                                    />
                                </label>

                                <label className={`${styles.field} ${styles.full}`}>
                                    <span>Кем выдан</span>
                                    <textarea
                                        name="issuedBy"
                                        rows={3}
                                        placeholder="Наименование органа, выдавшего паспорт"
                                        value={values.issuedBy}
                                        onChange={onChange}
                                    />
                                </label>
                            </div>
                        </fieldset>

                        {/* --- Статус отправки --- */}
                        {status.state === 'error' && (
                            <p className={styles.error}>{status.message}</p>
                        )}
                        {status.state === 'ok' && (
                            <p className={styles.success}>{status.message}</p>
                        )}

                        <div className={styles.actions}>
                            <p className={styles.consent}>
                                Нажимая кнопку, вы соглашаетесь с обработкой
                                персональных данных
                            </p>
                            <button
                                type="submit"
                                className={styles.submit}
                                disabled={status.state === 'loading'}
                            >
                                {status.state === 'loading' ? 'Отправляем…' : 'Отправить заявку'}
                                <span className={styles.arrow}>→</span>
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </>
    )
}