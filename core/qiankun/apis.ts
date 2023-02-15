import { Application } from './types'
import { registerApplication } from '../single-spa'
import { loadApp } from './loader'
import { FrameworkConfiguration } from './types'
import { originalProxy } from './utils/originalEnv'
import { doPrefetchStrategy } from './prefetch'
import { start as startSingleSpa } from '../single-spa'

declare const window: any

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
        return {
          bootstrap: bootstrap,
          mount: mount,
          unmount: unmount
        }
      },
      activeWhen: app.activeRule,
      customProps: app.props // 主应用传递给子应用的数据，通讯
    })
  })
}

export let frameworkConfiguration: FrameworkConfiguration

let started = false
export const start = async (opts: FrameworkConfiguration = {}) => {
  // 1、修改全局变量
  window.__POWERED_BY_QIANKUN__ = true

  // 2、完善框架启动参数
  frameworkConfiguration = { prefetch: true, singular: true, sandbox: true, ...opts };
  const {
    prefetch,
    sandbox,
    singular,
    ...importEntryOpts
  } = frameworkConfiguration;

  // 3、预加载
  if (prefetch) {
    // 执行预加载策略，参数分别为:微应用列表、预加载策略、{ fetch、getPublicPath、getTemplate }
    doPrefetchStrategy(appMaps, prefetch, importEntryOpts);
  }

  // 4.沙箱配置
  if(sandbox.open) {
    if(!originalProxy) {
      console.warn('[qiankun] Miss window.Proxy, proxySandbox will degenerate into snapshotSandbox')
      frameworkConfiguration.sandbox.loose = true
      if(!singular) {
        console.warn('[qiankun] snapshotSandbox do not support unsingular mode')
      }
    }
  }

  // 5. 调用single-spa 的启动方法启动
  startSingleSpa();

  started = true;
  // frameworkStartedDefer.resolve();
}
