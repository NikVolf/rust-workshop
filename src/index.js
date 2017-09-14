const wasm = require('./main.rs');
const utils = require('./utils.js');

function produce_derivation(module) {
  const key_derive = module.cwrap('brain_wallet_derive', 'void', ['number', 'number', 'number']);
  const malloc = module.cwrap('malloc', 'number', ['number']);
  const free = module.cwrap('free', 'void', ['number']);

  const str = document.getElementById("sourceString").value;
  const utf8 = utils.toUTF8Array(str);

  const source_ptr = malloc(utf8.length);
  const dest_ptr = malloc(32);

  const buffer = new Uint8Array(module.wasmMemory.buffer);
  for (var i = 0; i < utf8.length; i++) {
    buffer[source_ptr + i] = source_ptr[i];
  }

  key_derive(source_ptr, utf8.length, dest_ptr);

  var result = [];
  for (var i = 0; i < 32; i ++) {
    result.push(buffer[dest_ptr+i]);
  }

  document.getElementById("result").innerText = JSON.stringify(result);

  free(source_ptr);
  free(dest_ptr);
}

wasm.initialize().then(wasm_module => {
  let run_button = document.getElementById("run");
  run_button.removeAttribute("disabled");
  document.getElementById("run").onclick = function() {
    produce_derivation(wasm_module);
  }
})