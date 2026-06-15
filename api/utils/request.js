import { createRemoteJWKSet, jwtVerify } from 'jose'
import { getAdminSupabase } from './supabase.js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const jwtIssuer = supabaseUrl ? `${supabaseUrl}/auth/v1` : null
const jwks = supabaseUrl ? createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`)) : null

export async function readJson(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body
  }

  if (typeof req.body === 'string' && req.body.length) {
    return JSON.parse(req.body)
  }

  return await new Promise((resolve, reject) => {
    const chunks = []

    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8')
        resolve(text ? JSON.parse(text) : {})
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

export function sendJson(res, status, payload) {
  res.status(status).json(payload)
}

export function allowMethods(req, res, methods) {
  if (!methods.includes(req.method)) {
    sendJson(res, 405, { error: `Metodo no permitido. Usa: ${methods.join(', ')}` })
    return false
  }

  return true
}

export function getBearerToken(req) {
  const authorization = req.headers.authorization || ''
  if (!authorization.startsWith('Bearer ')) {
    return null
  }

  return authorization.slice('Bearer '.length)
}

async function verifyAccessToken(token) {
  if (!jwks || !jwtIssuer) {
    throw new Error('La verificacion JWT no esta configurada correctamente.')
  }

  const { payload } = await jwtVerify(token, jwks, {
    issuer: jwtIssuer,
    audience: 'authenticated',
  })

  if (!payload.sub) {
    throw new Error('El token autenticado no contiene un identificador valido.')
  }

  return {
    id: payload.sub,
    email: payload.email || null,
  }
}

export async function requireProfile(req, allowedRoles = [], timingStore = null) {
  const totalStartedAt = Date.now()
  const token = getBearerToken(req)

  if (!token) {
    throw new Error('No se encontro el token de autenticacion.')
  }

  const supabase = getAdminSupabase()
  let verifiedUser

  try {
    const verifyStartedAt = Date.now()
    verifiedUser = await verifyAccessToken(token)
    if (timingStore) {
      timingStore.verifyJwt = Date.now() - verifyStartedAt
    }
  } catch {
    throw new Error('Sesion invalida o expirada.')
  }

  const profileStartedAt = Date.now()
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', verifiedUser.id)
    .single()

  if (timingStore) {
    timingStore.loadProfile = Date.now() - profileStartedAt
  }

  if (profileError || !profile) {
    throw new Error('No se encontro el perfil asociado al usuario autenticado.')
  }

  if (allowedRoles.length && !allowedRoles.includes(profile.role)) {
    throw new Error('No tienes permisos para realizar esta accion.')
  }

  if (timingStore) {
    timingStore.total = Date.now() - totalStartedAt
  }

  return { user: verifiedUser, profile, supabase }
}
