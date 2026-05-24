import ConfigService from './ConfigService'
import AuthService from './AuthService'
import ExamService from './ExamService'
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
const examService = new ExamService(mockApiService)

export {
  AuthService,
  ConfigService,
  ExamService,
  LoggerService,
  MockApiService,
  NotifyService,
  StorageService,
  authService,
  configService,
  examService,
  loggerService,
  mockApiService,
  notifyService,
  storageService,
}
