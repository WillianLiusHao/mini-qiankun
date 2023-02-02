<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <h1>vue2-cli-app</h1>
  </div>
</template>

<script>

export default {
  name: 'App',
}
console.log('vue2-cli-app => app.vue => window.a:', window.a)

window.a = 'vue2'
console.log('vue2-cli-app => app.vue => window.a:', window.a)

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
