<script setup>
import HelloWorld from './components/HelloWorld.vue'

console.log('--------', window.a)
window.a = 'vue2'
console.log('--------', window)

</script>

<template>
  <div id="app">
    <header>
      <h2 class="green">测试</h2>
      <div class="wrapper">
        <HelloWorld msg="Vue2 App!" />
      </div>
    </header>
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

</style>
