import { Application } from "../types"
import { originalWindow } from "../utils/originalEnv"
import { documentFnRewrite } from './documentFnRewrite'

export class proxySandbox {
  sandboxRunning: Boolean
  fackWindowKey: (symbol | string)[]
  proxyWindow: any
  snapShot: any
  constructor(app: Application) {
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
          console.log('沙箱没有运行， 设置无效!!!')
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
    // 元素作用域隔离
    documentFnRewrite()
  }
  inActive() {
    this.sandboxRunning = false
    // 执行一些卸载操作
    // 1.卸载代理属性
    this.fackWindowKey.forEach(key => {
      delete this.proxyWindow[key]
    })
    // todo: 2. 卸载监听事件
  }
}
