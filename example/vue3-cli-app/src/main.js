import { createApp } from 'vue'
import App from './App.vue'

let instance = null;

function render(props = {}) {
  const { container } = props
  instance = createApp(App).mount(container ? container.querySelector('#app') : '#app')
}
function bootstrap() {
}
console.log('vue3-cli-app => main.js => window.a:', window.a)

function mount(props) {
  console.log('vue3-cli-app => main.js(mount) => window.a:', window.a)
  render(props);
}
function unmount() {
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


