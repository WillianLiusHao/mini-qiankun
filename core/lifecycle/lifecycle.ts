import { AppStatus } from "../app/app"
import { Application } from "../types"
import { proxySandbox } from '../sandbox/proxySandbox'
import { parseHTMLandLoadSources, addStyles, executeScripts } from '../utils/source'
declare const window: any

export const bootstrapApp = async (app: Application) => {
  // 1. 根据子应用的 入口url，主应用通过发送请求的方式，获取到 html 内容
  // 解析入口 html，获取 css 和 js，赋值app 的 styles/scripts 属性，去除掉css和js后，剩余的就是 pageBody
  try {
    await parseHTMLandLoadSources(app)
  } catch (error) {
    app.status = AppStatus.BOOTSTRAP_ERROR
  }
  console.log('*************  start ****************', )
  console.log('1. parseHTMLandLoadSources处理后的资源', )
  console.log('styles', app.styles)
  console.log('scripts', app.scripts)

  // 2. 渲染 html, 赋值子应用容器内的 内容，app.container.innerHTML = app.pageBody
  if(typeof app.container === 'string') {
    const appContainer = document.querySelector(app.container) as HTMLElement
    appContainer.innerHTML = app.pageBody as string
    app.container = appContainer
  } else {
    (app.container as HTMLElement).innerHTML = app.pageBody as string
  }
  console.log('--------------------------------------', )
  console.log('2. 挂载 app.container:')

  // 3. 沙箱代理，执行 styles 和 scripts
  proxySandbox(app)
  addStyles(app.styles as string[])
  executeScripts(app.scripts as string[], app)
  console.log('--------------------------------------', )
  console.log('3. 执行style和script:')

  // 4. 每个子应用 main 中要把 bootstrap/mount/unmount 等声明周期函数封装好挂载到沙箱代理对象的__SINGLE_SPA__上，供基座通过import 获取)
  const { mount, unmount } = app.sandbox.proxyWindow.__SINGLE_SPA__
  console.log('--------------------------------------', )
  console.log('4. 获取子应用生命周期函数，准备挂载:')
  
  mount(app)
  console.log('*************  end ******************', )

}

export const unMountApp = () => {
  
}

export const mountApp = () => {
  
}


