import { getCurApp } from '../app'
import { originalDocument, originalQuerySelector } from '../utils/originalEnv'

export const documentFnRewrite = () => {
  Document.prototype.querySelector =  (selector: string) => {
    const [app] = getCurApp()
    if(!app || !selector) {
      return originalQuerySelector.call(this, selector)
    }
    return (app.container as HTMLElement).querySelector(selector)
  }

  Document.prototype.getElementById = (id: string) => {
    const [app] = getCurApp()
    if(!app || !id) {
      return originalDocument.getElementById.call(this, id)
    }
    return originalDocument.getElementById.call(app.container, id)
  }
}

export const documentFnReset = () => {
  Document.prototype.querySelector = (selector: string) => {
    return originalQuerySelector.call(originalDocument, selector)
  }
}
