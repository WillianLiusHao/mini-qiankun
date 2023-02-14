import { Application } from "./types"
import { proxySandbox } from './sandbox/proxySandbox'
import { importEntry, addStyles } from '../import-html-entry'
import { originalWindow } from './utils/originalEnv'
import { deepClone } from './utils/deepClone'
import { frameworkConfiguration } from './apis'

import { bootstrapApp, unmountApp, mountApp } from './lifecycle'


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
  // let element = document.createElement('div')
  // element.id = `__qiankun_microapp_wrapper_for_${app.name}`
  // element['data-name'] = app.name
  // element.innerHTML = template

  
  // --------------- 3.渲染微应用 ----------------
  console.log('3. 挂载 app.container:')

  // const render = getRender(app.container)
  // render(element)
  // app.container = document.querySelector(`#${element.id}`) as HTMLElement


  app.container = document.querySelector(app.container as string) as HTMLElement
  app.container.innerHTML = template
  
  // --------------- 4.运行时沙箱 ----------------
  //3. 沙箱代理，执行 styles 和 scripts
  console.log('4. 沙箱代理，执行style和script:')
  if(frameworkConfiguration.sandbox) {
    app.sandbox = new proxySandbox(app.container)
    app.sandbox.active()
  }

  // addStyles(app.styles as string[])
  execScripts(app.scripts as string[], app)
  // 首次加载完资源后，生成沙箱快照，后续重新加载该应用的时候可复原
  if(frameworkConfiguration.sandbox) {
    app.sandbox.snapShot = deepClone(app.sandbox?.proxyWindow) 
  }
    
  // --------------- 5.合并处理生命周期 ----------------
  const { mount, unmount } = await getMicroAppLifeFn(app)
  app.mount = mount
  app.unmount = unmount

  return {
    bootstrap: [bootstrapApp],
    mount: [
      async (opts) => mountApp(app, opts)
    ],
    unmount: [
      async (opts) => unmountApp(app, opts)
    ]
  }
}


async function getMicroAppLifeFn(app: Application) {
  if (frameworkConfiguration.sandbox) {
    return app.sandbox?.proxyWindow?.module.exports
  } else if(originalWindow.module) {
    return originalWindow.module.exports
  }
  throw Error('The micro app must export the lifecycle("bootstrap" "mount" "unmount") fn')
}


function getRender(container) {
  const render = (el) => {
    const appContainer = typeof container === 'string' ? document.querySelector(container) as HTMLElement : container
    appContainer.innerHTML = '' // 挂载前先清空
    appContainer.appendChild(el)
  }
  return render
}
