import { overwriteEventsAndHistory } from './utils/overwriteEventsAndHistory'

export { registerMicroApps } from './app/registerMicroApps'
export { start } from './app/start'

// 改写浏览器监听等方法
overwriteEventsAndHistory()
