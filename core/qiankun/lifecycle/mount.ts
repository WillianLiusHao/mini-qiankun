import { sandboxRestart } from "../sandbox/proxySandbox"
import { Application } from "../types"

export const mountApp = async(app: Application, opts: any) => {
  console.log(`%c↓↓↓↓↓↓↓↓↓↓ ${app.name} mountApp start ↓↓↓↓↓↓↓↓↓↓`, 'color: red')
  // console.log(`主应用参数${opts}`)

  // 重启沙箱
  sandboxRestart(app)
  // 挂载应用
  app.mount && app.mount(app)
}
