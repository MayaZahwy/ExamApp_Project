class NotifyService {
  constructor(loggerService) {
    this.loggerService = loggerService
    this.listeners = new Set()
  }

  subscribe(listener) {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  success(message) {
    this.show('success', message)
  }

  error(message) {
    this.show('error', message)
  }

  show(type, message) {
    const notification = {
      id: crypto.randomUUID(),
      type,
      message,
      createdAt: new Date().toISOString(),
    }

    this.listeners.forEach((listener) => listener(notification))
    this.loggerService.info(message, { type })

    return notification
  }
}

export default NotifyService
