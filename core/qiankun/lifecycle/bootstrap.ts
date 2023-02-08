import { AppStatus } from "../app"
import { Application } from "../types"
import { proxySandbox } from '../sandbox/proxySandbox'
import { parseHTMLandLoadSources, addStyles, executeScripts } from '../../import-html-entry'
import { triggerHook } from '../utils/application'
import { originalWindow } from '../utils/originalEnv'
import { deepClone } from '../utils/deepClone'
import { frameworkConfiguration } from '../app/start'


/**
 * 完成了以下几件事：
 *  1、通过 HTML Entry 的方式远程加载微应用，得到微应用的 html 模版（首屏内容）、JS 脚本执行器、静态经资源路径
 *  2、样式隔离，shadow DOM 或者 scoped css 两种方式
 *  3、渲染微应用
 *  4、运行时沙箱，JS 沙箱、样式沙箱
 *  5、合并沙箱传递出来的 生命周期方法、用户传递的生命周期方法、框架内置的生命周期方法，将这些生命周期方法统一整理，
 *     导出一个生命周期对象，供 single-spa 的 registerApplication 方法使用，这个对象就相当于使用 single-spa 时
 *     你的微应用导出的那些生命周期方法，只不过 qiankun额外填了一些生命周期方法，做了一些事情
 *  6、给微应用注册通信方法并返回通信方法，然后会将通信方法通过 props 注入到微应用
 * @param app 微应用配置对象
 * @param configuration start 方法执行时设置的配置对象 
 * @param lifeCycles 注册微应用时提供的全局生命周期对象
*/

export const bootstrapApp = async (app: Application) => {
  console.log('%c↓↓↓↓↓↓↓↓↓↓ bootstrapApp start ↓↓↓↓↓↓↓↓↓↓', 'color: red')

  triggerHook(app, 'beforeBootstrap', AppStatus.BEFORE_BOOTSTRAP)
  console.log(`%ctriggerHook:beforeBootstrap => ${app.status}`, 'color: blue')

  /**
   * 获取微应用的入口 html 内容和脚本执行器
   * template 是 link 替换为 style 后的 template
   * execScript 是 让 JS 代码(scripts)在指定 上下文 中运行
   * assetPublicPath 是静态资源地址
  */
  // const { template, execScripts, assetPublicPath } = await importEntry(app.entry)


  // 1. 根据子应用的 入口url，主应用通过发送请求的方式，获取到 html 内容
  // 解析入口 html，获取 css 和 js，赋值app 的 styles/scripts 属性，去除掉css和js后，剩余的就是 pageBody
  try {
    await parseHTMLandLoadSources(app)
  } catch (error) {
    triggerHook(app, 'bootstrapError', AppStatus.BOOTSTRAP_ERROR)
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

  // addStyles(app.styles as string[])
  console.log(app.scripts)
  executeScripts(app.scripts as string[], app)
  // 首次加载完资源后，生成沙箱快照，后续重新加载该应用的时候可复原
  if(frameworkConfiguration.sandboxConfig.open) {
    app.sandbox.snapShot = deepClone(app.sandbox?.proxyWindow) 
  }
    
  triggerHook(app, 'bootstrapped', AppStatus.BOOTSTRAPED)
  console.log(`%ctriggerHook:bootstrapped => ${app.status}`, 'color: blue')

  // 4. 获取子应用生命周期函数，挂到app 对象上'
  // console.log('4. 获取子应用生命周期函数，挂到app 对象上')
  // 每个子应用 main 中要把 bootstrap/mount/unmount 等声明周期函数封装好挂载到沙箱代理对象的__SINGLE_SPA__上，供基座使用)
  // const { mount, unmount } = await getMicroAppLifeFn(app)
  // app.mount = mount
  // app.unmount = unmount
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
