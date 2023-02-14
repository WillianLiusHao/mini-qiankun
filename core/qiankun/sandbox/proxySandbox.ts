import { Application } from "../types"
import { originalWindow } from "../utils/originalEnv"
import { documentFnRewrite, documentFnReset } from './documentFnRewrite'


export class proxySandbox {
  sandboxRunning: Boolean
  fackWindowKey: (symbol | string)[]
  proxyWindow: any
  snapShot: any
  appContainer: HTMLElement
  constructor(container: HTMLElement) {
    this.appContainer = container
    this.sandboxRunning = false
    this.fackWindowKey = []
    this.proxyWindow = new Proxy({}, {
      set: (target: any, key, value) => {
        if(this.sandboxRunning) {
          // 如果设置的键是代理对象自有的，在set前会经过get函数，所以此时的target 为代理对象
          // 反之为 window
          target[key] = value
          this.fackWindowKey.push(key)
          return true
        } else {
          console.error('沙箱没有运行， 设置无效!!!')
          return false
        }
      },
      get: (target, key) => {
        // 当代理对象有该属性时候，返回代理对象
        return target.hasOwnProperty(key) ? target[key] : originalWindow[key]
      }
    })
  }
  active() {
    this.sandboxRunning = true
    // 元素作用域隔离！！
    // 当子应用中使用 document body 等顶层选择器时，默认会选择到主应用的，应当下降到子应用上
    documentFnRewrite(this.appContainer)
  }
  inActive() {
    this.sandboxRunning = false
    // 执行一些卸载操作！！
    // 1.卸载代理属性
    this.fackWindowKey.forEach(key => {
      delete this.proxyWindow[key]
    })
    // todo: 2. 卸载监听事件

    // 3.元素隔离恢复
    documentFnReset()
  }
}

// 开启了沙箱且挂载过的应用，重启沙箱，恢复快照
export const sandboxRestart = (app: Application) => {
  if(app.sandbox) {
    app.sandbox.active()
    app.sandbox.proxyWindow = app.sandbox?.snapShot
  }
}
