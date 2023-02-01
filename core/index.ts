declare const window: any
window.__IS_SINGLE_SPA__ = true

export { registerApplication } from './app/registerApplication'
export { start } from './app/start'
import { overwriteEventsAndHistory } from './utils/overwriteEventsAndHistory'

overwriteEventsAndHistory()


