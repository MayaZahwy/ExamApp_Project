function NavigationMenu({ currentUser, onLogout, onNavigate }) {
  const guestLinks = [
    { label: 'Login', path: '/login' },
    { label: 'Register', path: '/register' },
  ]

  const teacherLinks = [
    { label: 'Teacher Dashboard', path: '/teacher' },
    { label: 'My Exams', path: '/teacher/exams' },
    { label: 'Create Exam', path: '/teacher/create-exam' },
  ]

  const studentLinks = [
    { label: 'Student Dashboard', path: '/student' },
    { label: 'Available Exams', path: '/student/exams' },
    { label: 'My Results', path: '/student/results' },
  ]

  const links = currentUser
    ? currentUser.role === 'teacher'
      ? teacherLinks
      : studentLinks
    : guestLinks

  return (
    <nav className="navigation-menu">
      <button
        className="brand-button"
        type="button"
        onClick={() => onNavigate(currentUser ? `/${currentUser.role}` : '/login')}
      >
        Exam Management
      </button>

      <div className="navigation-actions">
        {currentUser && <span className="user-label">{currentUser.fullName}</span>}

        {links.map((link) => (
          <button
            key={link.path}
            type="button"
            onClick={() => onNavigate(link.path)}
          >
            {link.label}
          </button>
        ))}

        {currentUser && (
          <button type="button" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  )
}

export default NavigationMenu
