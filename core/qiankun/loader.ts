import { Application } from "./types"
import { importEntry, addStyles } from '../import-html-entry'
import { originalDocument, originalWindow } from './utils/originalEnv'
import { deepClone } from './utils/deepClone'
import { frameworkConfiguration } from './apis'

import { createSandbox } from "./sandbox/proxySandbox"

/**
 * loadApp 完成了以下几件事：
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
export const loadApp = async (app: Application) => {
  console.log(`%c↓↓↓↓↓↓↓↓↓↓ ${app.name} loadApp start ↓↓↓↓↓↓↓↓↓↓`, 'color: red')

  // --------------- 1.html entry ---------------
  /**
   * 获取微应用的入口 html 内容和脚本执行器
   * template 是 link 替换为 style 后的 template
   * execScript 是 让 JS 代码(scripts)在指定 上下文 中运行
   * assetPublicPath 是静态资源地址
  */
  console.log('1. importEntry处理资源', )
  const { template, execScripts, assetPublicPath } = await importEntry(app)

  
  // --------------- 2.样式隔离 ------------------
  const appContent = `<div id="__qiankun_microapp_wrapper_for_${app.name}__" data-name="${app.name}">${template}</div>`
  let element: any = createElement(appContent)

  // addStyles(app.styles as string[])


  // --------------- 3.渲染微应用 ----------------
  console.log('3. 挂载 app.container:')
  const render = getRender(app.container) // 根据容器生产一个渲染函数，函数入参 element 是 html 内容，render 会把 element 加入到容器中
  render(element)

  app.container = document.querySelector(app.container as string) as HTMLElement
  
  // --------------- 4.运行时沙箱 ----------------
  //3. 沙箱代理，执行 styles 和 scripts
  console.log('4. 沙箱代理，执行style和script:')
  let sandboxInstance
  let global = window;
  let mountSandbox = () => Promise.resolve();
  let unmountSandbox = () => Promise.resolve();

  if(frameworkConfiguration.sandbox) {
    const { sandbox, mount, unMount } = createSandbox(app.container)
    sandboxInstance = sandbox
    global = sandboxInstance.proxyWindow
    mountSandbox = mount
    unmountSandbox = unMount
  }

  // mountSandbox()
  await execScripts(app.scripts as string[], global)
  // 应用注册并执行完js后，对当前的代理 window 生成沙箱快照，便于后续重新加载该应用的时候复原
  if(frameworkConfiguration.sandbox) {
    sandboxInstance.snapShot = deepClone(global)
  }

  // --------------- 5.合并处理生命周期 ----------------
  const { mount, unmount } = await getMicroAppLifeFn(global)

  return {
    bootstrap: [
      async (opts) => { console.log(`%c↓↓↓↓↓↓↓↓↓↓ ${app.name} bootstrap ↓↓↓↓↓↓↓↓↓↓`, 'color: red'); console.log('主应用下发的数据', opts) },
    ],
    mount: [
      async () => {console.log(`%c↓↓↓↓↓↓↓↓↓↓ ${app.name} beforeMount ↓↓↓↓↓↓↓↓↓↓`, 'color: red');},
      async () => {
        element = element || createElement(appContent)
        render(element)
      }, // 创建盒子
      async () => mountSandbox(),
      async (opts) => mount(app, opts),
    ],
    unmount: [
      async () => {console.log(`%c↓↓↓↓↓↓↓↓↓↓ ${app.name} beforeUnmount ↓↓↓↓↓↓↓↓↓↓`, 'color: brown');},
      async (opts) => unmount(app, opts),
      async () => unmountSandbox(), // 沙箱失活
      async () => {
        element = null
      }, // 置空盒子
    ]
  }
}


/*********************  辅助函数 *********************/
function createElement(content: string) {
  // 创建div再插入内容，是为了快速将 content 转成 dom 结构
  let div = originalDocument.createElement('div')
  div.innerHTML = content
  const appElement = div.firstChild as HTMLElement;
  return appElement
}

function getRender(container) {
  const render = (el) => {
    const appContainer = typeof container === 'string' ? originalDocument.querySelector(container) as HTMLElement : container
    appContainer.innerHTML = ''
    appContainer.appendChild(el)
  }
  return render
}

async function getMicroAppLifeFn(window) {
  if (frameworkConfiguration.sandbox) {
    return window?.module.exports
  } else if(originalWindow.module) {
    return originalWindow.module.exports
  }
  throw Error('The micro app must export the lifecycle("bootstrap" "mount" "unmount") fn')
}
