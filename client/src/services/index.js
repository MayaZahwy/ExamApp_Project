import ConfigService from './ConfigService'
import ApiService from './ApiService'
import AuthService from './AuthService'
import ExamService from './ExamService'
import LoggerService from './LoggerService'
import MockApiService from './MockApiService'
import NotifyService from './NotifyService'
import SubmissionService from './SubmissionService'
import StorageService from './StorageService'

const configService = new ConfigService()
const storageService = new StorageService(configService)
const apiService = new ApiService(storageService)
const loggerService = new LoggerService(configService)
const notifyService = new NotifyService(loggerService)
const mockApiService = new MockApiService(storageService)
const authService = new AuthService({
  apiService,
  mockApiService,
  storageService,
  configService,
})
const examService = new ExamService({
  apiService,
  mockApiService,
  configService,
})
const submissionService = new SubmissionService({
  apiService,
  mockApiService,
  examService,
  configService,
})

export {
  ApiService,
  AuthService,
  ConfigService,
  ExamService,
  LoggerService,
  MockApiService,
  NotifyService,
  SubmissionService,
  StorageService,
  apiService,
  authService,
  configService,
  examService,
  loggerService,
  mockApiService,
  notifyService,
  storageService,
  submissionService,
}
