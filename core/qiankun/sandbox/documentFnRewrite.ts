import { Application } from '../types'
import { originalDocument, originalQuerySelector } from '../utils/originalEnv'

export const documentFnRewrite = (app: Application) => {
  Document.prototype.querySelector =  (selector: string) => {
    if(!app || !selector) {
      return originalQuerySelector.call(this, selector)
    }
    return (app.container as HTMLElement).querySelector(selector)
  }

  Document.prototype.getElementById = (id: string) => {
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
