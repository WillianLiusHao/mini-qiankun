import { AppStatus } from "../app"
import { Application } from "../types"
import { triggerHook } from "../utils/application"


export const mountApp = async(app: Application) => {
  console.log('%c↓↓↓↓↓↓↓↓↓↓ mountApp start ↓↓↓↓↓↓↓↓↓↓', 'color: red')

  triggerHook(app, 'beforeMount', AppStatus.BEFORE_MOUNT)
  console.log(`%ctriggerHook:beforeMount => ${app.status}`, 'color: blue')

  app.sandbox && (app.sandbox.proxyWindow = app.sandbox?.snapShot)
  
  app.mount && app.mount(app)
  triggerHook(app, 'mounted', AppStatus.MOUNTED)
  // 元素作用域隔离

  console.log(`%ctriggerHook:mounted => ${app.status}`, 'color: blue')
}
