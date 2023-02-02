import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

let instance = null;


function render(props = {}) {
  const { container } = props
  instance = new Vue({
    render: (h) => h(App)
  }).$mount(container ? container.querySelector('#app') : '#app')
}
function bootstrap() {
}
console.log('vue2-cli-app => mian.js => window.a:', window.a)

function mount(props) {
  console.log('vue2-cli-app => mian.js(mount) => window.a:', window.a)
  render(props);
}
function unmount() {
  instance.$destroy();
  instance.$el.innerHTML = '';
  instance = null;
}


if(window.__IS_SINGLE_SPA__) {
  window.__SINGLE_SPA__ = {
    bootstrap,
    mount,
    unmount
  }
}


