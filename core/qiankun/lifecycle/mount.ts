import { Application } from "../types"


export const mountApp = async(app: Application) => {
  console.log('%c↓↓↓↓↓↓↓↓↓↓ mountApp start ↓↓↓↓↓↓↓↓↓↓', 'color: red')

  app.sandbox && (app.sandbox.proxyWindow = app.sandbox?.snapShot)
  
  app.mount && app.mount(app)
  // 元素作用域隔离
}
