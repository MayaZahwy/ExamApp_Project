import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import AvailableExamsPage from '../pages/student/AvailableExamsPage'
import MyResultsPage from '../pages/student/MyResultsPage'
import StudentDashboard from '../pages/student/StudentDashboard'
import TakeExamPage from '../pages/student/TakeExamPage'
import CreateExamPage from '../pages/teacher/CreateExamPage'
import EditExamPage from '../pages/teacher/EditExamPage'
import ExamSubmissionsPage from '../pages/teacher/ExamSubmissionsPage'
import ExamStatusPage from '../pages/teacher/ExamStatusPage'
import TeacherDashboard from '../pages/teacher/TeacherDashboard'
import TeacherExamsPage from '../pages/teacher/TeacherExamsPage'

export const routeDefinitions = [
  {
    path: '/login',
    access: 'guest',
    Component: LoginPage,
  },
  {
    path: '/register',
    access: 'guest',
    Component: RegisterPage,
  },
  {
    path: '/teacher',
    access: 'teacher',
    Component: TeacherDashboard,
  },
  {
    path: '/teacher/exams',
    access: 'teacher',
    Component: TeacherExamsPage,
  },
  {
    path: '/teacher/create-exam',
    access: 'teacher',
    Component: CreateExamPage,
  },
  {
    path: '/teacher/edit-exam/:id',
    access: 'teacher',
    Component: EditExamPage,
  },
  {
    path: '/teacher/exam-submissions/:id',
    access: 'teacher',
    Component: ExamSubmissionsPage,
  },
  {
    path: '/teacher/exam-status/:id',
    access: 'teacher',
    Component: ExamStatusPage,
  },
  {
    path: '/student',
    access: 'student',
    Component: StudentDashboard,
  },
  {
    path: '/student/exams',
    access: 'student',
    Component: AvailableExamsPage,
  },
  {
    path: '/student/take-exam/:id',
    access: 'student',
    Component: TakeExamPage,
  },
  {
    path: '/student/results',
    access: 'student',
    Component: MyResultsPage,
  },
]
