import { useState } from 'react'
import ExamForm from '../../components/ExamForm'
import { examService, notifyService } from '../../services'

function CreateExamPage({ currentUser, onNavigate }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(examData) {
    setIsSubmitting(true)

    try {
      await examService.createExam(currentUser.id, examData)
      notifyService.success('Exam created successfully.')
      onNavigate('/teacher/exams')
    } catch (error) {
      notifyService.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Teacher</p>
          <h1>Create Exam</h1>
          <p>Add exam details, questions, answers, and correct answers.</p>
        </div>
      </section>

      <section className="content-panel">
        <ExamForm
          isSubmitting={isSubmitting}
          onCancel={() => onNavigate('/teacher/exams')}
          onSubmit={handleSubmit}
          submitLabel="Create exam"
        />
      </section>
    </main>
  )
}

export default CreateExamPage
