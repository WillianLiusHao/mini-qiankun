import { loadApps } from "../app/app"

// 改写浏览器的前进后退等事件，主要是在每次路由变更时重新 加载应用
const originalPushState = window.history.pushState
const originalReplaceState = window.history.replaceState
const overwriteEventsAndHistory = () => {
  window.addEventListener('popstate', () => {
    console.log('popstate')
    loadApps()
  })
  window.history.pushState = function(...param) {
    originalPushState.call(this, ...param)
    console.log('pushState')
    loadApps()
  }
  window.history.replaceState = function(...param) {
    originalReplaceState.call(window, ...param)
    console.log('replaceState')
    loadApps()
  }
}
export { 
  overwriteEventsAndHistory
}
