import { useEffect, useState } from 'react'
import { examService } from '../../services'

function TeacherExamsPage({ currentUser, onNavigate }) {
  const [exams, setExams] = useState([])

  useEffect(() => {
    examService.getTeacherExams(currentUser.id).then(setExams)
  }, [currentUser.id])

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Teacher</p>
          <h1>My Exams</h1>
          <p>View and edit exams saved in local storage.</p>
        </div>
        <button type="button" onClick={() => onNavigate('/teacher/create-exam')}>
          Create Exam
        </button>
      </section>

      <section className="content-panel">
        {exams.length === 0 ? (
          <p>No exams yet.</p>
        ) : (
          <div className="exam-list">
            {exams.map((exam) => (
              <article className="exam-row" key={exam.id}>
                <div>
                  <h2>{exam.title}</h2>
                  <p>{exam.description || 'No description provided.'}</p>
                  <span>
                    {exam.questions.length} questions - {exam.status}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(`/teacher/edit-exam/${exam.id}`)}
                >
                  Edit
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default TeacherExamsPage
