import Vue from 'vue'
import App from './App.vue'
import './assets/main.css'

let instance = null;
function render(props = {}) {
  const { container } = props
  instance = new Vue({
    render: (h) => h(App)
  }).$mount(container ? container.querySelector('#app') : '#app')
}
console.log(321321321321, window)
export async function bootstrap() {
  console.log('[vue2] vue2 app bootstraped');
}
export async function mount(props) {
  console.log('[vue2] vue2 app mount');
  if(window.__IS_SINGLE_SPA__) {
    render(props);
  }
}
export async function unmount() {
  instance.$destroy();
  instance.$el.innerHTML = '';
  instance = null;
}
