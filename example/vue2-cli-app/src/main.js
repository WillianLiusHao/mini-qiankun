import Vue from 'vue'
import App from './App.vue'
import './public-path';

Vue.config.productionTip = false

let instance = null;

function render(props = {}) {
  const { container } = props
  instance = new Vue({
    render: h => h(App)
  }).$mount(container ? container.querySelector('#app') : '#app')
}

if(!window.__POWERED_BY_QIANKUN__) {
  render()
} else {
  // 方法1：挂载到子应用沙箱中的 window上（限制：主应用必须先创建了沙箱）
  window.__SINGLE_SPA__ = {
    bootstrap,
    mount,
    unmount
  }
}


// 方法2：暴露方法，通过webpack打包成umd格式，主应用执行后获取
export async function bootstrap() {
  console.log('[vue2] vue2 app bootstraped');
}
export async function mount(props) {
  console.log(window.a)
  window.a = 'vue2'
  render(props);
}
export async function unmount() {
  instance.$destroy();
  instance.$el.innerHTML = '';
  instance = null;
}
