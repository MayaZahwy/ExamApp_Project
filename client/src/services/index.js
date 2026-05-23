import ConfigService from './ConfigService'
import AuthService from './AuthService'
import LoggerService from './LoggerService'
import MockApiService from './MockApiService'
import NotifyService from './NotifyService'
import StorageService from './StorageService'

const configService = new ConfigService()
const storageService = new StorageService(configService)
const loggerService = new LoggerService(configService)
const notifyService = new NotifyService(loggerService)
const mockApiService = new MockApiService(storageService)
const authService = new AuthService(mockApiService, storageService)

export {
  AuthService,
  ConfigService,
  LoggerService,
  MockApiService,
  NotifyService,
  StorageService,
  authService,
  configService,
  loggerService,
  mockApiService,
  notifyService,
  storageService,
}
