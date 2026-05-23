function NavigationMenu({ currentUser, onLogout, onNavigate }) {
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
        {currentUser ? (
          <>
            <span>
              {currentUser.fullName} · {currentUser.role}
            </span>
            <button type="button" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => onNavigate('/login')}>
              Login
            </button>
            <button type="button" onClick={() => onNavigate('/register')}>
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export default NavigationMenu
