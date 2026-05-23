import { useEffect, useMemo, useState } from 'react'
import './App.css'
import NavigationMenu from './components/NavigationMenu'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import StudentDashboard from './pages/student/StudentDashboard'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import { authService, notifyService } from './services'

function getRouteFromHash() {
  return window.location.hash.replace('#', '') || '/login'
}

function App() {
  const [currentUser, setCurrentUser] = useState(() =>
    authService.getCurrentUser(),
  )
  const [route, setRoute] = useState(getRouteFromHash)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    function handleHashChange() {
      setRoute(getRouteFromHash())
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    return notifyService.subscribe((nextNotification) => {
      setNotification(nextNotification)
    })
  }, [])

  useEffect(() => {
    if (!notification) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setNotification(null)
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [notification])

  const protectedRoute = useMemo(() => {
    if (route === '/teacher' || route === '/student') {
      return route
    }

    return null
  }, [route])

  const authRoute = useMemo(() => {
    if (route === '/login' || route === '/register') {
      return route
    }

    return null
  }, [route])

  useEffect(() => {
    if (!currentUser && protectedRoute) {
      navigate('/login')
      return
    }

    if (
      currentUser &&
      (authRoute || protectedRoute !== authService.getRedirectPath(currentUser))
    ) {
      navigate(authService.getRedirectPath(currentUser))
    }
  }, [authRoute, currentUser, protectedRoute])

  function navigate(path) {
    window.location.hash = path
    setRoute(path)
  }

  async function handleLogin(credentials) {
    try {
      const user = await authService.login(credentials)
      setCurrentUser(user)
      notifyService.success('Signed in successfully.')
      navigate(authService.getRedirectPath(user))
    } catch (error) {
      notifyService.error(error.message)
    }
  }

  async function handleRegister(registrationData) {
    try {
      const user = await authService.register(registrationData)
      setCurrentUser(user)
      notifyService.success('Account created successfully.')
      navigate(authService.getRedirectPath(user))
    } catch (error) {
      notifyService.error(error.message)
    }
  }

  function handleLogout() {
    authService.logout()
    setCurrentUser(null)
    notifyService.success('Logged out successfully.')
    navigate('/login')
  }

  function renderPage() {
    if (route === '/register' && !currentUser) {
      return <RegisterPage onNavigate={navigate} onRegister={handleRegister} />
    }

    if (route === '/teacher' && currentUser?.role === 'teacher') {
      return <TeacherDashboard />
    }

    if (route === '/student' && currentUser?.role === 'student') {
      return <StudentDashboard />
    }

    return <LoginPage onLogin={handleLogin} onNavigate={navigate} />
  }

  return (
    <div className="app-shell">
      <NavigationMenu
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigate={navigate}
      />

      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      {renderPage()}
    </div>
  )
}

export default App
