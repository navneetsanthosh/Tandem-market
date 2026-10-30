export const API_ROOT = import.meta.env.VITE_API_ROOT || '/api'

export async function api(path, { token, body, ...options } = {}) {
  const headers = { ...(options.headers || {}) }
  if (token) headers.Authorization = `Token ${token}`
  const isForm = body instanceof FormData
  if (body !== undefined && body !== null && !isForm) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    headers,
    body: body === undefined || body === null ? undefined : isForm ? body : JSON.stringify(body),
  })
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : null
  if (!response.ok) {
    const detail = data?.detail || Object.entries(data || {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' ') : value}`).join(' · ')
    throw new Error(detail || `Request failed (${response.status}).`)
  }
  return data
}

export function money(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

export function imageSource(product) {
  return product?.image || product?.image_url || ''
}
