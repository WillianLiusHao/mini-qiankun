const { defineConfig } = require('@vue/cli-service')
const { name } = require('./package');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8082,
    // 允许资源被主应用跨域请求
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  configureWebpack: {
    output: {
      library: `${name}-[name]`,
      libraryTarget: 'umd',
    }
  },
})
