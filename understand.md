# mini-qiankun

> 学习微前端，最小化实现一个微前端框架，尽可能完善 qiankun 现有功能

## 1. 特点

- 技术栈无关：主框架不限制接入应用的技术栈，微应用具备完全自主权
- 独立开发、独立部署：微应用仓库独立，前后端可独立开发，部署完成后主框架自动完成同步更新
- 增量升级：在面对各种复杂场景时，我们通常很难对一个已经存在的系统做全量的技术栈升级或重构，而微前端是一种非常好的实施渐进式重构的手段和策略
- 独立运行时：每个微应用之间状态隔离，运行时状态不共享


> single-spa 的缺陷

- `js entry`：子项目需要打包成一个 JS 文件发布到静态资源服务器，主应用去请求加载
- `样式隔离`
- `js隔离`
- `资源预加载`
- `数据通讯`



## 2. 整体流程

![](https://images.vrm.cn/ox/2023/02/08/liucheng.png)



1. `registerMicroApps`：注册子应用

    - 创建全局的子应用数据
    - 初始化每个子应用对象
    - 调用 `single-spa` 的 `registerApplication` 方法注册子应用

2. `start`：启动子应用

    - 设置全局变量 `__POWERED_BY_QIANKUN__`

    - 结合用户配置完善应用配置
      - 预加载配置
      - 沙箱配置
      - 单例模式
    - 调用 `single-spa` 的 `startSingleSpa` 方法启动应用

3. `single-spa` 开始激活子应用，触发相应的生命周期函数



> **loadApps：qiankun核心函数**

  - 1、通过 HTML Entry 的方式远程加载微应用，得到微应用的 html 模版（首屏内容）、JS 脚本执行器、静态经资源路径

  - 2、样式隔离，shadow DOM 或者 scoped css 两种方式

  - 3、渲染微应用

  - 4、运行时沙箱，JS 沙箱、样式沙箱

  - 5、合并沙箱传递出来的 生命周期方法、用户传递的生命周期方法、框架内置的生命周期方法，
  
      将这些生命周期方法统一整理，导出一个生命周期对象，供 single-spa 的 registerApplication 方法使用，这个对象就相当于使用 single-spa 时你的微应用导出的那些生命周期方法，只不过 qiankun额外填了一些生命周期方法，做了一些事情
      
  - 6、给微应用注册通信方法并返回通信方法，然后会将通信方法通过 props 注入到微应用



> 每个生命周期填充的内容

  1. 初次加载应用（**boostrap**）

      - 1. `解析和加载资源`： **import-html-entry** 

        - 对子应用入口发请求获取html
        - 解析 html，生成 `template, scripts, entry, styles` 等数据
          ```js
            /* {
              template: 经过处理的脚本，link、script 标签都被注释掉了,
              scripts: [脚本的http地址 或者 { async: true, src: xx } 或者 代码块],
              styles: [样式的http地址],
              entry: 入口脚本的地址，要不是标有 entry 的 script 的 src，要不就是最后一个 script 标签的 src
            }*/
          ```
        - 构建静态资源列表：把 js 和 css 外部资源远程加载 转为内联 `assetPublicPath`
        - 导出 js 脚本执行器： `execScripts`

      - 2. `挂载根节点`：将子应用挂载到主应用相应位置 上
      - 3. `沙箱`
      - 4. `执行 css 和 js`
      - 5. `子应用将 封装好的 mount/unmount 等函数，挂到代理对象上，供主应用使用`


  2. 挂载应用（**mount**）

      - `快照恢复`：恢复沙箱中的快照
      - `挂载`：app.mout()

  3. 卸载应用（**unmount**）

      - `沙箱失活`：卸载沙箱代理的window对象 / 卸载window上的事件(监听、计时器等) / 恢复元素选择器API
      - `卸载`：app,unmount()



## 3. HTML entry


```js
const { template, execScripts, assetPublicPath } = await importEntry(entry, importEntryOpts);
```

借助 `import-html-entry` 库，获取 template、assetPublicPath 和 execScripts 三项数据

- 将 template 通过 DOM 操作添加到主应用中
- 执行 execScripts 方法得到微应用导出的生命周期方法，并且还顺便解决了 JS 全局污染的问题，因为执行 execScripts 方法的时候可以通过 proxy 参数指定 JS 的执行上下文。


## 4. 沙箱

### 1.js隔离

#### 快照沙箱（单应用）

```js
class SnapshotSandbox {
  constructor() {
    this.originSnapshot = {} // 记录每个子应用激活前 window 的快照
    this.modifyPropsMap = {} // 记录子应用的修改了的属性
  }
  active() {
    for(let prop in window) {
      if(window.hasOwnProperty(prop)) {
        this.originSnapshot[prop] = window[prop] // 逐个属性赋值，记录快照
      }
    }
    Object.keys(this.modifyPropsMap).forEach(key => {
      window[key] = this.modifyPropsMap[key]
    })
  }
  inActive() {
    for(let prop in window) {
      if(window.hasOwnProperty(prop)) {
        if(window[prop] !== this.originSnapshot[prop]) { // 说明子应用有些属性被修改了
          this.modifyPropsMap[prop] = window[prop] // 恢复快照前记录变化的属性
          window[prop] = this.originSnapshot[prop] // 恢复
        }
      }
    }
    window = this.originSnapshot
  }
}
```

#### 代理沙箱（可多应用）

```js
class proxySandbox {
  constructor() {
    this.originWindow = {}
    this.fackWindow = {}
    const proxy = new Proxy(this.fackWindow, {
      set: (target, key, value) => {
        if(this.sandboxRunning) {
          // 如果设置的键是代理对象自有的，在set前会经过get函数，所以此时的target 为代理对象
          // 反之为 window
          target[key] = value
          return true
        }
      },
      get: (target, key) => {
        // 当代理对象有该属性时候，返回代理对象
        return target.hasOwnProperty(key) ? target[key] : window[key]
      }
    })
    this.proxy = proxy
  }
  active() {
    this.sandboxRunning = true
  }
  inActive() {
    this.sandboxRunning = false
  }
}
```

- 原理：利用 proxy 生成一个代理对象（`proxyWindow`），作为子应用的 window 对象。

- 实现:
  - 当子应用设置的属性在 window 上有时，设置改值到window上
  - 没有时，设置到代理对象上
  - **最后通过 with 语法，利用自执行函数，改变子应用的 window 为 proxyWindow**
```js
scripts.forEach(code => {
  const codeWrap = `;(function (proxyWindow) { 
    with(proxyWindow) {
      (function(window) {${code}}).call(proxyWindow, proxyWindow)
    }
  })(this)`
  new Function(codeWrap).call(app.sandbox.proxyWindow)
})

// (function(window) {${code}}).call(proxyWindow, proxyWindow)
// 这样，子应用代码执行时，子应用中的 window 被 proxyWindow 所取代了
```


#### 一些重要的细节

1. 卸载时清除 沙箱 window 上的属性（防止子应用访问到上一次加载的属性）

    实现：在代理对象的 set 函数中，将在代理对象设置的属性全部记录下来


2. 除了属性，还需要卸载可能绑定在 window 上的一些事件/定时器（setTimeout/clearTimeout/addEventListener/removeEventListener）


3. **缓存子应用快照，便于恢复**

    - 原因：除了初次加载子应用，会像传统的单个 vue 项目一样把所有的流程走一遍。后续重新加载子应用都是只执行子应用暴露的 mount 函数，导致各类 mount 外的js 代码无法再次执行

    - 实现：在每次创建代理对象时，将代理的对象 生成快照，下次重新挂载的时候恢复这个快照即可


### 2.元素作用域隔离

> 当子应用中使用 `document.querySelector` 时，依旧可以选择到主应用元素

- 解决：改写所有的选择器，把选择范围缩小到 子应用的 container 内

- tips：卸载的时候需要将选择方法还原

### 3.css隔离

#### shadowDom

#### 样式加前缀




## 5. 通讯

## 6. 疑难杂症

### 1. 资源如何处理的？

- 传统的 cli 模式下([import-html-entry](https://github.com/kuitos/import-html-entry))

    将子应用html作为入口(即index.html)，通过解析 html 的结构，解析需要的css，js等资源，并通过eval直接执行

    资源可能是外部的(有url的)，也可能是内嵌的
      - 外部的：通过 promise 发送请求，返回相应内容，并将内容转化成 内嵌的
      - 内嵌的：直接执行内部内容

- vite 模式下

    import、export并没有被转码，会导致直接报错（不允许在非 type=module 的 script 里面使用 import）

    所以只对 index.html 中的内嵌资源做处理，生成对应资源标签后插入到 页面中

    src资源的话，vite 会自动发送请求获取

### 2. 如何在vite项目使用？

> 为何vite中不能到生命周期钩子函数呢？

1.  vite 构建的 js 内容必须在 `type=module` 的 `script` 脚本里；

2. `qiankun` 的源码依赖之一 `import-html-entry` 不支持 `type=module` 这个属性
3. `qiankun` 是通过 `eval` 来执行这些 `js` 的内容，而 `vite` 里面 `import/export` 没有被转码， 所以直接接入会报错：不允许在非`type=module` 的 `script` 里面使用 `import`


- vite 应用是采用 `esm`，统一是发请求的模式，故应将 js/css 等资源在 main 中编写
- 我们可以通过编写自定义的 import 方法，将资源统一通过 import 方法引入，防止部分js的import语法 在 非 module 环境下的报错

> qiankun 官方现在还暂未支持 所以要引入第三方库 `vite-plugin-qiankun`


### 3. 子应用切换的生命周期管理/变化

> 假设某次流程为：加载A应用 -> 切换到C -> 切换到B -> 切换到A

请写出该流程的生命周期变化

> 1. 加载A：A依次经过 beforeBootStrap -> bootStraped -> beforeMount -> mounted

  - 其中在 bootstrap 生命周期会做如下事情
    - 解析子应用入口html，构建资源列表
    - 挂载子应用 根节点到 主应用
    - 沙箱代理
    - 执行 css 和 js
    - 获取子应用挂载到代理对象上的 mount 和 unmount 函数，以便后续执行

> 2. 切换到C：A应用卸载（变成unmounted） -> C应用走一遍`流程1`

> 3. 切换到B：C应用卸载（变成unmounted） -> B应用走一遍`流程1`

此时各子应用的的状态为（A：unmounted，C：unmounted，B：mounted）

> 4. 切换到A：B应用卸载（变成unmounted）-> `A应用加载过资源了,只进行 mount 流程`


### 4. 如何获取子应用声明周期钩子？

1. 模块导出 + umd 规范（官方文档）

      ```js
        // src/main.js
        export async function bootstrap() { /*...*/ }
        export async function mount(props) { /*...*/ }
        export async function unmount(props) { /*...*/ }
      ```
      ```js
        // vue.config.js
        const packageName = require('./package.json').name;
        module.exports = {
          output: {
            library: `${packageName}-[name]`,
            libraryTarget: 'umd',
            jsonpFunction: `webpackJsonp_${packageName}`,
          }
        };
      ```


2. 沙箱代理 + 挂在到全局上

      ```js
      在主应用执行完沙箱代理后，子应用将 `bootstrap mount unmount` 挂到window(实则是代
      理对象)上，供主应用获取
      ```

### 5. 资源跨域访问

  - 配置 cors，防止出现跨域问题（由于主应用和子应用的域名不同，会出现跨域问题）
  
    ```js
      module.exports = defineConfig({
        devServer: {
          // ...
          headers: {
            // 允许资源被主应用跨域请求
            'Access-Control-Allow-Origin': '*'
          }
        }
      })
    ```

### 6. 资源加载

  - 动态配置资源发布路径`publicPath`,否则主应用在请求子应用相对路径的资源(如：/src/main.js)就会请求到主应用下的资源
    
    ```js
      if (window.__POWERED_BY_QIANKUN__) {
        __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
      }
    ```







## single-spa

核心功能：

- 加载微应用
- 管理微应用的状态(初始化、挂载、卸载)

### registerApplication 注册子应用

```js
/**
 * registerApplication({
 *    name: 'app1',
 *    app: loadApp(url),
 *    activeWhen: activeWhen('/app1'),
 *    customProps: {}
 * })
 * @param { string } name  微应用名字
 * @param { Application | () => Application | Promise<Application> } app 回调函数
 * @param { string | (location) => boolean | (string | (location) => boolean)[] } activeWhen 子应用激活匹配方法
 * @param { Object } customProps 传递给子应用的 props 对象
 */
```

- single-spa 第二个参数app，可以理解形成回调函数，实则是子应用的一些生命周期，如 `mount、bootstrap、unmount`，注册时将这些传入，框架会在子应用激活的时候触发回调


- single-spa 内部有状态管理机制，给每个子应用都设定了状态，状态转变可为 `加载 => 挂载 => 卸载 => 重挂载`；


- single-spa 会通过路由的变化，决定各子应用的状态变化，进而决定子应用的生命周期

    + `overwriteEventsAndHistory`：监听页面变化，切换子应用并修改状态

    + 改写浏览器的`popstate`, `hashChange`, `history.replaceState`, `history.pushState` 等方法，且每次变化都会执行 **loadApps** 方法


## 知识点串联

> qiankun 依赖了 `single-spa` 的 `{ registerApplication, start }` 方法

  - qiankun 在调用 single-spa 的 registerApplication 前，通过拓展 `app` 参数，实现自定义的加载方法

> qiankun 依赖了 `import-html-entry` 的 `{ importEntry }` 方法

  - 通过 entry 解析子应用资源，获得 js/css 并在沙箱中执行
