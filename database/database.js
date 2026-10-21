import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    host: 'postgres',
    port: 5432,
    database: 'requests',
    user: 'postgres',
    password: 'postgres',
});

const n = (v) => (v === undefined || v === null || v === '' ? null : v);
const lower = (v) => (v ? String(v).trim().toLowerCase() : null);

export async function handleIncomingRequest(raw) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const personId = await resolvePerson(client, raw);

        const { rows } = await client.query(
            `
            INSERT INTO requests
                (person_id, first_name, surname, patronymic, mobile_phone,
                 home_phone, other_contact, email, gender)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING id
            `,
            [
                personId,
                n(raw.firstName ?? raw.first_name),
                n(raw.surname),
                n(raw.patronymic),
                n(raw.mobilePhone ?? raw.mobile_phone),
                n(raw.homePhone ?? raw.home_phone),
                n(raw.otherContact ?? raw.other_contact),
                n(raw.email),
                n(raw.gender),
            ],
        );

        await client.query('COMMIT');
        return { requestId: rows[0].id, personId };
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

async function resolvePerson(client, raw) {
    const series = n(raw.passportSeries ?? raw.passport_series);
    const number = n(raw.passportNumber ?? raw.passport_number);

    if (series && number) {
        const { rows } = await client.query(
            `SELECT person_id FROM person_passports
             WHERE passport_series = $1 AND passport_number = $2`,
            [series, number],
        );
        if (rows[0]) {
            await upsertPassport(client, rows[0].person_id, raw);
            return rows[0].person_id;
        }
    }

    const surname = n(raw.surname);
    const firstName = n(raw.firstName ?? raw.first_name);
    const birthDate = n(raw.birthDate ?? raw.birth_date);

    if (surname && firstName && birthDate) {
        const { rows } = await client.query(
            `SELECT id FROM persons
             WHERE lower(surname) = $1
               AND lower(first_name) = $2
               AND birth_date = $3
             LIMIT 1`,
            [lower(surname), lower(firstName), birthDate],
        );
        if (rows[0]) {
            const personId = rows[0].id;
            if (series && number) await upsertPassport(client, personId, raw);
            return personId;
        }
    }

    const phone = n(raw.mobilePhone ?? raw.mobile_phone);
    const email = n(raw.email);
    if (phone || email) {
        const { rows } = await client.query(
            `SELECT person_id FROM requests
             WHERE person_id IS NOT NULL
               AND (mobile_phone = $1 OR email = $2)
             ORDER BY created_at DESC
             LIMIT 1`,
            [phone, email],
        );
        if (rows[0]) {
            const personId = rows[0].person_id;
            if (series && number) await upsertPassport(client, personId, raw);
            return personId;
        }
    }

    if (!surname || !firstName || !birthDate) {
        return null;
    }

    const { rows } = await client.query(
        `INSERT INTO persons (first_name, surname, patronymic, birth_date, gender)
         VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [firstName, surname, n(raw.patronymic), birthDate, n(raw.gender)],
    );

    const personId = rows[0].id;
    if (series && number) await upsertPassport(client, personId, raw);
    return personId;
}

async function upsertPassport(client, personId, raw) {
    const series = n(raw.passportSeries ?? raw.passport_series);
    const number = n(raw.passportNumber ?? raw.passport_number);
    if (!series || !number) return;

    const { rows: existing } = await client.query(
        `SELECT id FROM person_passports
         WHERE passport_series = $1 AND passport_number = $2`,
        [series, number],
    );

    if (existing[0]) {
        await client.query(
            `UPDATE person_passports
             SET issue_date = COALESCE($1, issue_date),
                 division_code = COALESCE($2, division_code),
                 issued_by = COALESCE($3, issued_by),
                 birth_place = COALESCE($4, birth_place),
                 registration = COALESCE($5, registration)
             WHERE id = $6`,
            [
                n(raw.issueDate ?? raw.issue_date),
                n(raw.divisionCode ?? raw.division_code),
                n(raw.issuedBy ?? raw.issued_by),
                n(raw.birthPlace ?? raw.birth_place),
                n(raw.registration),
                existing[0].id,
            ],
        );
        return;
    }

    await client.query(
        `UPDATE person_passports SET active = FALSE
         WHERE person_id = $1 AND active = TRUE`,
        [personId],
    );

    await client.query(
        `INSERT INTO person_passports
            (person_id, passport_series, passport_number, issue_date,
             division_code, issued_by, birth_place, registration, active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,TRUE)`,
        [
            personId, series, number,
            n(raw.issueDate ?? raw.issue_date),
            n(raw.divisionCode ?? raw.division_code),
            n(raw.issuedBy ?? raw.issued_by),
            n(raw.birthPlace ?? raw.birth_place),
            n(raw.registration),
        ],
    );
}