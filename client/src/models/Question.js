class Question {
  constructor({ id, examId, text, options, correctOptionId, points }) {
    this.id = id
    this.examId = examId
    this.text = text
    this.options = options
    this.correctOptionId = correctOptionId
    this.points = points
  }
}

export default Question
