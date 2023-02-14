import { Application } from '../types'
import { registerApplication } from '../../single-spa'
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
        const { bootstrap, mount, unmount } = await loadApp(app)
        console.log( bootstrap, mount, unmount)
        return {
          bootstrap: [async () => {console.log('beforeBootstrap')}, ...bootstrap, async () => {console.log('afterBootstrap')}],
          mount: [...mount],
          unmount: [...unmount]
        }
      },
      activeWhen: app.activeRule
    })
  })
}
