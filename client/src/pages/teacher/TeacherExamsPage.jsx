import { useEffect, useState } from 'react'
import { examService, notifyService } from '../../services'

function TeacherExamsPage({ currentUser, onNavigate }) {
  const [exams, setExams] = useState([])

  useEffect(() => {
    examService.getTeacherExams(currentUser.id).then(setExams)
  }, [currentUser.id])

  async function handleStatusChange(examId, nextStatus) {
    try {
      const updatedExam = await examService.updateStatus(
        examId,
        currentUser.id,
        nextStatus,
      )

      setExams((currentExams) =>
        currentExams.map((exam) =>
          exam.id === updatedExam.id ? updatedExam : exam,
        ),
      )
      notifyService.success('Exam status updated.')
    } catch (error) {
      notifyService.error(error.message)
    }
  }

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
                  <span>{exam.questions.length} questions</span>
                  <span className={`status-badge status-${exam.status}`}>
                    {exam.status}
                  </span>
                </div>
                <div className="row-actions">
                  {examService.getNextStatusOptions(exam.status).map((option) => (
                    <button
                      key={option.status}
                      type="button"
                      onClick={() => handleStatusChange(exam.id, option.status)}
                    >
                      {option.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => onNavigate(`/teacher/exam-status/${exam.id}`)}
                  >
                    Status
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate(`/teacher/edit-exam/${exam.id}`)}
                  >
                    Edit
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default TeacherExamsPage
