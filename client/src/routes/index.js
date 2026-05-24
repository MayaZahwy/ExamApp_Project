import { authService } from '../services'
import RouteService from './RouteService'
import { routeDefinitions } from './routeDefinitions.jsx'

const routeService = new RouteService(routeDefinitions, authService)

export { RouteService, routeDefinitions, routeService }
