import User from '../models/User'

class AuthService {
  constructor(mockApiService, storageService) {
    this.mockApiService = mockApiService
    this.storageService = storageService
    this.currentUserKey = 'currentUser'
  }

  async login({ email, password }) {
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

  async register({ fullName, email, password, role = 'student' }) {
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

  logout() {
    this.storageService.remove(this.currentUserKey)
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
