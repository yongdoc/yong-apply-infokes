import { t } from 'elysia';

export const RegisterSchema = {
    body: t.Object({
        name: t.String({ minLength: 1, maxLength: 255 }),
        username: t.String({ minLength: 3, maxLength: 50 }),
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 6 })
    })
}

export const LoginSchema = {
    body: t.Object({
        identifier: t.String({ minLength: 3 }),
        password: t.String({ minLength: 6 })
    })
}

export const UpdatePasswordSchema = {
    body: t.Object({
        old_password: t.String({ minLength: 6 }),
        new_password: t.String({ minLength: 6 })
    })
}