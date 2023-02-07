import { AppStatus } from "../app"
import { Application } from "../types"
import { proxySandbox } from '../sandbox/proxySandbox'
import { parseHTMLandLoadSources, addStyles, executeScripts } from '../utils/source'
import { triggerHook } from '../utils/application'
import { originalWindow } from '../utils/originalEnv'
import { deepClone } from '../utils/deepClone'
import { frameworkConfiguration } from '../app/start'

export const bootstrapApp = async (app: Application) => {
  console.log('%c↓↓↓↓↓↓↓↓↓↓ bootstrapApp start ↓↓↓↓↓↓↓↓↓↓', 'color: red')

  triggerHook(app, 'beforeBootstrap', AppStatus.BEFORE_BOOTSTRAP)
  console.log(`%ctriggerHook:beforeBootstrap => ${app.status}`, 'color: blue')


  // 1. 根据子应用的 入口url，主应用通过发送请求的方式，获取到 html 内容
  // 解析入口 html，获取 css 和 js，赋值app 的 styles/scripts 属性，去除掉css和js后，剩余的就是 pageBody
  try {
    await parseHTMLandLoadSources(app)
  } catch (error) {
    app.status = AppStatus.BOOTSTRAP_ERROR
  }
  console.log('1. parseHTMLandLoadSources处理资源', )

  // 2. 渲染 html, 赋值子应用容器内的 内容，app.container.innerHTML = app.pageBody
  console.log('2. 挂载 app.container:')
  if(typeof app.container === 'string') {
    const appContainer = document.querySelector(app.container) as HTMLElement
    appContainer.innerHTML = app.pageBody as string
    app.container = appContainer
  } else {
    (app.container as HTMLElement).innerHTML = app.pageBody as string
  }

  // 3. 沙箱代理，执行 styles 和 scripts
  console.log('3. 沙箱代理，执行style和script:')
  if(frameworkConfiguration.sandboxConfig.open) {
    app.sandbox = new proxySandbox(app)
    app.sandbox.active()
  }

  addStyles(app.styles as string[])
  executeScripts(app.scripts as string[], app)
  // 首次加载完资源后，生成沙箱快照，后续重新加载该应用的时候可复原
  if(frameworkConfiguration.sandboxConfig.open) {
    app.sandbox.snapShot = deepClone(app.sandbox?.proxyWindow) 
  }
    
  triggerHook(app, 'bootstrapped', AppStatus.BOOTSTRAPED)
  console.log(`%ctriggerHook:bootstrapped => ${app.status}`, 'color: blue')

  // 4. 获取子应用生命周期函数，挂到app 对象上'
  console.log('4. 获取子应用生命周期函数，挂到app 对象上')
  // 每个子应用 main 中要把 bootstrap/mount/unmount 等声明周期函数封装好挂载到沙箱代理对象的__SINGLE_SPA__上，供基座使用)
  const { mount, unmount } = await getMicroAppLifeFn(app)
  app.mount = mount
  app.unmount = unmount
  
}


async function getMicroAppLifeFn(app: Application) {
  let result = originalWindow.__SINGLE_SPA__
  if (frameworkConfiguration.sandboxConfig.open) {
    result = app.sandbox?.proxyWindow?.__SINGLE_SPA__
  }
   
  if (typeof result === 'object') {
    return result
  }
  // eslint-disable-next-line no-restricted-globals
  throw Error('The micro app must inject the lifecycle("bootstrap" "mount" "unmount") into window.__SINGLE_SPA__')
}

async function getMicroAppLifeFn2() {
  
}
