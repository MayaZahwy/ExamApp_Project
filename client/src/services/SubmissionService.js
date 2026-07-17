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
        const resultsPublished = Boolean(exam?.resultsPublished)
        const maxScore =
          submission.maxScore ?? this.calculateMaxScore(examQuestions)
        const percentage =
          submission.percentage ??
          (maxScore > 0 ? Math.round((submission.score / maxScore) * 100) : 0)

        const result = {
          ...submission,
          exam: exam
            ? {
                ...exam,
                resultsPublished,
              }
            : null,
          maxScore,
          percentage,
          resultsPublished,
        }

        if (resultsPublished) {
          return result
        }

        return {
          ...result,
          score: null,
          maxScore: null,
          percentage: null,
          feedback: null,
        }
      })
      .sort((firstSubmission, secondSubmission) =>
        secondSubmission.submittedAt.localeCompare(firstSubmission.submittedAt),
      )
  }

  async getExamSubmissions(examId, teacherId) {
    if (!this.useMockApi()) {
      return this.apiService.get(`/api/exams/${examId}/submissions`)
    }

    const exam = await this.examService.getExamForTeacher(examId, teacherId)
    if (!exam) {
      return []
    }

    const submissions = await this.mockApiService.getAll('submissions')
    return submissions
      .filter((submission) => submission.examId === examId)
      .sort((firstSubmission, secondSubmission) =>
        secondSubmission.submittedAt.localeCompare(firstSubmission.submittedAt),
      )
  }

  async getSubmissionById(submissionId) {
    if (!this.useMockApi()) {
      return this.apiService.get(`/api/submissions/${submissionId}`)
    }

    const submission = await this.mockApiService.getById('submissions', submissionId)
    if (!submission) {
      return null
    }

    const exam = await this.mockApiService.getById('exams', submission.examId)
    const questions = await this.mockApiService.getAll('questions')
    const examQuestions = questions.filter(
      (question) => question.examId === submission.examId,
    )

    return {
      ...submission,
      exam: exam
        ? {
            ...exam,
            questions: examQuestions,
          }
        : null,
    }
  }

  async gradeSubmission(submissionId, questionGrades, feedback) {
    if (!this.useMockApi()) {
      return this.apiService.patch(`/api/submissions/${submissionId}/grade`, {
        questionGrades,
        feedback,
      })
    }

    const submission = await this.getSubmissionById(submissionId)
    if (!submission) {
      throw new Error('Submission was not found.')
    }

    const examQuestions = submission.exam?.questions ?? []
    const autoScore = this.calculateScore(examQuestions, submission.answers ?? [])
    const openEndedAwardedScore = (questionGrades || []).reduce((total, grade) => {
      const question = examQuestions.find(
        (currentQuestion) => currentQuestion.id === grade.questionId,
      )
      if (!question || question.type !== 'OPEN_ENDED') {
        return total
      }

      const points = Number(grade.pointsAwarded) || 0
      const boundedPoints = Math.max(0, Math.min(points, Number(question.points) || 0))
      return total + boundedPoints
    }, 0)
    const score = autoScore + openEndedAwardedScore
    const maxScore = this.calculateMaxScore(examQuestions)
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0

    const updatedSubmission = await this.mockApiService.update('submissions', submissionId, {
      score,
      maxScore,
      percentage,
      status: 'graded',
      feedback: feedback ?? '',
    })

    return {
      ...updatedSubmission,
      exam: submission.exam,
    }
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
    const hasOpenEnded = exam.questions.some(
      (question) => question.type === 'OPEN_ENDED',
    )
    const submission = new Submission({
      id: crypto.randomUUID(),
      examId,
      studentId,
      answers,
      score,
      maxScore,
      percentage,
      submittedAt: new Date().toISOString(),
      status: hasOpenEnded ? 'partial' : 'graded',
    })

    await this.mockApiService.create('submissions', submission)

    const resultsPublished = Boolean(exam.resultsPublished)

    return {
      ...submission,
      exam: {
        ...exam,
        resultsPublished,
      },
      resultsPublished,
      ...(resultsPublished
        ? {}
        : {
            score: null,
            maxScore: null,
            percentage: null,
            feedback: null,
          }),
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
