class Question {
  constructor({ id, examId, type, text, options, correctOptionId, points }) {
    this.id = id
    this.examId = examId
    this.type = type || 'MULTIPLE_CHOICE'
    this.text = text
    this.options = options
    this.correctOptionId = correctOptionId
    this.points = points
  }
}

export default Question
