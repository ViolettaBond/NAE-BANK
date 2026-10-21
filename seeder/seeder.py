import os
import random
import psycopg2
from faker import Faker

fake = Faker('ru_RU')

try:
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST", "postgres"),
        database=os.getenv("DB_NAME", "requests"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "postgres"),
    )
    cursor = conn.cursor()

    print("Подключение успешно. Очищаем старые данные...")
    cursor.execute(
        "TRUNCATE TABLE requests, person_passports, persons RESTART IDENTITY CASCADE;"
    )

    for _ in range(1000):
        gender = random.choice(['Мужской', 'Женский'])

        if gender == 'Мужской':
            first_name = fake.first_name_male()
            surname = fake.last_name_male()
            patronymic = fake.middle_name_male()
        else:
            first_name = fake.first_name_female()
            surname = fake.last_name_female()
            patronymic = fake.middle_name_female()

        birth_date = fake.date_of_birth(minimum_age=18, maximum_age=70)

        cursor.execute(
            """
            INSERT INTO persons (first_name, surname, patronymic, birth_date, gender)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id;
            """,
            (first_name, surname, patronymic, birth_date, gender),
        )
        person_id = cursor.fetchone()[0]

    
        passport_series = f"{random.randint(10, 99)}{random.randint(10, 99)}"
        passport_number = f"{random.randint(100000, 999999)}"
        issue_date = fake.date_between(start_date=birth_date, end_date='today')
        division_code = f"{random.randint(100, 999)}-{random.randint(100, 999)}"
        issued_by = f"УМВД РОССИИ ПО {fake.region().upper()}"
        birth_place = f"г. {fake.city()}"
        registration = fake.address().replace('\n', ' ')

        cursor.execute(
            """
            INSERT INTO person_passports
            (person_id, passport_series, passport_number, issue_date,
             division_code, issued_by, birth_place, registration, active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, TRUE);
            """,
            (person_id, passport_series, passport_number, issue_date,
             division_code, issued_by, birth_place, registration),
        )

   
        mobile_phone = fake.phone_number()
        home_phone = fake.phone_number()
        other_contact = fake.text(max_nb_chars=50).replace('\n', ' ')
        email = fake.ascii_free_email()

        cursor.execute(
            """
            INSERT INTO requests
            (person_id, first_name, surname, patronymic, mobile_phone,
             home_phone, other_contact, email, gender)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
            """,
            (person_id, first_name, surname, patronymic, mobile_phone,
             home_phone, other_contact, email, gender),
        )

    conn.commit()
    cursor.close()
    conn.close()
    print("Успешно сгенерировано 1000 человек с паспортами и заявками.")

except Exception as e:
    print(f"Ошибка: {e}")