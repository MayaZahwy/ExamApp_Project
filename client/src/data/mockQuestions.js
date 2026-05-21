import Question from '../models/Question'

export const mockQuestions = [
  new Question({
    id: 'question-math-1',
    examId: 'exam-math-1',
    text: 'What is 8 + 7?',
    options: [
      { id: 'a', text: '13' },
      { id: 'b', text: '15' },
      { id: 'c', text: '17' },
      { id: 'd', text: '18' },
    ],
    correctOptionId: 'b',
    points: 10,
  }),
  new Question({
    id: 'question-math-2',
    examId: 'exam-math-1',
    text: 'What is 6 x 4?',
    options: [
      { id: 'a', text: '18' },
      { id: 'b', text: '20' },
      { id: 'c', text: '24' },
      { id: 'd', text: '28' },
    ],
    correctOptionId: 'c',
    points: 10,
  }),
  new Question({
    id: 'question-science-1',
    examId: 'exam-science-1',
    text: 'Which planet is known as the Red Planet?',
    options: [
      { id: 'a', text: 'Venus' },
      { id: 'b', text: 'Mars' },
      { id: 'c', text: 'Jupiter' },
      { id: 'd', text: 'Saturn' },
    ],
    correctOptionId: 'b',
    points: 10,
  }),
  new Question({
    id: 'question-english-1',
    examId: 'exam-english-1',
    text: 'Choose the correctly spelled word.',
    options: [
      { id: 'a', text: 'Recieve' },
      { id: 'b', text: 'Receive' },
      { id: 'c', text: 'Receeve' },
      { id: 'd', text: 'Receve' },
    ],
    correctOptionId: 'b',
    points: 10,
  }),
]
