import { createApp } from 'vue'
import App from './App.vue'

let instance = null;

function render(props = {}) {
  const { container } = props
  instance = createApp(App).mount(container ? container.querySelector('#app') : '#app')
}
function bootstrap() {
}
window.vue = 'vue3'

function mount(props) {
  render(props);
  console.log(window.vue )
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


