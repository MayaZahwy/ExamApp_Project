import { useEffect, useState } from 'react'
import { examService, notifyService, submissionService } from '../../services'

function TakeExamPage({ currentUser, onNavigate, params }) {
  const [exam, setExam] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    examService
      .getAvailableExamById(params.id)
      .then(setExam)
      .finally(() => setIsLoading(false))
  }, [params.id])

  function selectAnswer(questionId, optionId) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: optionId,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

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
          <h1>Exam not available</h1>
          <p>This exam may be draft, closed, or unavailable.</p>
          <button type="button" onClick={() => onNavigate('/student/exams')}>
            Back to available exams
          </button>
        </section>
      </main>
    )
  }

  if (result) {
    return (
      <main className="page-shell">
        <section className="content-panel result-panel">
          <p className="eyebrow">Result</p>
          <h1>{exam.title}</h1>
          <strong>{result.percentage}%</strong>
          <p>
            Score: {result.score} / {result.maxScore}
          </p>
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
      </section>

      <form className="content-panel exam-taking-form" onSubmit={handleSubmit}>
        {exam.questions.map((question, questionIndex) => (
          <fieldset className="take-question" key={question.id}>
            <legend>
              {questionIndex + 1}. {question.text}
            </legend>

            {question.options.map((option) => (
              <label key={option.id}>
                <input
                  checked={answers[question.id] === option.id}
                  name={question.id}
                  onChange={() => selectAnswer(question.id, option.id)}
                  type="radio"
                />
                {option.text}
              </label>
            ))}
          </fieldset>
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
