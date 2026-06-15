# HealthID

HealthID es un MVP web para gestionar citas e historiales clinicos protegidos con criptografia hibrida y reconocimiento facial.

## Stack

- React 19 + Vite
- Tailwind CSS 4
- Supabase Auth + PostgreSQL
- Vercel Serverless Functions
- face-api.js
- RSA-2048 + AES-256-GCM

## Flujo principal

1. El admin inicia sesion con Supabase Auth.
2. El admin crea especialidades y da de alta a los doctores.
3. El doctor entra con DNI y password temporal, actualiza su perfil y cambia contrasena.
4. El paciente registra su cita, selecciona especialidad/turno y captura su rostro.
5. El backend cifra toda la ficha del paciente con AES y cifra la llave AES con RSA.
6. El doctor valida el rostro del paciente para descifrar la ficha clinica.

## Variables de entorno

Usa `.env.example` como base:

```bash
cp .env.example .env
```

Variables requeridas:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Base de datos

Ejecuta `supabase/schema.sql` en el SQL Editor de Supabase.

Despues crea el usuario admin en Supabase Auth y registra su perfil en la tabla `profiles` con rol `admin`.

## Modelos faciales

Descarga los pesos de `face-api.js` y colocalos en `public/models/`.

La lista exacta esta en `public/models/README.md`.

## Comandos

```bash
pnpm install
pnpm dev
pnpm build
```
