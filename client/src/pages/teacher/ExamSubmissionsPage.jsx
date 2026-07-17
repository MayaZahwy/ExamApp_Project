import { useEffect, useState } from 'react'
import { examService, notifyService, submissionService } from '../../services'

function ExamSubmissionsPage({ currentUser, onNavigate, params }) {
  const [exam, setExam] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [isReviewLoading, setIsReviewLoading] = useState(false)
  const [isSavingGrade, setIsSavingGrade] = useState(false)
  const [isPublishingResults, setIsPublishingResults] = useState(false)
  const [questionGrades, setQuestionGrades] = useState({})
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [nextExam, nextSubmissions] = await Promise.all([
          examService.getExamForTeacher(params.id, currentUser.id),
          submissionService.getExamSubmissions(params.id, currentUser.id),
        ])
        setExam(nextExam)
        setSubmissions(nextSubmissions)
        setErrorMessage('')
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load submissions.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [currentUser.id, params.id])

  async function refreshSubmissions() {
    const nextSubmissions = await submissionService.getExamSubmissions(
      params.id,
      currentUser.id,
    )
    setSubmissions(nextSubmissions)
  }

  async function handlePublishResults() {
    if (!exam || exam.resultsPublished) {
      return
    }

    const confirmed = window.confirm(
      'Publish results for this exam? Students will be able to see their grades and feedback.',
    )

    if (!confirmed) {
      return
    }

    setIsPublishingResults(true)
    try {
      const updatedExam = await examService.publishResults(exam.id, currentUser.id)
      setExam(updatedExam)
      await refreshSubmissions()
      notifyService.success('Results published. Students can now see their grades.')
    } catch (error) {
      notifyService.error(error.message)
    } finally {
      setIsPublishingResults(false)
    }
  }

  async function handleReview(submissionId) {
    setSelectedSubmissionId(submissionId)
    setIsReviewLoading(true)

    try {
      const submission = await submissionService.getSubmissionById(submissionId)
      setSelectedSubmission(submission)

      const openEndedQuestions =
        submission?.exam?.questions?.filter(
          (question) => question.type === 'OPEN_ENDED',
        ) ?? []
      const initialGrades = {}
      openEndedQuestions.forEach((question) => {
        initialGrades[question.id] = 0
      })

      setQuestionGrades(initialGrades)
      setFeedback(submission?.feedback ?? '')
    } catch (error) {
      notifyService.error(error.message)
    } finally {
      setIsReviewLoading(false)
    }
  }

  async function handleGradeSubmission(event) {
    event.preventDefault()
    if (!selectedSubmission) {
      return
    }

    const gradesPayload = Object.entries(questionGrades).map(([questionId, pointsAwarded]) => ({
      questionId,
      pointsAwarded: Number(pointsAwarded) || 0,
    }))

    setIsSavingGrade(true)
    try {
      await submissionService.gradeSubmission(
        selectedSubmission.id,
        gradesPayload,
        feedback,
      )
      await refreshSubmissions()
      notifyService.success(
        exam?.resultsPublished
          ? 'Submission graded successfully.'
          : 'Submission graded. Publish results when you are ready for students to see grades.',
      )
    } catch (error) {
      notifyService.error(error.message)
    } finally {
      setIsSavingGrade(false)
    }
  }

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
          <h1>{errorMessage ? 'Failed to load submissions' : 'Exam not found'}</h1>
          {errorMessage && <p>{errorMessage}</p>}
          <button type="button" onClick={() => onNavigate('/teacher/exams')}>
            Back to exams
          </button>
        </section>
      </main>
    )
  }

  const openEndedQuestions =
    selectedSubmission?.exam?.questions?.filter(
      (question) => question.type === 'OPEN_ENDED',
    ) ?? []
  const resultsPublished = Boolean(exam.resultsPublished)

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
        <div className="section-heading">
          <div>
            <h2>Results visibility</h2>
            <p>
              {resultsPublished
                ? 'Results are published. Students can see grades and feedback.'
                : 'Results are hidden. Grade submissions first, then publish when ready.'}
            </p>
          </div>
          {resultsPublished ? (
            <span className="status-badge status-graded">Published</span>
          ) : (
            <button
              disabled={isPublishingResults || exam.status === 'draft'}
              onClick={handlePublishResults}
              type="button"
            >
              {isPublishingResults ? 'Publishing...' : 'Publish results'}
            </button>
          )}
        </div>
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
                  <button
                    type="button"
                    onClick={() => handleReview(submission.id)}
                  >
                    Review
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedSubmissionId && (
        <section className="content-panel">
          {isReviewLoading ? (
            <p>Loading submission details...</p>
          ) : !selectedSubmission ? (
            <p>Submission not found.</p>
          ) : openEndedQuestions.length === 0 ? (
            <p>This submission has no open-ended answers to grade.</p>
          ) : (
            <form className="manual-grading-form" onSubmit={handleGradeSubmission}>
              <h2>Manual grading</h2>
              {openEndedQuestions.map((question, index) => {
                const answer = selectedSubmission.answers?.find(
                  (currentAnswer) => currentAnswer.questionId === question.id,
                )

                return (
                  <article
                    className="take-question grading-question"
                    key={question.id}
                  >
                    <h3 className="grading-question-title">
                      {index + 1}. {question.text}
                    </h3>
                    <div className="grading-answer">
                      <span>Student answer</span>
                      <p>{answer?.text || 'No answer provided.'}</p>
                    </div>
                    <label className="grading-field">
                      <span>Points awarded (maximum {question.points})</span>
                      <input
                        max={question.points}
                        min="0"
                        onChange={(event) =>
                          setQuestionGrades((currentGrades) => ({
                            ...currentGrades,
                            [question.id]: event.target.value,
                          }))
                        }
                        type="number"
                        value={questionGrades[question.id] ?? 0}
                      />
                    </label>
                  </article>
                )
              })}

              <label className="grading-field grading-feedback">
                <span>Overall feedback</span>
                <textarea
                  onChange={(event) => setFeedback(event.target.value)}
                  placeholder="Write feedback for the student..."
                  rows="4"
                  value={feedback}
                />
              </label>

              <div className="form-actions">
                <button disabled={isSavingGrade} type="submit">
                  {isSavingGrade ? 'Saving...' : 'Save grade'}
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </main>
  )
}

export default ExamSubmissionsPage
