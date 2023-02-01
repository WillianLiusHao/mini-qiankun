import { Application } from '../types'
import { AppStatus, appMaps } from './app'

export const registerApplication = (apps: Array<Application>, lifeCycles?: any) => {
  apps.forEach((app: Application) => {
    // activeRule 统一转为 函数处理
    if(typeof app.activeRule === 'string') {
      const pathname = app.activeRule
      app.activeRule  = () => location.pathname === pathname
    }
    // 初始化应用数据
    app = {
      ...app,
      status: AppStatus.BEFORE_BOOTSTRAP,
      pageBody: '',
      loadedURLs: [], // 加载过的资源列表
      scripts: [],
      styles: [],
      isFirstLoad: true,
      sandbox: {},
    }
    // 是否开启了沙箱
    if(!app.sandboxConfig) {
      app.sandboxConfig = {
        enabled: true,
        css: false,
      }
    }
    appMaps.set(app.name, app)
  })
}
