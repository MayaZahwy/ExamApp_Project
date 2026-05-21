import Submission from '../models/Submission'

export const mockSubmissions = [
  new Submission({
    id: 'submission-math-1',
    examId: 'exam-math-1',
    studentId: 'user-student-1',
    answers: [
      { questionId: 'question-math-1', selectedOptionId: 'b' },
      { questionId: 'question-math-2', selectedOptionId: 'c' },
    ],
    score: 20,
    submittedAt: '2026-05-15T13:30:00.000Z',
    status: 'graded',
  }),
]
