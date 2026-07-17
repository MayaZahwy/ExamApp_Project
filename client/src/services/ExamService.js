import Exam from '../models/Exam'
import Question from '../models/Question'

class ExamService {
  constructor({ apiService, mockApiService, configService }) {
    this.apiService = apiService
    this.mockApiService = mockApiService
    this.configService = configService
  }

  useMockApi() {
    return this.configService.get('useMockApi')
  }

  async getTeacherExams(teacherId) {
    if (!this.useMockApi()) {
      return this.apiService.get('/api/exams/mine')
    }

    const exams = await this.mockApiService.getAll('exams')
    const questions = await this.mockApiService.getAll('questions')

    return exams
      .filter((exam) => exam.teacherId === teacherId)
      .map((exam) => this.attachQuestions(exam, questions))
  }

  async getExamForTeacher(examId, teacherId) {
    if (!this.useMockApi()) {
      try {
        return await this.apiService.get(`/api/exams/${examId}`)
      } catch (error) {
        if (error.status === 404) {
          return null
        }
        throw error
      }
    }

    const exam = await this.mockApiService.getById('exams', examId)

    if (!exam || exam.teacherId !== teacherId) {
      return null
    }

    const questions = await this.mockApiService.getAll('questions')
    return this.attachQuestions(exam, questions)
  }

  async getAvailableExams() {
    if (!this.useMockApi()) {
      return this.apiService.get('/api/exams/available')
    }

    const exams = await this.mockApiService.getAll('exams')
    const questions = await this.mockApiService.getAll('questions')

    // Students can only see published exams.
    return exams
      .filter((exam) => exam.status === 'published')
      .map((exam) => this.attachQuestions(exam, questions))
  }

  async getAvailableExamById(examId) {
    if (!this.useMockApi()) {
      try {
        return await this.apiService.get(`/api/exams/available/${examId}`)
      } catch (error) {
        if (error.status === 404) {
          return null
        }
        throw error
      }
    }

    const exam = await this.mockApiService.getById('exams', examId)

    if (!exam || exam.status !== 'published') {
      return null
    }

    const questions = await this.mockApiService.getAll('questions')
    return this.attachQuestions(exam, questions)
  }

  async createExam(teacherId, examData) {
    if (!this.useMockApi()) {
      return this.apiService.post('/api/exams', {
        title: examData.title.trim(),
        description: examData.description.trim(),
        durationMinutes: Number(examData.durationMinutes) || 30,
        questions: this.toApiQuestions(examData.questions),
      })
    }

    const examId = crypto.randomUUID()
    const questions = this.buildQuestions(examId, examData.questions)
    const exam = new Exam({
      id: examId,
      title: examData.title.trim(),
      description: examData.description.trim(),
      teacherId,
      durationMinutes: Number(examData.durationMinutes) || 30,
      questionIds: questions.map((question) => question.id),
      status: 'draft',
      availableFrom: null,
      availableUntil: null,
    })

    await this.mockApiService.create('exams', exam)

    for (const question of questions) {
      await this.mockApiService.create('questions', question)
    }

    return this.attachQuestions(exam, questions)
  }

  async updateExam(examId, teacherId, examData) {
    if (!this.useMockApi()) {
      return this.apiService.put(`/api/exams/${examId}`, {
        title: examData.title.trim(),
        description: examData.description.trim(),
        durationMinutes: Number(examData.durationMinutes) || 30,
        questions: this.toApiQuestions(examData.questions),
      })
    }

    const existingExam = await this.getExamForTeacher(examId, teacherId)

    if (!existingExam) {
      throw new Error('Exam was not found.')
    }

    const allQuestions = await this.mockApiService.getAll('questions')
    const nextQuestions = this.buildQuestions(examId, examData.questions)
    const nextQuestionIds = nextQuestions.map((question) => question.id)
    const remainingQuestions = allQuestions.filter(
      (question) => question.examId !== examId,
    )

    const updatedExam = await this.mockApiService.update('exams', examId, {
      title: examData.title.trim(),
      description: examData.description.trim(),
      durationMinutes: Number(examData.durationMinutes) || 30,
      questionIds: nextQuestionIds,
    })

    await this.mockApiService.saveCollection('questions', [
      ...remainingQuestions,
      ...nextQuestions,
    ])

    return this.attachQuestions(updatedExam, nextQuestions)
  }

  async updateStatus(examId, teacherId, nextStatus) {
    if (!this.useMockApi()) {
      return this.apiService.patch(`/api/exams/${examId}/status`, {
        status: nextStatus,
      })
    }

    const exam = await this.getExamForTeacher(examId, teacherId)

    if (!exam) {
      throw new Error('Exam was not found.')
    }

    if (!this.canChangeStatus(exam.status, nextStatus)) {
      throw new Error('This status change is not allowed.')
    }

    const updatedExam = await this.mockApiService.update('exams', examId, {
      status: nextStatus,
    })
    const questions = await this.mockApiService.getAll('questions')

    return this.attachQuestions(updatedExam, questions)
  }

  getNextStatusOptions(status) {
    // Exam status moves forward only.
    if (status === 'draft') {
      return [{ label: 'Publish', status: 'published' }]
    }

    if (status === 'published') {
      return [{ label: 'Close', status: 'closed' }]
    }

    return []
  }

  canChangeStatus(currentStatus, nextStatus) {
    return this.getNextStatusOptions(currentStatus).some(
      (option) => option.status === nextStatus,
    )
  }

  attachQuestions(exam, questions) {
    const examQuestions = questions.filter((question) => question.examId === exam.id)

    return {
      ...exam,
      questions: examQuestions,
    }
  }

  buildQuestions(examId, questions) {
    return questions.map((question, questionIndex) => {
      const type = question.type || 'MULTIPLE_CHOICE'
      const options =
        type === 'OPEN_ENDED'
          ? []
          : (question.options || []).map((option, optionIndex) => ({
              id: option.id || `${questionIndex}-${optionIndex}`,
              text: option.text.trim(),
            }))

      return new Question({
        id: question.id || crypto.randomUUID(),
        examId,
        type,
        text: question.text.trim(),
        options,
        correctOptionId:
          type === 'OPEN_ENDED'
            ? null
            : question.correctOptionId || options[0]?.id,
        points: Number(question.points) || 10,
      })
    })
  }

  toApiQuestions(questions) {
    return questions.map((question, questionIndex) => {
      const type = question.type || 'MULTIPLE_CHOICE'
      const options =
        type === 'OPEN_ENDED'
          ? []
          : (question.options || []).map((option, optionIndex) => ({
              id: option.id || `${questionIndex}-${optionIndex}`,
              text: option.text.trim(),
            }))

      return {
        type,
        text: question.text.trim(),
        options,
        correctOptionId:
          type === 'OPEN_ENDED'
            ? null
            : question.correctOptionId || options[0]?.id || null,
        points: Number(question.points) || 10,
      }
    })
  }
}

export default ExamService
