import { useEffect, useState } from 'react'
import './App.css'
import NavigationMenu from './components/NavigationMenu'
import { routeService } from './routes'
import { authService, notifyService } from './services'

function App() {
  const [currentUser, setCurrentUser] = useState(() =>
    authService.getCurrentUser(),
  )
  const [route, setRoute] = useState(() => routeService.getRouteFromHash())
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    async function bootstrapAuth() {
      const user = await authService.restoreSession()

      if (user) {
        setCurrentUser(user)
      }
    }

    bootstrapAuth()
  }, [])

  useEffect(() => {
    function handleHashChange() {
      setRoute(routeService.getRouteFromHash())
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

  useEffect(() => {
    const redirectPath = routeService.getRedirectPath(route, currentUser)

    if (redirectPath && redirectPath !== route) {
      navigate(redirectPath)
    }
  }, [currentUser, route])

  function navigate(path) {
    routeService.navigate(path)
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
    const resolvedRoute = routeService.resolve(route, currentUser)

    if (!resolvedRoute || resolvedRoute.redirectPath) {
      return null
    }

    const { route: routeConfig, params } = resolvedRoute
    const PageComponent = routeConfig.Component

    return (
      <PageComponent
        currentUser={currentUser}
        onLogin={handleLogin}
        onNavigate={navigate}
        onRegister={handleRegister}
        params={params}
      />
    )
  }

  return (
    <div className="app-shell">
      <NavigationMenu
        currentUser={currentUser}
        currentRoute={route}
        onLogout={handleLogout}
        onNavigate={navigate}
      />

      {notification && (
        <div
          className={`notification notification-${notification.type}`}
          role={notification.type === 'error' ? 'alert' : 'status'}
        >
          {notification.message}
        </div>
      )}

      {renderPage()}
    </div>
  )
}

export default App
