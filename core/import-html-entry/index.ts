import { Application } from '../qiankun/types'

const originalWindow: Window & any = window
export const importEntry = (entry: string) => {

}

// 通过 app 入口文件解析 html 并 加载 css 和 js
export const parseHTMLandLoadSources = async (app: Application) => {
  return new Promise<void>(async (resolve, reject) => {
    // 1. 发请求，获取 html 内容
    let html = ''
    try {
      html = await loadSourceText(app.entry)
    } catch (error) {
      reject('parse html error')      
    }
    
    // 2.DOMParser 解析 html，处理成 dom 对象（不用创建真实dom）
    const domparser = new DOMParser()
    const doc = domparser.parseFromString(html, 'text/html')

    // parseCssAndScript 解析 css 和 js 资源
    const { styles, scripts } = parseCssAndScript(doc, app)
    app.pageBody = html
    
    // app.pageBody = doc.body.innerHTML


    // 加载 资源
    console.log(scripts)
    let isStylesDone = false, isScriptsDone = false
    Promise.all(getExternalStyleSheets(app, styles))
      .then((res: any) => {
        isStylesDone = true
        app.styles = res
        if(isStylesDone && isScriptsDone) { resolve() }
      })
      .catch((err: any) => reject(err))
    Promise.all(getExternalScript(app, scripts))
      .then((res: any) => {
        isScriptsDone = true
        app.scripts = res
        if(isStylesDone && isScriptsDone) { resolve() }
      })
      .catch((err: any) => reject(err))
    
  })
}
export function loadSourceText(url: string) {
  return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.onload = (res: any) => {
          resolve(res.target.response)
      }
      xhr.onerror = reject
      xhr.onabort = reject
      xhr.open('get', url)
      xhr.send()
  })
}

const parseCssAndScript = (node: Document, app: Application) => {
  let styles: any[] = []
  let scripts: any[] = []
  app.loadedURLs = []
  const head = node.head
  const body = node.body
  const sources = [...Array.from(head.children), ...Array.from(body.children)]
  for(const source of sources) {
    const tagName = source.tagName
    if(tagName === 'SCRIPT') {
      source.parentNode?.removeChild(source)
      const src = source.getAttribute('src') || ''
      if (app.loadedURLs.includes(src)) {
        continue
      }
      const sourceConfig = {
        url: src,
        type: source.getAttribute('type'),
        value: source.textContent || ''
      }
      scripts.push(sourceConfig)
      app.loadedURLs.push(src)

    } else if (tagName === 'STYLE') {
      source.parentNode?.removeChild(source)
      styles.push({
        value: source.textContent || ''
      })

    } else if (tagName === 'LINK') {
      source.parentNode?.removeChild(source)
      styles.push({
        url: source.getAttribute('href'),
        value: source.textContent
      })
    }
  }
  return { styles, scripts }
}

// 加载外部 css
export const getExternalStyleSheets = (app: Application, styles: any) => {
  if(!styles.length) return Promise.reject('getExternalStyleSheets error')

  return styles.map((item: any) => {
    if (!item.url) return Promise.resolve(item.value)
  }).filter(Boolean)
}
const head = document.head
export function addStyles(styles: string[] | HTMLStyleElement[]) {
  styles.forEach(item => {
    if (typeof item === 'string') {
      const style = createElement('style', {
        type: 'text/css',
      })
      const cssText = document.createTextNode(item)
      style.appendChild(cssText)
      head.appendChild(style)
    } else {
      head.appendChild(item)
    }
  })
}

// 处理外部js和内嵌script
export const getExternalScript = (app: Application, scripts: any) => {
  if(!scripts.length) return Promise.reject('getExternalScript error')

  return scripts.map((item: any) => {
    if (item.url) {
      return loadSourceText(`${item.url.includes('http') ? '' : app.entry}${item.url}`)
    } else if (item.value){
      return Promise.resolve(item.value)
    }
  }).filter(Boolean)
}


export function executeScripts(scripts: string[], app: Application) {
  try {

    /**
     * 基于umd 模式，构造 commonjs 环境，用于接收子应用暴露的生命周期钩子
     */

    const module = { exports: {} }
    const exports = module.exports
    if(app.sandbox?.proxyWindow) {
      app.sandbox.proxyWindow.module = { exports: {} }
      app.sandbox.proxyWindow.export = app.sandbox.proxyWindow.module.exports
    }
    
    scripts.forEach(code => {
      const codeWrap = `;(function (proxyWindow) {
        with(proxyWindow) {
          (function(window) {
            ${code}\n
          }).call(proxyWindow, proxyWindow)
        }
      })(this)`
      new Function(codeWrap).call(app.sandbox?.proxyWindow || originalWindow)
    })
    console.log(window, app.sandbox?.proxyWindow, module.exports)
  } catch (error) {
    throw error
  }
}


export function createElement(tag: string, attrs?: any) {
  const node = document.createElement(tag)
  attrs && Object.keys(attrs).forEach(key => {
    node.setAttribute(key, attrs[key])
  })
  return node
}
