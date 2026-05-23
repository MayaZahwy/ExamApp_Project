class ConfigService {
  constructor() {
    this.config = {
      appName: 'Exam Management App',
      storagePrefix: 'exam_app',
      logLevel: 'debug',
      notifyTimeoutMs: 3000,
    }
  }

  get(key) {
    return this.config[key]
  }

  getAll() {
    return { ...this.config }
  }

  set(key, value) {
    this.config[key] = value
  }
}

export default ConfigService
