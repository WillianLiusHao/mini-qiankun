import { Application } from '../types'
import { originalWindow } from './originalEnv'

export const isActive = (app: Application) => {
  return typeof app.activeRule === 'function' && app.activeRule()
}

// 通过 app 入口文件解析 html 并 加载 css 和 js
export const parseHTMLandLoadSources = async (app: Application) => {
  return new Promise<void>(async (resolve, reject) => {
    // 1. 发请求，获取 html 内容
    let html = ''
    try {
      html = await loadSourceText(app.pageEntry)
    } catch (error) {
      reject('parse html error')      
    }
    
    // 2.DOMParser 解析 html，处理成树状 dom
    const domparser = new DOMParser()
    const doc = domparser.parseFromString(html, 'text/html')
    // parseCssAndScript 解析 css 和 js 资源
    const { styles, scripts } = parseCssAndScript(doc, app)
    app.pageBody = doc.body.innerHTML
    // 加载 资源
    let isStylesDone = false, isScriptsDone = false
    Promise.all(loadStyles(app, styles))
      .then((res: any) => {
        isStylesDone = true
        app.styles = res
        if(isStylesDone && isScriptsDone) { resolve() }
      })
      .catch((err: any) => reject(err))
    Promise.all(loadScripts(app, scripts))
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

export const parseCssAndScript = (node: Document, app: Application) => {
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
export const loadStyles = (app: Application, styles: any) => {
  if(!styles.length) return Promise.reject('loadStyles error')

  return styles.map((item: any) => {
    // if (item.url) return loadSourceText(app.pageEntry, item.url)
    // else return Promise.resolve(item.value)

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

// 只处理外部js和内嵌script
export const loadScripts = (app: Application, scripts: any) => {
  if(!scripts.length) return Promise.reject('loadScripts error')

  return scripts.map((item: any) => {
    if (item.url) {
      return loadSourceText(item.url)
    } else if (item.value){
      return Promise.resolve(item.value)
    }
  }).filter(Boolean)
}
export function executeScripts(scripts: string[], app: Application) {
  try {
    scripts.forEach(code => {
      const codeWrap = `;(function (proxyWindow) { 
        with(proxyWindow) {
          (function(window) {${code}\n}).call(proxyWindow, proxyWindow)
        }
      })(this)`
      new Function(codeWrap).call(app.sandboxConfig.open ? app.sandbox.proxyWindow : originalWindow)
    })
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
