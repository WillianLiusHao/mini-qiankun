import { createApp } from 'vue'
import App from './App.vue'
import './public-path';

let instance = null;

function render(props = {}) {
  const { container } = props
  instance = createApp(App).mount(container ? container.querySelector('#app') : '#app')
}


if(!window.__POWERED_BY_QIANKUN__) {
  render()
} else {
  window.__SINGLE_SPA__ = {
    bootstrap,
    mount,
    unmount
  }
}


export async function bootstrap() {
  console.log('[vue3] vue3 app bootstraped');
}
export async function mount(props) {
  console.log(window.a)
  window.a = 'vue3'
  render(props);
}
export async function unmount() {
  instance.$el.innerHTML = '';
  instance = null;
}


