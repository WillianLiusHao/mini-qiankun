const { defineConfig } = require('@vue/cli-service')
const port = 8082

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath:`//localhost:${port}`,
  devServer: {
    port,
    // 允许资源被主应用跨域请求
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
})
