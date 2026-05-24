import { useEffect, useState } from 'react'
import { examService, notifyService } from '../../services'

function ExamStatusPage({ currentUser, onNavigate, params }) {
  const [exam, setExam] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    examService
      .getExamForTeacher(params.id, currentUser.id)
      .then(setExam)
      .finally(() => setIsLoading(false))
  }, [currentUser.id, params.id])

  async function handleStatusChange(nextStatus) {
    setIsSaving(true)

    try {
      const updatedExam = await examService.updateStatus(
        params.id,
        currentUser.id,
        nextStatus,
      )
      setExam(updatedExam)
      notifyService.success('Exam status updated.')
    } catch (error) {
      notifyService.error(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main className="page-shell">
        <p>Loading exam status...</p>
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

  const statusOptions = examService.getNextStatusOptions(exam.status)

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Teacher</p>
          <h1>Exam Status</h1>
          <p>Control whether students can see this exam.</p>
        </div>
        <button type="button" onClick={() => onNavigate('/teacher/exams')}>
          Back to exams
        </button>
      </section>

      <section className="content-panel status-panel">
        <div>
          <h2>{exam.title}</h2>
          <p>{exam.description || 'No description provided.'}</p>
        </div>

        <div>
          <span className={`status-badge status-${exam.status}`}>
            {exam.status}
          </span>
        </div>

        <div className="status-actions">
          {statusOptions.length === 0 ? (
            <p>No further status changes are available.</p>
          ) : (
            statusOptions.map((option) => (
              <button
                disabled={isSaving}
                key={option.status}
                type="button"
                onClick={() => handleStatusChange(option.status)}
              >
                {isSaving ? 'Saving...' : option.label}
              </button>
            ))
          )}
        </div>
      </section>
    </main>
  )
}

export default ExamStatusPage
