class Exam {
  constructor({
    id,
    title,
    description,
    teacherId,
    durationMinutes,
    questionIds,
    status,
    availableFrom,
    availableUntil,
  }) {
    this.id = id
    this.title = title
    this.description = description
    this.teacherId = teacherId
    this.durationMinutes = durationMinutes
    this.questionIds = questionIds
    this.status = status
    this.availableFrom = availableFrom
    this.availableUntil = availableUntil
  }
}

export default Exam
