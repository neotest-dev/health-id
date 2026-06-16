export async function apiRequest(path, { method = 'GET', body, token, onResponse } = {}) {
  const response = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  if (onResponse) {
    onResponse(response)
  }

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error || 'Ocurrió un error inesperado.')
  }

  return payload
}

export function doctorEmailFromDni(dni) {
  const cleaned = String(dni).trim()

  if (cleaned.includes('@')) {
    return cleaned
  }

  return `${cleaned}@doctor.healthid.local`
}
