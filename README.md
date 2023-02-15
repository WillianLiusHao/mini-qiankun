# mini-qiankun


## Guide

```js
import { registerApplication, start } from 'mini-qiankun'

registerMicroApps(
  [
    {
      name: 'vue2App',
      entry: 'http://localhost:8081',
      container: '#container',
      activeRule: '/vue2-cli-app',
      props: {
        msg: '主应用传递的数据,你是vue2App'
      }
    },
    {
      name: 'vue3App',
      entry: 'http://localhost:8082',
      container: '#container',
      activeRule: () => location.pathname.indexOf('/vue3-cli-app') === 0,
      props: {
        msg: '主应用传递的数据,你是vue3App'
      }
    }
  ]
)

start()
```

## API

- registerMicroApps(apps, lifeCycles?)
- start(opts?)
