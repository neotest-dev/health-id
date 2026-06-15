import { allowMethods, requireProfile, sendJson } from '../utils/request.js'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) {
    return
  }

  try {
    const { user, profile } = await requireProfile(req)

    return sendJson(res, 200, {
      profile: {
        id: profile.id,
        dni: profile.dni,
        full_name: profile.full_name,
        role: profile.role,
      },
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    return sendJson(res, 401, { error: error.message || 'No se pudo validar la sesion.' })
  }
}
