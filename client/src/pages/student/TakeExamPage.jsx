import { useEffect, useRef, useState } from 'react'
import { examService, notifyService, submissionService } from '../../services'

function TakeExamPage({ currentUser, onNavigate, params }) {
  const [exam, setExam] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(null)
  const hasAutoSubmittedRef = useRef(false)

  useEffect(() => {
    examService
      .getAvailableExamById(params.id)
      .then((nextExam) => {
        setExam(nextExam)
        setErrorMessage('')
      })
      .catch((error) => {
        setErrorMessage(error.message || 'Failed to load exam.')
      })
      .finally(() => setIsLoading(false))
  }, [params.id])

  function selectAnswer(questionId, optionId) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: optionId,
    }))
  }

  function isOpenEndedQuestion(question) {
    return (
      question.type === 'OPEN_ENDED' ||
      !Array.isArray(question.options) ||
      question.options.length === 0
    )
  }

  function formatTime(seconds) {
    const safeSeconds = Math.max(0, Number(seconds) || 0)
    const minutes = Math.floor(safeSeconds / 60)
    const remainingSeconds = safeSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }

  async function submitExam({ requireAllAnswers }) {
    if (!exam || isSubmitting || result) {
      return
    }

    if (requireAllAnswers) {
      const hasAnsweredAllQuestions = exam.questions.every((question) => {
        const value = answers[question.id]
        if (typeof value === 'string') {
          return value.trim().length > 0
        }
        return value !== undefined && value !== null
      })

      if (!hasAnsweredAllQuestions) {
        notifyService.error('Please answer every question before submitting.')
        return
      }
    }

    setIsSubmitting(true)

    try {
      const submission = await submissionService.submitExam(
        currentUser.id,
        exam.id,
        answers,
      )
      setResult(submission)
      notifyService.success('Exam submitted successfully.')
    } catch (error) {
      notifyService.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await submitExam({ requireAllAnswers: true })
  }

  useEffect(() => {
    if (!exam || result) {
      return
    }

    const durationSeconds = (Number(exam.durationMinutes) || 30) * 60
    setTimeLeftSeconds(durationSeconds)
    hasAutoSubmittedRef.current = false
  }, [exam, result])

  useEffect(() => {
    if (timeLeftSeconds === null || timeLeftSeconds <= 0 || isSubmitting || result) {
      return
    }

    const intervalId = window.setInterval(() => {
      setTimeLeftSeconds((currentTime) => {
        if (currentTime === null) {
          return 0
        }
        return Math.max(0, currentTime - 1)
      })
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [timeLeftSeconds, isSubmitting, result])

  useEffect(() => {
    if (timeLeftSeconds !== 0 || hasAutoSubmittedRef.current || isSubmitting || result) {
      return
    }

    hasAutoSubmittedRef.current = true
    notifyService.error('Time is up. Submitting your exam now.')
    submitExam({ requireAllAnswers: false })
  }, [timeLeftSeconds, isSubmitting, result])

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
          <h1>{errorMessage ? 'Failed to load exam' : 'Exam not available'}</h1>
          <p>
            {errorMessage ||
              'This exam may be draft, closed, or unavailable.'}
          </p>
          <button type="button" onClick={() => onNavigate('/student/exams')}>
            Back to available exams
          </button>
        </section>
      </main>
    )
  }

  if (result) {
    const resultsPublished = Boolean(result.resultsPublished)

    return (
      <main className="page-shell">
        <section className="content-panel result-panel">
          <p className="eyebrow">Submitted</p>
          <h1>{exam.title}</h1>
          {resultsPublished ? (
            <>
              <strong>{result.percentage}%</strong>
              <p>
                Score: {result.score} / {result.maxScore}
              </p>
            </>
          ) : (
            <>
              <strong>Submitted</strong>
              <p className="result-pending-note" role="status">
                Your answers were saved. Your grade will appear after the
                lecturer publishes results.
              </p>
            </>
          )}
          <button type="button" onClick={() => onNavigate('/student/exams')}>
            Back to available exams
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Student Exam</p>
          <h1>{exam.title}</h1>
          <p>{exam.description || 'No description provided.'}</p>
        </div>
        <div className="result-score">
          <strong>{formatTime(timeLeftSeconds)}</strong>
          <span>Time left</span>
        </div>
      </section>

      <form className="content-panel exam-taking-form" onSubmit={handleSubmit}>
        {exam.questions.map((question, questionIndex) => (
          <section className="take-question" key={question.id}>
            <h2 className="take-question-title">
              {questionIndex + 1}. {question.text}
            </h2>

            {isOpenEndedQuestion(question) ? (
              <label className="open-ended-answer">
                Your answer
                <textarea
                  name={question.id}
                  onChange={(event) =>
                    selectAnswer(question.id, event.target.value)
                  }
                  placeholder="Type your answer here..."
                  rows="4"
                  value={answers[question.id] ?? ''}
                />
              </label>
            ) : (
              question.options.map((option) => (
                <label key={option.id}>
                  <input
                    checked={answers[question.id] === option.id}
                    name={question.id}
                    onChange={() => selectAnswer(question.id, option.id)}
                    type="radio"
                  />
                  {option.text}
                </label>
              ))
            )}
          </section>
        ))}

        <div className="form-actions">
          <button type="button" onClick={() => onNavigate('/student/exams')}>
            Cancel
          </button>
          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Submitting...' : 'Submit exam'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default TakeExamPage
