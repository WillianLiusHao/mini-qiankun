import { Application } from "../types"

declare const window: any

export const proxySandbox = (app: Application) => {
  const proxy = new Proxy({}, {
    set: (target: any, key, value) => {
      target[key] = value
      return true
    },
    get: (target, key) => {
      if(target.hasOwnProperty(key)) {
        return target[key]
      } else {
        return window[key]
      }
    }
  })
  app.window = proxy
  app.sandbox.proxyWindow = proxy
}
