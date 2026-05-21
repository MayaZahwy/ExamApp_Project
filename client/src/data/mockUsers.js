import User from '../models/User'

export const mockUsers = [
  new User({
    id: 'user-teacher-1',
    fullName: 'Dana Cohen',
    email: 'teacher@example.com',
    password: 'teacher123',
    role: 'teacher',
  }),
  new User({
    id: 'user-student-1',
    fullName: 'Noam Levi',
    email: 'student@example.com',
    password: 'student123',
    role: 'student',
  }),
]
