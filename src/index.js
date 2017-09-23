const wasm = require('./main.rs');
const utils = require('./utils.js');
const BN = require('bn.js');

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

function wasm_modexp(module, str) {
  const modexp = module.cwrap('modexp', 'void', ['number', 'number', 'number']);
  const malloc = module.cwrap('malloc', 'number', ['number']);
  const free = module.cwrap('free', 'void', ['number']);

  const source_ptr = malloc(32);
  const dest_ptr = malloc(32);

  const source = new BN(str, 10).toArray("le", 32);
  const source_buffer = new Uint8Array(module.wasmMemory.buffer, source_ptr, 32);
  for (var i = 0; i < 32; i++) {
    source_buffer[i] = source[i];
  }

  modexp(source_ptr, dest_ptr);

  const dest_buffer = new Uint8Array(module.wasmMemory.buffer, dest_ptr, 32);
  var result = [];
  for (var i = 0; i < 32; i ++) {
    result.push(dest_buffer[i]);
  }

  free(source_ptr);
  free(dest_ptr);

  return (new BN(result, 10, "le")).toString(10);
}

function produce_derivation(module) {
  const str = document.getElementById("sourceString").value;
  let result = document.getElementById("result");
  result.innerText = "computing...";
  result.innerText = wasm_derivation(module, str);
}

function process_modexp(module) {
  const str = document.getElementById("sourceString").value;
  let result = document.getElementById("result");
  result.innerText = "computing...";
  result.innerText = wasm_modexp(module, str);
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
      process_modexp(wasm_module);
    }
  }

  window.test = function() {
    var error = false;
    const example = "deuce clown universe brain thousand unique";
    const result = wasm_derivation(wasm_module, example);
    const expected = "1476782f2d9dd799f0bbdf2ed533fb0179902834d7d01f2c54ff9232d2cfa429";

    if (result !== expected) {
      console.error(`Error checking example string "${example}": expected "${expected}", got "${result}"`);
      error = true;
    } else {
      console.log("Test 1 ok");
    }

    const example2 = "1000000000";
    const result2 = wasm_modexp(wasm_module, example2);
    const expected2 = "129511937775246815794430130115251170553";

    if (result2 !== expected2) {
      console.error(`Error checking example number "${example2}": expected "${expected2}", got "${result2}"`);
      error = true;
    } else {
      console.log("Test 2 ok");
    }

    if (error) {
      return "Some test failed, see log above";
    } else {
      return "All tests passed, great!";
    }
  }
})