import { AppStatus } from "../app"
import { Application } from "../types"
import { triggerHook } from "../utils/application"

export const mountApp = async(app: Application) => {
  console.log('%c↓↓↓↓↓↓↓↓↓↓ mountApp start ↓↓↓↓↓↓↓↓↓↓', 'color: red')

  triggerHook(app, 'beforeMount', AppStatus.BEFORE_MOUNT)
  console.log(`%ctriggerHook:beforeMount => ${app.status}`, 'color: blue')

  app.sandbox.proxyWindow = app.sandbox.snapShot
  app.mount && app.mount(app)
  triggerHook(app, 'mounted', AppStatus.MOUNTED)

  console.log(`%ctriggerHook:mounted => ${app.status}`, 'color: blue')

  console.log('%c↑↑↑↑↑↑↑↑↑↑↑↑ mountApp end ↑↑↑↑↑↑↑↑↑↑↑↑', 'color: red')
}
