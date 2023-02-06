<script setup lang="ts">
  import { ref } from 'vue'
  const curPath = ref('/vue2-cli-app')
  const changeRouter = (path: string) => {
    curPath.value = path
    history.pushState(null, path, path) 
  }
</script>

<template>
  <div id="main-app" class="main-app">
    <h1 id="green" class="green">当前应用 {{}}</h1>
    <div>
      <button @click="changeRouter('/vue2-cli-app')" :class="{ active: curPath === '/vue2-cli-app'}">/vue2</button>
      <button @click="changeRouter('/vue3-cli-app')" :class="{ active: curPath === '/vue3-cli-app'}">/vue3</button>
    </div>
    
    <div id="container">
    </div>
  </div>
</template>

<style scoped>
.main-app {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
h1 {
  margin-bottom: 20px;
}
#container {
  height: 200px;
}
.active {
  background-color: #a3a6a9;
}
</style>
