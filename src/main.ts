import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import { registerApplication, start } from '../core/index'

registerApplication(
  [
    {
      name: 'vue2App',
      pageEntry: 'http://localhost:8081',
      container: '#container',
      activeRule: '/vue2-cli-app'
    },
    {
      name: 'vue3App',
      pageEntry: 'http://localhost:8082',
      container: '#container',
      activeRule: () => location.pathname.indexOf('/vue3-cli-app') === 0
    }
  ]
)
start()
createApp(App).mount('#app')
