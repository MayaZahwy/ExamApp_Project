import Exam from '../models/Exam'
import Question from '../models/Question'

class ExamService {
  constructor(mockApiService) {
    this.mockApiService = mockApiService
  }

  async getTeacherExams(teacherId) {
    const exams = await this.mockApiService.getAll('exams')
    const questions = await this.mockApiService.getAll('questions')

    return exams
      .filter((exam) => exam.teacherId === teacherId)
      .map((exam) => this.attachQuestions(exam, questions))
  }

  async getExamForTeacher(examId, teacherId) {
    const exam = await this.mockApiService.getById('exams', examId)

    if (!exam || exam.teacherId !== teacherId) {
      return null
    }

    const questions = await this.mockApiService.getAll('questions')
    return this.attachQuestions(exam, questions)
  }

  async createExam(teacherId, examData) {
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

  attachQuestions(exam, questions) {
    const examQuestions = questions.filter((question) => question.examId === exam.id)

    return {
      ...exam,
      questions: examQuestions,
    }
  }

  buildQuestions(examId, questions) {
    return questions.map((question, questionIndex) => {
      const options = question.options.map((option, optionIndex) => ({
        id: option.id || `${questionIndex}-${optionIndex}`,
        text: option.text.trim(),
      }))

      return new Question({
        id: question.id || crypto.randomUUID(),
        examId,
        text: question.text.trim(),
        options,
        correctOptionId: question.correctOptionId || options[0]?.id,
        points: Number(question.points) || 10,
      })
    })
  }
}

export default ExamService
