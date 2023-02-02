## mini-qiankun

> 学习微前端，最小化实现一个微前端框架，尽可能完善 qiankun 现有功能



### 1. 特点

- 技术栈无关：主框架不限制接入应用的技术栈，微应用具备完全自主权
- 独立开发、独立部署：微应用仓库独立，前后端可独立开发，部署完成后主框架自动完成同步更新
- 增量升级：在面对各种复杂场景时，我们通常很难对一个已经存在的系统做全量的技术栈升级或重构，而微前端是一种非常好的实施渐进式重构的手段和策略
- 独立运行时：每个微应用之间状态隔离，运行时状态不共享




### 2. 如何嵌入

要将子应用嵌入到主应用，首先需要拿到子应用的 html。然后将子应用 html 中的元素添加到主应用的容器中，并需要能单独处理子应用的 js（加沙箱隔离全局变量等）。

主要步骤如下：

1. 通过fetch拿到子应用的html（需要在主应用里配置子应用的激活规则和子应用的index.html地址）；
2. 处理 html（去除html/body/script等标签）；
3. 主应用通过 fetch 去获取子应用的 js，包装 js（js沙箱）隔离全局变量；
4. 执行包装完成后的 js 取出子应用导出的 mout 函数并执行（react/vue子项目中导出的实际上是子应用的渲染逻辑）；




### 3. 疑难杂症

##### 1. 资源如何处理的？

- 传统的 cli 模式下([import-html-entry](https://github.com/kuitos/import-html-entry))

    将子应用html作为入口(即index.html)，通过解析 html 的结构，解析需要的css，js等资源，并通过eval直接执行

    资源可能是外部的(有url的)，也可能是内嵌的
      - 外部的：通过 promise 发送请求，返回相应内容，并将内容转化成 内嵌的
      - 内嵌的：直接执行内部内容

- vite 模式下

    import、export并没有被转码，会导致直接报错（不允许在非 type=module 的 script 里面使用 import）

    所以只对 index.html 中的内嵌资源做处理，生成对应资源标签后插入到 页面中

    src资源的话，vite 会自动发送请求获取

##### 2. 如何在vite项目使用？

> 为何vite中不能到生命周期钩子函数呢？

1.  vite 构建的 js 内容必须在 `type=module` 的 `script` 脚本里；

2. `qiankun` 的源码依赖之一 `import-html-entry` 不支持 `type=module` 这个属性
3. `qiankun` 是通过 `eval` 来执行这些 `js` 的内容，而 `vite` 里面 `import/export` 没有被转码， 所以直接接入会报错：不允许在非`type=module` 的 `script` 里面使用 `import`



- vite 应用是采用 `esm`，统一是发请求的模式，故应将 js/css 等资源在 main 中编写
- 我们可以通过编写自定义的 import 方法，将资源统一通过 import 方法引入，防止部分js的import语法 在 非 module 环境下的报错

> qiankun 官方现在还暂未支持 所以要引入第三方库 `vite-plugin-qiankun`



### 4. 坑

1. 如何获取子应用声明周期钩子？

    - 子应用将 生命周期函数挂载到 window 上（子应用代理对象），供主应用获取

    - 子应用 `main.js` 导出函数，主应用通过 动态 import 的方式获取子应用中的生命周期函数

2. 资源跨域访问

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

3. 资源加载

    - 配置资源发布路径`publicPath`,否则主应用在请求子应用相对路径的资源(如：/src/main.js)就会请求到主应用下的资源

        ```js
          module.exports = defineConfig({
            // ...
            devServer: {
              port: 8081,
            },
            publicPath:`//localhost:${port}`,
          })
        ```




### 5. 整体流程

1. 主应用注册子应用

    - 初始化子应用对象

    - **监听页面变化，切换子应用**
      - 监听 popstate
      - 监听 haschange
      - 改写 pushState
      - 改写 replaceState

2. 启动/加载子应用

    - **将子应用按状态分类，不同状态逐一执行不同的处理方法**

      1. 待启动的 => **boostrapApp**
        - 解析和加载资源 **parseHTMLandLoadSources** 
          - loadSourceText：对子应用主页面**发请求**获取页面内容 html
          - domparser：解析 html，处理成树状 dom（html，head，body）
          - parseCssAndScript：处理 css 和 js，**把外部链接和内嵌的处理成可执行的代码**
        - 将子应用 mount 挂载的框 渲染到 container 上
        - 执行 css 和 js
        - 子应用在 main.js 提供封装好的 mount/unmount 等生命周期函数，父应用通过 import 获取到对应的挂载函数，进行挂载





### 6. 沙箱

##### js沙箱

- 快照沙箱

- 代理沙箱

**一些重要的细节**

1. 卸载时清除 沙箱 window 上的属性（防止子应用访问到上一次加载的属性）

    - 实现：在代理对象的 set 函数中，将在代理对象设置的属性全部记录下来

2. 除了属性，还需要卸载可能绑定在 window 上的一些事件/定时器（setTimeout/clearTimeout/addEventListener/removeEventListener）

3. 缓存子应用快照，便于恢复

    - 原因：因为除了初次加载子应用，会像传统的单个 vue 项目一样把所有的流程走一遍。后续重新加载子应用都是只执行子应用暴露的 mount 函数，导致各类 mount 外的js 文件无法再次执行

    - 实现：在每次创建代理对象时，将代理的对象 生成快照，下次重新挂载的时候恢复这个快照即可


##### 元素作用域隔离

> 当子应用中使用 `document.querySelector` 时，依旧可以选择到主应用元素

解决：改写所有的选择器，把选择范围缩小到 子应用的 container 内


##### css沙箱


### 7. 通讯

### 8. 数据共享


