import { loadApps } from '../app'
import { FrameworkConfiguration } from '../types'
import { originalProxy } from '../utils/originalEnv'

declare const window: any

export let frameworkConfiguration: FrameworkConfiguration

/**
 * 启动框架
 * @param opts 用户配置
 * 
 * * 完成了以下几件事：
 *  1、修改全局变量
 *  2、完善框架启动参数
 *  3、预加载
 *  4、沙箱配置
 *  5、合并沙箱传递出来的 生命周期方法、用户传递的生命周期方法、框架内置的生命周期方法，将这些生命周期方法统一整理，
 *     导出一个生命周期对象，供 single-spa 的 registerApplication 方法使用，这个对象就相当于使用 single-spa 时
 *     你的微应用导出的那些生命周期方法，只不过 qiankun额外填了一些生命周期方法，做了一些事情
 *  6、给微应用注册通信方法并返回通信方法，然后会将通信方法通过 props 注入到微应用
 */
export const start = async (opts: FrameworkConfiguration) => {
  window.__POWERED_BY_QIANKUN__ = true


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
