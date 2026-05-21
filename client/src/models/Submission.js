class Submission {
  constructor({
    id,
    examId,
    studentId,
    answers,
    score,
    submittedAt,
    status,
  }) {
    this.id = id
    this.examId = examId
    this.studentId = studentId
    this.answers = answers
    this.score = score
    this.submittedAt = submittedAt
    this.status = status
  }
}

export default Submission
