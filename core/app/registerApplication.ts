import { Application } from '../types'
import { AppStatus, appMaps } from '../app'

export const registerApplication = (apps: Array<Application>) => {
  apps.forEach((app: Application) => {
    // activeRule 统一转为 函数处理
    if(typeof app.activeRule === 'string') {
      const pathname = app.activeRule
      app.activeRule  = () => location.pathname === pathname
    }
    // 初始化应用数据
    app = {
      status: AppStatus.BEFORE_BOOTSTRAP,
      pageBody: '',
      scripts: [],
      styles: [],
      isFirstLoad: true,
      sandboxConfig: {
        open: true,
        css: false,
      },
      ...app,
      loadedURLs: [],
    }
    appMaps.set(app.name, app)
  })
}
