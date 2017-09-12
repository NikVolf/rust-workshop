const wasm = require('./main.rs')

wasm.initialize().then(module => {
  const add = module.cwrap('add', 'number', ['number', 'number'])

  console.log('Calling rust functions from javascript!')
  console.log(add(1, 2))
})