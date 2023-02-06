import { loadApps } from '../app'
import { FrameworkConfiguration } from '../types'
import { originalProxy } from '../utils/originalEnv'

export let frameworkConfiguration: FrameworkConfiguration
export const start = async (opts: FrameworkConfiguration) => {
  // 框架参数完善和默认配置
  frameworkConfiguration = {
    prefetch: true, // 默认开启
    sandboxConfig: {
      open: true,
      css: false,
      loose: false // 是否快照沙箱
    },
    singular: true,
    ...opts
  }

  const { prefetch, sandboxConfig, singular } = frameworkConfiguration

  // 预加载：第一个应用加载完毕后，会预加载其他应用
  if(prefetch) {
    // todo
  }

  // 沙箱配置
  if(sandboxConfig.open) {
    if(!originalProxy) {
      console.warn('[qiankun] Miss window.Proxy, proxySandbox will degenerate into snapshotSandbox')
      frameworkConfiguration.sandboxConfig.loose = true
      if(!singular) {
        console.warn('[qiankun] snapshotSandbox do not support unsingular mode')
      }
    }
  }

  await loadApps()
}
