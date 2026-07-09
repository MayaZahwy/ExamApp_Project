class ApiService {
  constructor(storageService) {
    this.storageService = storageService
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    this.authTokenKey = 'authToken'
  }

  get(path, options = {}) {
    return this.request(path, {
      ...options,
      method: 'GET',
    })
  }

  post(path, body, options = {}) {
    return this.request(path, {
      ...options,
      method: 'POST',
      body,
    })
  }

  put(path, body, options = {}) {
    return this.request(path, {
      ...options,
      method: 'PUT',
      body,
    })
  }

  patch(path, body, options = {}) {
    return this.request(path, {
      ...options,
      method: 'PATCH',
      body,
    })
  }

  delete(path, options = {}) {
    return this.request(path, {
      ...options,
      method: 'DELETE',
    })
  }

  async request(path, options = {}) {
    const token = this.storageService.load(this.authTokenKey, null)
    const headers = {
      ...this.getDefaultHeaders(options.body),
      ...(options.headers || {}),
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(this.buildUrl(path), {
      method: options.method || 'GET',
      headers,
      body: this.serializeBody(options.body),
    })

    const payload = await this.parseResponsePayload(response)

    if (!response.ok) {
      throw this.createHttpError(response, payload)
    }

    return payload
  }

  buildUrl(path) {
    const normalizedBaseUrl = this.baseUrl.replace(/\/$/, '')
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `${normalizedBaseUrl}${normalizedPath}`
  }

  getDefaultHeaders(body) {
    if (body === undefined || body === null) {
      return {}
    }

    return {
      'Content-Type': 'application/json',
    }
  }

  serializeBody(body) {
    if (body === undefined || body === null) {
      return undefined
    }

    return JSON.stringify(body)
  }

  async parseResponsePayload(response) {
    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      try {
        return await response.json()
      } catch {
        return null
      }
    }

    try {
      const text = await response.text()
      return text || null
    } catch {
      return null
    }
  }

  createHttpError(response, payload) {
    const errorMessage =
      (payload && typeof payload === 'object' && payload.message) ||
      `Request failed with status ${response.status}`
    const error = new Error(errorMessage)

    error.status = response.status
    error.payload = payload

    return error
  }
}

export default ApiService
