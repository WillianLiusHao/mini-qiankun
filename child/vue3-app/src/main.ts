import { createApp, type ComponentPublicInstance } from 'vue'
import './style.css'
import app from './App.vue'

let instance: ComponentPublicInstance
function render (props: any) {
  const { container } = props
  instance = createApp(app).mount(container ? container.querySelector('#app') : '#app')
}

export async function bootstrap() {
  console.log('[vu3e] vue3 app bootstraped');
}
export async function mount(props: any) {
  console.log('[vue3] vue3 app mount, props ->', props);
  render(props);
}
export async function unmount() {
  instance.$el.innerHTML = '';
  (instance as any) = null;
}
