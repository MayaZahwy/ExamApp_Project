import { useState } from 'react'

const emptyOption = () => ({
  id: crypto.randomUUID(),
  text: '',
})

const emptyQuestion = () => {
  const options = [emptyOption(), emptyOption()]

  return {
    id: '',
    text: '',
    points: 10,
    options,
    correctOptionId: options[0].id,
  }
}

function ExamForm({ exam, isSubmitting, onCancel, onSubmit, submitLabel }) {
  const [formData, setFormData] = useState(() => ({
    title: exam?.title ?? '',
    description: exam?.description ?? '',
    durationMinutes: exam?.durationMinutes ?? 30,
    questions: exam?.questions?.length ? exam.questions : [emptyQuestion()],
  }))

  function updateField(name, value) {
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  function updateQuestion(questionIndex, updates) {
    setFormData((currentData) => ({
      ...currentData,
      questions: currentData.questions.map((question, index) =>
        index === questionIndex ? { ...question, ...updates } : question,
      ),
    }))
  }

  function updateOption(questionIndex, optionIndex, value) {
    setFormData((currentData) => ({
      ...currentData,
      questions: currentData.questions.map((question, currentQuestionIndex) => {
        if (currentQuestionIndex !== questionIndex) {
          return question
        }

        return {
          ...question,
          options: question.options.map((option, currentOptionIndex) =>
            currentOptionIndex === optionIndex
              ? { ...option, text: value }
              : option,
          ),
        }
      }),
    }))
  }

  function addQuestion() {
    setFormData((currentData) => ({
      ...currentData,
      questions: [...currentData.questions, emptyQuestion()],
    }))
  }

  function removeQuestion(questionIndex) {
    setFormData((currentData) => ({
      ...currentData,
      questions: currentData.questions.filter((_, index) => index !== questionIndex),
    }))
  }

  function addOption(questionIndex) {
    setFormData((currentData) => ({
      ...currentData,
      questions: currentData.questions.map((question, index) => {
        if (index !== questionIndex) {
          return question
        }

        return {
          ...question,
          options: [...question.options, emptyOption()],
        }
      }),
    }))
  }

  function removeOption(questionIndex, optionIndex) {
    setFormData((currentData) => ({
      ...currentData,
      questions: currentData.questions.map((question, index) => {
        if (index !== questionIndex || question.options.length <= 2) {
          return question
        }

        const nextOptions = question.options.filter(
          (_, currentOptionIndex) => currentOptionIndex !== optionIndex,
        )
        const nextCorrectOptionId = nextOptions.some(
          (option) => option.id === question.correctOptionId,
        )
          ? question.correctOptionId
          : nextOptions[0].id

        return {
          ...question,
          options: nextOptions,
          correctOptionId: nextCorrectOptionId,
        }
      }),
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(formData)
  }

  return (
    <form className="exam-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Exam title
          <input
            name="title"
            onChange={(event) => updateField('title', event.target.value)}
            required
            type="text"
            value={formData.title}
          />
        </label>

        <label>
          Duration minutes
          <input
            min="1"
            name="durationMinutes"
            onChange={(event) =>
              updateField('durationMinutes', event.target.value)
            }
            required
            type="number"
            value={formData.durationMinutes}
          />
        </label>
      </div>

      <label>
        Description
        <textarea
          name="description"
          onChange={(event) => updateField('description', event.target.value)}
          rows="3"
          value={formData.description}
        />
      </label>

      <section className="question-list">
        <div className="section-heading">
          <h2>Questions</h2>
          <button type="button" onClick={addQuestion}>
            Add question
          </button>
        </div>

        {formData.questions.map((question, questionIndex) => (
          <article className="question-editor" key={question.id || questionIndex}>
            <div className="question-header">
              <h3>Question {questionIndex + 1}</h3>
              {formData.questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                >
                  Remove
                </button>
              )}
            </div>

            <label>
              Question text
              <input
                onChange={(event) =>
                  updateQuestion(questionIndex, { text: event.target.value })
                }
                required
                type="text"
                value={question.text}
              />
            </label>

            <label>
              Points
              <input
                min="1"
                onChange={(event) =>
                  updateQuestion(questionIndex, { points: event.target.value })
                }
                required
                type="number"
                value={question.points}
              />
            </label>

            <div className="option-list">
              {question.options.map((option, optionIndex) => (
                <div className="option-row" key={option.id}>
                  <input
                    checked={question.correctOptionId === option.id}
                    name={`correct-${questionIndex}`}
                    onChange={() =>
                      updateQuestion(questionIndex, {
                        correctOptionId: option.id,
                      })
                    }
                    type="radio"
                  />
                  <label>
                    Answer {optionIndex + 1}
                    <input
                      onChange={(event) =>
                        updateOption(questionIndex, optionIndex, event.target.value)
                      }
                      required
                      type="text"
                      value={option.text}
                    />
                  </label>
                  {question.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(questionIndex, optionIndex)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button type="button" onClick={() => addOption(questionIndex)}>
              Add answer
            </button>
          </article>
        ))}
      </section>

      <div className="form-actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default ExamForm
