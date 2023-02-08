import { Application } from "../types";
import { AppStatus } from "../app"

export const triggerHook = <K extends keyof Application>(app: Application, hook: K, appState: AppStatus) => {
  if(typeof app[hook] === 'function') {
    app[hook](app)
  }
  app.status = appState
}
