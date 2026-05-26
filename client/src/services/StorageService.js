class StorageService {
  constructor(configService) {
    this.configService = configService
  }

  getStorageKey(key) {
    const prefix = this.configService.get('storagePrefix')
    return `${prefix}:${key}`
  }

  save(key, value) {
    // All app data is stored as JSON in the browser.
    localStorage.setItem(this.getStorageKey(key), JSON.stringify(value))
  }

  load(key, fallbackValue = null) {
    const value = localStorage.getItem(this.getStorageKey(key))

    if (value === null) {
      return fallbackValue
    }

    try {
      return JSON.parse(value)
    } catch {
      // Bad saved data should not break the app.
      return fallbackValue
    }
  }

  remove(key) {
    localStorage.removeItem(this.getStorageKey(key))
  }

  clear(keys = []) {
    keys.forEach((key) => this.remove(key))
  }
}

export default StorageService
