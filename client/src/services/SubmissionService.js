import Submission from '../models/Submission'

class SubmissionService {
  constructor({ apiService, mockApiService, examService, configService }) {
    this.apiService = apiService
    this.mockApiService = mockApiService
    this.examService = examService
    this.configService = configService
  }

  useMockApi() {
    return this.configService.get('useMockApi')
  }

  async getStudentSubmissions(studentId) {
    if (!this.useMockApi()) {
      return this.apiService.get('/api/submissions/mine')
    }

    const submissions = await this.mockApiService.getAll('submissions')

    return submissions.filter((submission) => submission.studentId === studentId)
  }

  async getStudentResults(studentId) {
    if (!this.useMockApi()) {
      const submissions = await this.apiService.get('/api/submissions/mine')
      return submissions.sort((firstSubmission, secondSubmission) =>
        secondSubmission.submittedAt.localeCompare(firstSubmission.submittedAt),
      )
    }

    const submissions = await this.getStudentSubmissions(studentId)
    const exams = await this.mockApiService.getAll('exams')
    const questions = await this.mockApiService.getAll('questions')

    return submissions
      .map((submission) => {
        const exam = exams.find((currentExam) => currentExam.id === submission.examId)
        const examQuestions = questions.filter(
          (question) => question.examId === submission.examId,
        )
        const maxScore =
          submission.maxScore ?? this.calculateMaxScore(examQuestions)
        const percentage =
          submission.percentage ??
          (maxScore > 0 ? Math.round((submission.score / maxScore) * 100) : 0)

        return {
          ...submission,
          exam: exam ?? null,
          maxScore,
          percentage,
        }
      })
      .sort((firstSubmission, secondSubmission) =>
        secondSubmission.submittedAt.localeCompare(firstSubmission.submittedAt),
      )
  }

  async submitExam(studentId, examId, selectedAnswers) {
    const exam = await this.examService.getAvailableExamById(examId)

    if (!exam) {
      throw new Error('This exam is not available.')
    }

    const answers = exam.questions.map((question) => {
      const selectedValue = selectedAnswers[question.id]
      if (question.type === 'OPEN_ENDED') {
        return {
          questionId: question.id,
          text: typeof selectedValue === 'string' ? selectedValue : '',
        }
      }

      return {
        questionId: question.id,
        selectedOptionId: selectedValue ?? null,
      }
    })

    if (!this.useMockApi()) {
      return this.apiService.post('/api/submissions', {
        examId,
        answers,
      })
    }

    const score = this.calculateScore(exam.questions, answers)
    const maxScore = this.calculateMaxScore(exam.questions)
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
    const submission = new Submission({
      id: crypto.randomUUID(),
      examId,
      studentId,
      answers,
      score,
      maxScore,
      percentage,
      submittedAt: new Date().toISOString(),
      status: 'graded',
    })

    await this.mockApiService.create('submissions', submission)

    return {
      ...submission,
      exam,
    }
  }

  calculateScore(questions, answers) {
    // Each correct answer adds the question points to the final score.
    return questions.reduce((total, question) => {
      const answer = answers.find(
        (currentAnswer) => currentAnswer.questionId === question.id,
      )

      if (answer?.selectedOptionId !== question.correctOptionId) {
        return total
      }

      return total + (Number(question.points) || 0)
    }, 0)
  }

  calculateMaxScore(questions) {
    return questions.reduce(
      (total, question) => total + (Number(question.points) || 0),
      0,
    )
  }
}

export default SubmissionService
