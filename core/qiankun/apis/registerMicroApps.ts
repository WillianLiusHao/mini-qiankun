import { Application } from '../types'
import { registerApplication } from '../../single-spa'

import { bootstrapApp, unmountApp, mountApp } from '../lifecycle'
import { loadApp } from '../loader'

export const appMaps = new Map()

export const registerMicroApps = (apps: Array<Application>, lifeCycles?: any) => {
  apps.forEach((app: Application) => {
    // activeRule 统一转为 函数处理
    if(typeof app.activeRule === 'string') {
      const pathname = app.activeRule
      app.activeRule  = () => location.pathname === pathname
    }

    // 初始化应用数据
    app = {
      pageBody: '',
      scripts: [],
      styles: [],
      ...app,
      loadedURLs: [],
    }
    appMaps.set(app.name, app)
    registerApplication({
      name: app.name,
      app: async () => {
        await loadApp(app)
        return {
          bootstrap: (opts: any) => { console.log('bootstarp', opts) },
          // mount: mergeMountFn,
          // unmount: mergeUnmountFn
          mount: (opts: any) => mountApp(app, opts),
          unmount: (opts: any) => unmountApp(app, opts)
        }
      },
      activeWhen: app.activeRule
    })
  })
}
