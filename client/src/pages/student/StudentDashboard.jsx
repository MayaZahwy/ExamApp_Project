import { useEffect, useState } from 'react'
import { examService, submissionService } from '../../services'

function StudentDashboard({ currentUser, onNavigate }) {
  const [availableExams, setAvailableExams] = useState([])
  const [results, setResults] = useState([])

  useEffect(() => {
    examService.getAvailableExams().then(setAvailableExams)
    submissionService.getStudentResults(currentUser.id).then(setResults)
  }, [currentUser.id])

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Student</p>
          <h1>Student Dashboard</h1>
          <p>View available published exams and your submitted results.</p>
        </div>
        <button type="button" onClick={() => onNavigate('/student/exams')}>
          Available Exams
        </button>
      </section>

      <section className="summary-grid">
        <article>
          <span>Available exams</span>
          <strong>{availableExams.length}</strong>
        </article>
        <article>
          <span>Submitted exams</span>
          <strong>{results.length}</strong>
        </article>
        <article>
          <span>Latest grade</span>
          <strong>{results[0]?.percentage ?? 0}%</strong>
        </article>
      </section>

      <section className="content-panel">
        <div className="section-heading">
          <h2>Available exams</h2>
          <button type="button" onClick={() => onNavigate('/student/exams')}>
            View all
          </button>
        </div>

        {availableExams.length === 0 ? (
          <p>No available exams.</p>
        ) : (
          <div className="exam-list">
            {availableExams.slice(0, 3).map((exam) => (
              <article className="exam-row" key={exam.id}>
                <div>
                  <h3>{exam.title}</h3>
                  <p>{exam.description || 'No description provided.'}</p>
                  <span>{exam.questions.length} questions</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(`/student/take-exam/${exam.id}`)}
                >
                  Open
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default StudentDashboard
