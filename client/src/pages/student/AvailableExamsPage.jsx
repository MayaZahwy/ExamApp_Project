import { useEffect, useState } from 'react'
import { examService } from '../../services'

function AvailableExamsPage() {
  const [exams, setExams] = useState([])

  useEffect(() => {
    examService.getAvailableExams().then(setExams)
  }, [])

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Student</p>
          <h1>Available Exams</h1>
          <p>Only published exams are shown here.</p>
        </div>
      </section>

      <section className="content-panel">
        {exams.length === 0 ? (
          <p>No available exams.</p>
        ) : (
          <div className="exam-list">
            {exams.map((exam) => (
              <article className="exam-row" key={exam.id}>
                <div>
                  <h2>{exam.title}</h2>
                  <p>{exam.description || 'No description provided.'}</p>
                  <span>{exam.questions.length} questions</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default AvailableExamsPage
