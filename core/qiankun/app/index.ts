import { Application, FrameworkConfiguration } from "../types"
import { bootstrapApp, unmountApp, mountApp } from '../lifecycle'

// 资源 后，子应用状态变为 bootstrap，下一个状态为 mount
// mount -> unmount
// unmount -> mount 卸载的应用可再次重启

const isActive = (app: Application) => {
  return typeof app.activeRule === 'function' && app.activeRule()
}

export enum AppStatus {
  BEFORE_BOOTSTRAP, // 待注册
  BOOTSTRAPED, // 已注册
  BOOTSTRAP_ERROR, // 注册失败
  BEFORE_MOUNT, // 待挂载
  MOUNTED, // 已挂载
  MOUNT_ERROR, // 挂载失败
  BEFORE_UNMOUNT,
  UNMOUNTED // 卸载
}

export const appMaps = new Map()

export const loadApps = async () => {
  // 先卸载所有失活的
  const toUnMountApp = getAppStatus(AppStatus.MOUNTED)
  await Promise.all(toUnMountApp.map(app => unmountApp(app)))

  // 待注册的
  const toLoadApp = getAppStatus(AppStatus.BEFORE_BOOTSTRAP)
  
  await Promise.all(toLoadApp.map(app => bootstrapApp(app)))

  const toMountApp = [
    ...getAppStatus(AppStatus.BOOTSTRAPED),
    ...getAppStatus(AppStatus.UNMOUNTED),
  ]
  // 加载所有符合条件的子应用
  await toMountApp.map(app => mountApp(app))

  // console.log(`%c卸载的app:`, 'color: green')
  // console.log(toUnMountApp)
  // console.log(`%c首次启动的app:`, 'color: green')
  // console.log(toLoadApp)
  // console.log(`%c挂载的app:`, 'color: green')
  // console.log(toMountApp)
}

// 根据应用状态匹配子应用
export const getAppStatus = (status: number): Array<Application> => {
  const res: Array<Application> = []
  appMaps.forEach((app: Application) => {
    if(isActive(app) && app.status === status) {
      res.push(app)
    } else if(app.status === AppStatus.MOUNTED && status === AppStatus.MOUNTED) {
      res.push(app)
    }
  })
  return res
}

export const getCurApp = () => {
  return getAppStatus(AppStatus.BEFORE_BOOTSTRAP)
}


