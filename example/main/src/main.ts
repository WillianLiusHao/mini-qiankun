import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import { registerMicroApps, start } from '../../../core/qiankun/index'
// import { registerMicroApps, start } from 'qiankun'

registerMicroApps(
  [
    {
      name: 'vue2App',
      entry: 'http://localhost:8081',
      container: '#container',
      activeRule: '/vue2-cli-app',
    },
    {
      name: 'vue3App',
      entry: 'http://localhost:8082',
      container: '#container',
      activeRule: () => location.pathname.indexOf('/vue3-cli-app') === 0
    }
  ]
)

// registerApplication(
//   {
//     name: 'vue2App',
//     app: async () => {
//       return {
//         bootstrap: async () => {
//           console.log('single-spa bootstrap')
//         },
//         mount: async () => {
//           console.log('single-spa mount')
//         },
//         unmount: async () => {
//           console.log('single-spa unmount')
//         }
//       }
//     },
//     activeWhen: () => location.pathname.indexOf('/vue2-cli-app') === 0,
//   },
// )
start()
createApp(App).mount('#app')
