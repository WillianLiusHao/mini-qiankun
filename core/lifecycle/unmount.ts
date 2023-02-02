import { AppStatus } from "../app"
import { Application } from "../types"
import { triggerHook } from "../utils/application"


export const unmountApp = async(app: Application) => {
  console.log('%c↓↓↓↓↓↓↓↓↓↓ beforeUmountApp start ↓↓↓↓↓↓↓↓↓↓', 'color: red')

  triggerHook(app, 'beforeUmount', AppStatus.BEFORE_UNMOUNT)
  console.log(`%ctriggerHook:beforeUmount => ${app.status}`, 'color: blue')

  app.sandbox.inActive() // 沙箱失活
  console.log(app.sandbox)
  
  app.unmount && app.unmount(app)
  triggerHook(app, 'unmounted', AppStatus.UNMOUNTED)
  console.log(`%ctriggerHook:unmounted => ${app.status}`, 'color: blue')

  console.log('%c↑↑↑↑↑↑↑↑↑↑↑↑ beforeUmountApp end ↑↑↑↑↑↑↑↑↑↑↑↑', 'color: red')
}
