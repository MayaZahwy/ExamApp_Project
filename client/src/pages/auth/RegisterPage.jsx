import { useState } from 'react'

function RegisterPage({ onRegister, onNavigate }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'student',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await onRegister(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="register-title">
        <div className="auth-header">
          <p className="eyebrow">Account Registration</p>
          <h1 id="register-title">Create account</h1>
          <p>Choose the account type you want to create.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              autoComplete="name"
              name="fullName"
              onChange={handleChange}
              required
              type="text"
              value={formData.fullName}
            />
          </label>

          <label>
            Email
            <input
              autoComplete="email"
              name="email"
              onChange={handleChange}
              required
              type="email"
              value={formData.email}
            />
          </label>

          <label>
            Password
            <input
              autoComplete="new-password"
              minLength={6}
              name="password"
              onChange={handleChange}
              required
              type="password"
              value={formData.password}
            />
          </label>

          <fieldset className="role-options">
            <legend>Role</legend>
            <label>
              <input
                checked={formData.role === 'student'}
                name="role"
                onChange={handleChange}
                type="radio"
                value="student"
              />
              Student
            </label>
            <label>
              <input
                checked={formData.role === 'teacher'}
                name="role"
                onChange={handleChange}
                type="radio"
                value="teacher"
              />
              Teacher
            </label>
          </fieldset>

          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already registered?{' '}
          <button type="button" onClick={() => onNavigate('/login')}>
            Sign in
          </button>
        </p>
      </section>
    </main>
  )
}

export default RegisterPage
