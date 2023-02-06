import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import { registerApplication, start } from '../../../core/index'

registerApplication(
  [
    {
      name: 'vue2App',
      pageEntry: 'http://localhost:8081',
      container: '#container',
      activeRule: '/vue2-cli-app',
      beforeBootstrap: () => {
        console.log('vue2-cli-app 子应用中 提供的 beforeBootstrap 生命周期，资源准备完毕')
      },
      beforeMount: () => {
        console.log('vue2-cli-app 子应用中 提供的 beforeMount 生命周期， 挂载前')
      },
      beforeUmount: () => {
        console.log('vue2-cli-app 子应用中 提供的 beforeUmount 生命周期, 卸载前')
      },
    },
    {
      name: 'vue3App',
      pageEntry: 'http://localhost:8082',
      container: '#container',
      activeRule: () => location.pathname.indexOf('/vue3-cli-app') === 0
    }
  ]
)
start({})
createApp(App).mount('#app')
