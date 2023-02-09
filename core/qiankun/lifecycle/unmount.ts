import { Application } from "../types"


export const unmountApp = async(app: Application) => {
  console.log('%c↓↓↓↓↓↓↓↓↓↓ beforeUmountApp start ↓↓↓↓↓↓↓↓↓↓', 'color: red')

  app.sandbox?.inActive() // 沙箱失活
  app.unmount && app.unmount(app)
}
