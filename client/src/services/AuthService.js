import User from '../models/User'

class AuthService {
  constructor({ apiService, mockApiService, storageService, configService }) {
    this.apiService = apiService
    this.mockApiService = mockApiService
    this.storageService = storageService
    this.configService = configService
    this.currentUserKey = 'currentUser'
    this.authTokenKey = 'authToken'
  }

  useMockApi() {
    return this.configService.get('useMockApi')
  }

  async login({ email, password }) {
    if (this.useMockApi()) {
      return this.loginWithMock({ email, password })
    }

    const response = await this.apiService.post('/api/auth/login', {
      email: this.normalizeEmail(email),
      password,
    })

    return this.setAuthSession(response.token, response.user)
  }

  async register({ fullName, email, password, role = 'student' }) {
    if (this.useMockApi()) {
      return this.registerWithMock({ fullName, email, password, role })
    }

    const response = await this.apiService.post('/api/auth/register', {
      fullName: fullName.trim(),
      email: this.normalizeEmail(email),
      password,
      role,
    })

    return this.setAuthSession(response.token, response.user)
  }

  async restoreSession() {
    if (this.useMockApi()) {
      return this.getCurrentUser()
    }

    const token = this.storageService.load(this.authTokenKey, null)

    if (!token) {
      return null
    }

    try {
      const user = await this.apiService.get('/api/auth/me')
      const safeUser = this.toSafeUser(user)
      this.setCurrentUser(safeUser)
      return safeUser
    } catch {
      this.clearAuthSession()
      return null
    }
  }

  logout() {
    this.clearAuthSession()
  }

  getCurrentUser() {
    return this.storageService.load(this.currentUserKey, null)
  }

  setCurrentUser(user) {
    this.storageService.save(this.currentUserKey, user)
  }

  getRedirectPath(user) {
    return user?.role === 'teacher' ? '/teacher' : '/student'
  }

  async loginWithMock({ email, password }) {
    const users = await this.mockApiService.getAll('users')
    const normalizedEmail = this.normalizeEmail(email)

    const user = users.find(
      (currentUser) =>
        this.normalizeEmail(currentUser.email) === normalizedEmail &&
        currentUser.password === password,
    )

    if (!user) {
      throw new Error('Invalid email or password.')
    }

    const safeUser = this.toSafeUser(user)
    this.setCurrentUser(safeUser)
    return safeUser
  }

  async registerWithMock({ fullName, email, password, role = 'student' }) {
    const users = await this.mockApiService.getAll('users')
    const normalizedEmail = this.normalizeEmail(email)
    const existingUser = users.find(
      (currentUser) => this.normalizeEmail(currentUser.email) === normalizedEmail,
    )

    if (existingUser) {
      throw new Error('A user with this email already exists.')
    }

    const user = new User({
      id: crypto.randomUUID(),
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      role,
    })

    await this.mockApiService.create('users', user)

    const safeUser = this.toSafeUser(user)
    this.setCurrentUser(safeUser)
    return safeUser
  }

  setAuthSession(token, user) {
    this.storageService.save(this.authTokenKey, token)
    const safeUser = this.toSafeUser(user)
    this.setCurrentUser(safeUser)
    return safeUser
  }

  clearAuthSession() {
    this.storageService.remove(this.currentUserKey)
    this.storageService.remove(this.authTokenKey)
  }

  normalizeEmail(email) {
    return email.trim().toLowerCase()
  }

  toSafeUser(user) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    }
  }
}

export default AuthService
