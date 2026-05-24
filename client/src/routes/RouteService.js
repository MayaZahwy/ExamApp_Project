class RouteService {
  constructor(routes, authService) {
    this.routes = routes
    this.authService = authService
  }

  getRouteFromHash(hash = window.location.hash) {
    return hash.replace('#', '') || '/login'
  }

  navigate(path) {
    window.location.hash = path
  }

  match(path) {
    const cleanPath = this.cleanPath(path)

    for (const route of this.routes) {
      const params = this.matchPath(route.path, cleanPath)

      if (params) {
        return { route, params }
      }
    }

    return null
  }

  getRedirectPath(path, currentUser) {
    const match = this.match(path)

    if (!match) {
      return currentUser
        ? this.authService.getRedirectPath(currentUser)
        : '/login'
    }

    const { route } = match

    if (route.access === 'guest') {
      return currentUser ? this.authService.getRedirectPath(currentUser) : null
    }

    if (!currentUser) {
      return '/login'
    }

    if (route.access !== currentUser.role) {
      return this.authService.getRedirectPath(currentUser)
    }

    return null
  }

  resolve(path, currentUser) {
    const redirectPath = this.getRedirectPath(path, currentUser)

    if (redirectPath) {
      return { redirectPath }
    }

    return this.match(path)
  }

  cleanPath(path) {
    const cleanPath = path.split('?')[0].split('#')[0]
    return cleanPath.endsWith('/') && cleanPath.length > 1
      ? cleanPath.slice(0, -1)
      : cleanPath
  }

  matchPath(routePath, currentPath) {
    const routeParts = routePath.split('/').filter(Boolean)
    const currentParts = currentPath.split('/').filter(Boolean)

    if (routeParts.length !== currentParts.length) {
      return null
    }

    return routeParts.reduce((params, routePart, index) => {
      if (params === null) {
        return null
      }

      const currentPart = currentParts[index]

      if (routePart.startsWith(':')) {
        return {
          ...params,
          [routePart.slice(1)]: currentPart,
        }
      }

      return routePart === currentPart ? params : null
    }, {})
  }
}

export default RouteService
