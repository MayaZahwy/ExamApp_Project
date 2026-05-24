import Submission from '../models/Submission'

class SubmissionService {
  constructor(mockApiService, examService) {
    this.mockApiService = mockApiService
    this.examService = examService
  }

  async getStudentSubmissions(studentId) {
    const submissions = await this.mockApiService.getAll('submissions')

    return submissions.filter((submission) => submission.studentId === studentId)
  }

  async getStudentResults(studentId) {
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

    const answers = exam.questions.map((question) => ({
      questionId: question.id,
      selectedOptionId: selectedAnswers[question.id] ?? null,
    }))
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
