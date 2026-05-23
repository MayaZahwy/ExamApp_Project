class StorageService {
  constructor(configService) {
    this.configService = configService
  }

  getStorageKey(key) {
    const prefix = this.configService.get('storagePrefix')
    return `${prefix}:${key}`
  }

  save(key, value) {
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
