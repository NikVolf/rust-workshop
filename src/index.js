const wasm = require('./main.rs');
const utils = require('./utils.js');

function wasm_derivation(module, str) {
  const key_derive = module.cwrap('brain_wallet_derive', 'void', ['number', 'number', 'number']);
  const malloc = module.cwrap('malloc', 'number', ['number']);
  const free = module.cwrap('free', 'void', ['number']);

  const utf8 = utils.toUTF8Array(str);

  const source_ptr = malloc(utf8.length);
  const dest_ptr = malloc(32);

  const source_buffer = new Uint8Array(module.wasmMemory.buffer, source_ptr, utf8.length);
  for (var i = 0; i < utf8.length; i++) {
    source_buffer[i] = utf8[i];
  }

  key_derive(source_ptr, utf8.length, dest_ptr);

  const dest_buffer = new Uint8Array(module.wasmMemory.buffer, dest_ptr, 32);
  var result = [];
  for (var i = 0; i < 32; i ++) {
    result.push(dest_buffer[i]);
  }

  free(source_ptr);
  free(dest_ptr);

  return utils.bytesToHex(result);
}

function produce_derivation(module) {
  const str = document.getElementById("sourceString").value;
  document.getElementById("result").innerText = wasm_derivation(module, str);
}

wasm.initialize().then(wasm_module => {
  var run_keccak_button = document.getElementById("run-keccak");
  if (run_keccak_button) {
    run_keccak_button.removeAttribute("disabled");
    run_keccak_button.onclick = function() {
      produce_derivation(wasm_module);
    }
  }

  var run_math_button = document.getElementById("run-math");
  if (run_math_button) {
    run_math_button.removeAttribute("disabled");
    run_math_button.onclick = function() {
      produce_derivation(wasm_module);
    }
  }

  window.test = function() {
    var error = false;
    const example = "deuce clown universe brain thousand unique";
    const result = wasm_derivation(wasm_module, example);
    const expected = "1476782f2d9dd799f0bbdf2ed533fb0179902834d7d01f2c54ff9232d2cfa429";
    if (result !== expected) {
      console.error(`Error checking example string "${example}": expected "${expected}", got "${result}"`);
    } else {
      console.log("Test ok");
    }

    if (error) {
      return "Some test failed, see log above";
    } else {
      return "All tests passed, great!";
    }
  }
})