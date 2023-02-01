import { Application } from "../types"
import { isActive } from '../utils/source'
import { bootstrapApp, mountApp, unMountApp } from '../lifecycle/lifecycle'

// registerApplication 后，子应用状态变为 bootstrap，下一个状态为 mount
// mount -> unmount
// unmount -> mount 卸载的应用可再次重启

export enum AppStatus {
  BEFORE_BOOTSTRAP, // 待注册
  BOOTSTRAP, // 已注册
  BOOTSTRAP_ERROR, // 注册失败
  BEFORE_MOUNT, // 待挂载
  MOUNT, // 已挂载
  MOUNT_ERROR, // 挂载失败
  UNMOUNT // 卸载
}

export const appMaps = new Map()

export const loadApps = async () => {
  // 先卸载所有失活的
  const toUnMountApp = getAppStatus(AppStatus.MOUNT)
  console.log(`待卸载的app:`)
  console.log(toUnMountApp)
  await Promise.all(toUnMountApp.map(app => unMountApp()))

  // 待注册的
  const toLoadApp = getAppStatus(AppStatus.BEFORE_BOOTSTRAP)
  console.log(`待启动的app:`)
  console.log(toLoadApp)
  await Promise.all(toLoadApp.map(app => bootstrapApp(app)))

  const toMountApp = [
    ...getAppStatus(AppStatus.BOOTSTRAP),
    ...getAppStatus(AppStatus.UNMOUNT),
  ]
  // 加载所有符合条件的子应用
  await toMountApp.map(app => mountApp())
}

// 根据应用状态匹配子应用
const getAppStatus = (status: number): Array<Application> => {
  const res: Array<Application> = []
  appMaps.forEach((app: Application) => {
    if(isActive(app) && app.status === status) {
      res.push(app)
    } else if(app.status === AppStatus.MOUNT && status === AppStatus.MOUNT) {
      res.push(app)
    }
  })
  return res
}
