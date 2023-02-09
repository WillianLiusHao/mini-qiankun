import { Application } from '../types'
import { registerApplication } from '../../single-spa'

import { bootstrapApp, unmountApp, mountApp } from '../lifecycle'


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
    console.log(`----------注册应用${app.name}`)
    registerApplication({
      name: app.name,
      app: async () => {
        return {
          bootstrap: app => bootstrapApp,
          mount: app => mountApp,
          unmount: app => unmountApp
        }
      },
      activeWhen: app.activeRule
    })
  })
}
