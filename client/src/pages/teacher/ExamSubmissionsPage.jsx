import { useEffect, useState } from 'react'
import { examService, submissionService } from '../../services'

function ExamSubmissionsPage({ currentUser, onNavigate, params }) {
  const [exam, setExam] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [nextExam, nextSubmissions] = await Promise.all([
          examService.getExamForTeacher(params.id, currentUser.id),
          submissionService.getExamSubmissions(params.id, currentUser.id),
        ])
        setExam(nextExam)
        setSubmissions(nextSubmissions)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [currentUser.id, params.id])

  function formatDate(dateValue) {
    if (!dateValue) {
      return 'No date'
    }

    return new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateValue))
  }

  if (isLoading) {
    return (
      <main className="page-shell">
        <p>Loading submissions...</p>
      </main>
    )
  }

  if (!exam) {
    return (
      <main className="page-shell">
        <section className="content-panel">
          <h1>Exam not found</h1>
          <button type="button" onClick={() => onNavigate('/teacher/exams')}>
            Back to exams
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Teacher</p>
          <h1>Exam Submissions</h1>
          <p>{exam.title}</p>
        </div>
        <button type="button" onClick={() => onNavigate('/teacher/exams')}>
          Back to exams
        </button>
      </section>

      <section className="content-panel">
        {submissions.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          <div className="results-list">
            {submissions.map((submission) => (
              <article className="result-row" key={submission.id}>
                <div>
                  <h2>{submission.studentName || submission.studentId}</h2>
                  <p>Submitted: {formatDate(submission.submittedAt)}</p>
                  <span className={`status-badge status-${submission.status}`}>
                    {submission.status}
                  </span>
                </div>
                <div className="result-score">
                  <strong>{submission.percentage ?? 0}%</strong>
                  <span>
                    {submission.score ?? 0} / {submission.maxScore ?? 0}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default ExamSubmissionsPage
