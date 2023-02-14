import { originalDocument, originalQuerySelector } from '../utils/originalEnv'

export const documentFnRewrite = (container: HTMLElement) => {
  Document.prototype.querySelector =  (selector: string) => {
    if(!selector) {
      return originalQuerySelector.call(this, selector)
    }
    return (container as HTMLElement).querySelector(selector)
  }

  Document.prototype.getElementById = (id: string) => {
    if(!id) {
      return originalDocument.getElementById.call(this, id)
    }
    return originalDocument.getElementById.call(container, id)
  }
}

export const documentFnReset = () => {
  Document.prototype.querySelector = (selector: string) => {
    return originalQuerySelector.call(originalDocument, selector)
  }
}
