import { useEffect, useState } from 'react'
import { submissionService } from '../../services'

function MyResultsPage({ currentUser }) {
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    submissionService
      .getStudentResults(currentUser.id)
      .then((nextResults) => {
        setResults(nextResults)
        setErrorMessage('')
      })
      .catch((error) => {
        setErrorMessage(error.message || 'Failed to load results.')
      })
      .finally(() => setIsLoading(false))
  }, [currentUser.id])

  function formatDate(dateValue) {
    if (!dateValue) {
      return 'No date'
    }

    return new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateValue))
  }

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Student</p>
          <h1>My Results</h1>
          <p>Review your submitted exams and grades.</p>
        </div>
      </section>

      <section className="content-panel">
        {isLoading ? (
          <p>Loading results...</p>
        ) : errorMessage ? (
          <p>{errorMessage}</p>
        ) : results.length === 0 ? (
          <p>No submitted exams yet.</p>
        ) : (
          <div className="results-list">
            {results.map((result) => {
              const resultsPublished = Boolean(result.resultsPublished)

              return (
                <article className="result-row" key={result.id}>
                  <div>
                    <h2>{result.exam?.title ?? 'Unknown exam'}</h2>
                    <p>Submitted: {formatDate(result.submittedAt)}</p>
                    {resultsPublished ? (
                      <p>
                        Feedback:{' '}
                        {result.feedback && result.feedback.trim().length > 0
                          ? result.feedback
                          : 'No lecturer feedback yet.'}
                      </p>
                    ) : (
                      <p>Your grade is not available yet. Waiting for the lecturer to publish results.</p>
                    )}
                  </div>

                  <div className="result-score">
                    {resultsPublished ? (
                      <>
                        <strong>{result.percentage}%</strong>
                        <span>
                          {result.score} / {result.maxScore}
                        </span>
                      </>
                    ) : (
                      <>
                        <strong>—</strong>
                        <span>Pending publication</span>
                      </>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

export default MyResultsPage
