import { getCurApp } from '../utils/application'
import { originalDocument } from '../utils/originalEnv'

export const documentFnRewrite = () => {
  Document.prototype.getElementById = (id: string) => {
    const [app] = getCurApp()
    if(!app || !id) {
      return originalDocument.getElementById(id)
    }
    return originalDocument.getElementById.call(app.container, id)
  }

  Document.prototype.querySelector = (selector: string) => {
    const [app] = getCurApp()
    if(!app || !selector) {
      return originalDocument.querySelector(selector)
    }
    return originalDocument.querySelector.call(app.container, selector)
  }
}
