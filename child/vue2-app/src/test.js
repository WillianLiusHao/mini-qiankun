setTimeout(() => {
  
  document.querySelectorAll('h1').forEach(h1 => {
    h1.innerHTML = h1.innerHTML.replace('App', 'app')
  })
}, 3000);
  console.log('引入h1')
