import Exam from '../models/Exam'

export const mockExams = [
  new Exam({
    id: 'exam-math-1',
    title: 'Basic Math Quiz',
    description: 'A short quiz covering arithmetic basics.',
    teacherId: 'user-teacher-1',
    durationMinutes: 30,
    questionIds: ['question-math-1', 'question-math-2'],
    status: 'published',
    availableFrom: '2026-05-01T08:00:00.000Z',
    availableUntil: '2026-06-01T20:00:00.000Z',
  }),
  new Exam({
    id: 'exam-science-1',
    title: 'Science Checkpoint',
    description: 'A sample exam for introductory science topics.',
    teacherId: 'user-teacher-1',
    durationMinutes: 25,
    questionIds: ['question-science-1'],
    status: 'published',
    availableFrom: '2026-05-10T08:00:00.000Z',
    availableUntil: '2026-06-10T20:00:00.000Z',
  }),
  new Exam({
    id: 'exam-english-1',
    title: 'English Practice',
    description: 'A draft exam for spelling and language practice.',
    teacherId: 'user-teacher-1',
    durationMinutes: 20,
    questionIds: ['question-english-1'],
    status: 'draft',
    availableFrom: null,
    availableUntil: null,
  }),
]
