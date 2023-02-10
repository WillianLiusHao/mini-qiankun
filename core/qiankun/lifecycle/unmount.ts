import { Application } from "../types"


export const unmountApp = async(app: Application, opts: any) => {
  console.log(`%c↓↓↓↓↓↓↓↓↓↓ ${app.name} beforeUmountApp start ↓↓↓↓↓↓↓↓↓↓`, 'color: red')
  // console.log(`主应用参数${opts}`)

  app.sandbox?.inActive() // 沙箱失活
  app.unmount && app.unmount(app)
}
