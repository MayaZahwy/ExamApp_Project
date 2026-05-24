import { useEffect, useState } from 'react'
import { examService } from '../../services'

function TeacherDashboard({ currentUser, onNavigate }) {
  const [exams, setExams] = useState([])

  useEffect(() => {
    examService.getTeacherExams(currentUser.id).then(setExams)
  }, [currentUser.id])

  const draftCount = exams.filter((exam) => exam.status === 'draft').length
  const publishedCount = exams.filter((exam) => exam.status === 'published').length

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Teacher</p>
          <h1>Teacher Dashboard</h1>
          <p>Manage your draft exams and review existing exam setup.</p>
        </div>
        <button type="button" onClick={() => onNavigate('/teacher/create-exam')}>
          Create Exam
        </button>
      </section>

      <section className="summary-grid">
        <article>
          <span>Total exams</span>
          <strong>{exams.length}</strong>
        </article>
        <article>
          <span>Drafts</span>
          <strong>{draftCount}</strong>
        </article>
        <article>
          <span>Published</span>
          <strong>{publishedCount}</strong>
        </article>
      </section>

      <section className="content-panel">
        <div className="section-heading">
          <h2>Recent exams</h2>
          <button type="button" onClick={() => onNavigate('/teacher/exams')}>
            View all
          </button>
        </div>

        {exams.length === 0 ? (
          <p>No exams yet.</p>
        ) : (
          <div className="exam-list">
            {exams.slice(0, 3).map((exam) => (
              <article className="exam-row" key={exam.id}>
                <div>
                  <h3>{exam.title}</h3>
                  <p>{exam.description || 'No description provided.'}</p>
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

export default TeacherDashboard
