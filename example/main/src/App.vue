<script setup lang="ts">
  const changeRouter = (path: string) => {
    history.pushState(null, path, path) 
  }
</script>

<template>
  <div id="main-app" class="main-app">
    <h1 id="green" class="green">当前应用 {{}}</h1>
    <div>
      <button id="btn1" @click="changeRouter('/vue2-cli-app')">/vue2</button>
      <button @click="changeRouter('/vue3-cli-app')">/vue3</button>
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
</style>
