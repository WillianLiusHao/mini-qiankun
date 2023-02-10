import { appMaps } from './registerMicroApps'
import { FrameworkConfiguration } from '../types'
import { originalProxy } from '../utils/originalEnv'
import { doPrefetchStrategy } from '../prefetch'
import { start as startSingleSpa } from '../../single-spa'

declare const window: any

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
    // 执行预加载策略，参数分别为微应用列表、预加载策略、{ fetch、getPublicPath、getTemplate }
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
  // await loadApps()

  started = true;
  // frameworkStartedDefer.resolve();
}
