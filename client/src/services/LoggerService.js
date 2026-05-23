class LoggerService {
  constructor(configService) {
    this.configService = configService
  }

  debug(message, data = null) {
    if (this.configService.get('logLevel') === 'debug') {
      this.write('debug', message, data)
    }
  }

  info(message, data = null) {
    this.write('info', message, data)
  }

  warn(message, data = null) {
    this.write('warn', message, data)
  }

  error(message, data = null) {
    this.write('error', message, data)
  }

  write(level, message, data) {
    const logMessage = `[${this.configService.get('appName')}] ${message}`

    if (data === null) {
      console[level](logMessage)
      return
    }

    console[level](logMessage, data)
  }
}

export default LoggerService
