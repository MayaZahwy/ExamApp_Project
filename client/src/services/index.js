import ConfigService from './ConfigService'
import LoggerService from './LoggerService'
import MockApiService from './MockApiService'
import NotifyService from './NotifyService'
import StorageService from './StorageService'

const configService = new ConfigService()
const storageService = new StorageService(configService)
const loggerService = new LoggerService(configService)
const notifyService = new NotifyService(loggerService)
const mockApiService = new MockApiService(storageService)

export {
  ConfigService,
  LoggerService,
  MockApiService,
  NotifyService,
  StorageService,
  configService,
  loggerService,
  mockApiService,
  notifyService,
  storageService,
}
