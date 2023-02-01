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
  console.log('[vue2] vue2 app bootstraped');
}
function mount(props) {
  console.log('[vue2] vue2 app mount');
  render(props);
}
function unmount() {
  instance.$destroy();
  instance.$el.innerHTML = '';
  instance = null;
}

console.log(321321321321, window)

if(window.__IS_SINGLE_SPA__) {
  window.__SINGLE_SPA__ = {
    bootstrap,
    mount,
    unmount
  }
}


