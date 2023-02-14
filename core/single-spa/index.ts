import { type Application, Register } from "./types"

enum AppStatus {
  BEFORE_LOAD, // 待加载
  LOADED, // 已加载
  BEFORE_BOOTSTRAP, // 待初始化
  BOOTSTRAPED,  // 初始化完毕
  BEFORE_MOUNT, // 待挂载
  MOUNTED, // 已挂载
  BEFORE_UNMOUNT, // 卸载前
  UNMOUNTED // 卸载
}

const apps: Array<Application> = []

export const registerApplication = (appConfog: Register) => {
  apps.push(Object.assign({}, appConfog, { status: AppStatus.BEFORE_LOAD }))
  console.log('注册子应用', appConfog)
}

// 框架启动状态
export const start = async () => {
  await reload()
}

// 路由切换，重新加载
const reload = async () => {
  const { toLoadApp, toMountApp, toUnMountApp } = getAppChanges()
  
  // 卸载该卸载的(上次的应用)
  // await Promise.all(toUnMountApp.map(unmountApp))
  await toUnMountApp.map(unmountApp)

  // 框架未启动时 加载应用
  // await Promise.all( toLoadApp.map(loadApp))
  await toLoadApp.map(loadApp)

  // 挂载
  // 1.已加载 => 初始化+首次挂载
  // 2.卸载的 => 重挂载
  // await Promise.all( toMountApp.map(bootStrapAndMountApp))
  await toMountApp.map(bootStrapAndMountApp)
}

async function loadApp<T extends Application>(app: T) {
  // 加载 app（这一步，可以让用户拓展方法，qiankun正是如此）
  const res = await app.app()
  // 将子应用导出的生命周期函数拓展到 app 对象上
  app.bootstrap = res.bootstrap
  // app.mount = flattenFnArray(res.bootstrap)
  app.mount = res.mount
  app.unmount = res.unmount
  app.status = AppStatus.LOADED
  
  if(showBeActive(app)) {
    reload()
  }
  return app
}

const bootStrapAndMountApp = async (app: Application) => {
  // 初始化
  app.status = AppStatus.BEFORE_BOOTSTRAP
  if(app.bootstrap) {
    app.bootstrap.forEach(fn => {
      fn(app.customProps)
    });
  }
  app.status = AppStatus.BOOTSTRAPED

  // 挂载
  app.status = AppStatus.BEFORE_MOUNT
  if(app.mount) {
    app.mount.forEach(fn => {
      fn(app.customProps)
    });
  }
  app.status = AppStatus.MOUNTED
}

const unmountApp = async (app: Application) => {
  // 卸载
  app.status = AppStatus.BEFORE_UNMOUNT
  if(app.unmount) {
    app.unmount.forEach(fn => {
      fn(app.customProps)
    });
  }
  app.status = AppStatus.UNMOUNTED
  return app
}

// 根据应用状态匹配接下来应当激活的子应用
const showBeActive = (app: Application) => {
  return typeof app.activeWhen === 'function' && app.activeWhen()
}

// 将应用类型分为3类
function getAppChanges() {
  let toUnMountApp: Application[] = [],
  toLoadApp: Application[] = [],
  toMountApp: Application[] = []

  apps.forEach((app: Application) => {
    switch (app.status) {
      // 路由不匹配 & 状态为挂载 => 即将卸载
      case AppStatus.MOUNTED:
        if(!showBeActive(app)) {
          toUnMountApp.push(app)
        }
        break
      // 路由匹配 & 状态为加载前 => 即将加载
      case AppStatus.BEFORE_LOAD:
        if(showBeActive(app)) {
          toLoadApp.push(app)
        }
        break
      // 路由匹配 & 已经加载完毕或卸载 => 即将加载
      case AppStatus.LOADED:
      case AppStatus.UNMOUNTED:
        if(showBeActive(app)) {
          toMountApp.push(app)
        }
      break
    }
  })
  return {
    toUnMountApp, toLoadApp, toMountApp
  }
}

// 改写浏览器的前进后退等事件，主要是在每次路由变更时重新 加载应用
const originalPushState = window.history.pushState
const originalReplaceState = window.history.replaceState
const overwriteEventsAndHistory = () => {
  window.addEventListener('popstate', () => {
    console.log('popstate')
    reload()
  })
  window.history.pushState = function(...param) {
    originalPushState.call(this, ...param)
    console.log('pushState')
    reload()
  }
  window.history.replaceState = function(...param) {
    originalReplaceState.call(window, ...param)
    console.log('replaceState')
    reload()
  }
}
overwriteEventsAndHistory()

export const getMountedApps = () => {
  return apps.filter((app: Application) => app.status === AppStatus.MOUNTED)
}
