import { useEffect, useState } from 'react'
import ExamForm from '../../components/ExamForm'
import { examService, notifyService } from '../../services'

function EditExamPage({ currentUser, onNavigate, params }) {
  const [exam, setExam] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    examService
      .getExamForTeacher(params.id, currentUser.id)
      .then((nextExam) => {
        setExam(nextExam)
        setErrorMessage('')
      })
      .catch((error) => {
        setErrorMessage(error.message || 'Failed to load exam.')
      })
      .finally(() => setIsLoading(false))
  }, [currentUser.id, params.id])

  async function handleSubmit(examData) {
    setIsSubmitting(true)

    try {
      await examService.updateExam(params.id, currentUser.id, examData)
      notifyService.success('Exam saved successfully.')
      onNavigate('/teacher/exams')
    } catch (error) {
      notifyService.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="page-shell">
        <p>Loading exam...</p>
      </main>
    )
  }

  if (!exam) {
    return (
      <main className="page-shell">
        <section className="content-panel">
          <h1>{errorMessage ? 'Failed to load exam' : 'Exam not found'}</h1>
          {errorMessage && <p>{errorMessage}</p>}
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
          <h1>Edit Exam</h1>
          <p>Update exam details, questions, answers, and correct answers.</p>
        </div>
      </section>

      <section className="content-panel">
        <ExamForm
          exam={exam}
          isSubmitting={isSubmitting}
          onCancel={() => onNavigate('/teacher/exams')}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
        />
      </section>
    </main>
  )
}

export default EditExamPage
