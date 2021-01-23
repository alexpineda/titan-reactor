
var createStormLib = (function() {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  if (typeof __filename !== 'undefined') _scriptDir = _scriptDir || __filename;
  return (
function(createStormLib) {
  createStormLib = createStormLib || {};



// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof createStormLib !== 'undefined' ? createStormLib : {};

// Set up the promise that indicates the Module is initialized
var readyPromiseResolve, readyPromiseReject;
Module['ready'] = new Promise(function(resolve, reject) {
  readyPromiseResolve = resolve;
  readyPromiseReject = reject;
});

      if (!Object.getOwnPropertyDescriptor(Module['ready'], '_Compress_PKLIB')) {
        Object.defineProperty(Module['ready'], '_Compress_PKLIB', { configurable: true, get: function() { abort('You are getting _Compress_PKLIB on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
        Object.defineProperty(Module['ready'], '_Compress_PKLIB', { configurable: true, set: function() { abort('You are setting _Compress_PKLIB on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
      }
    

      if (!Object.getOwnPropertyDescriptor(Module['ready'], '_Decompress_PKLIB')) {
        Object.defineProperty(Module['ready'], '_Decompress_PKLIB', { configurable: true, get: function() { abort('You are getting _Decompress_PKLIB on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
        Object.defineProperty(Module['ready'], '_Decompress_PKLIB', { configurable: true, set: function() { abort('You are setting _Decompress_PKLIB on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
      }
    

      if (!Object.getOwnPropertyDescriptor(Module['ready'], '_implode')) {
        Object.defineProperty(Module['ready'], '_implode', { configurable: true, get: function() { abort('You are getting _implode on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
        Object.defineProperty(Module['ready'], '_implode', { configurable: true, set: function() { abort('You are setting _implode on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
      }
    

      if (!Object.getOwnPropertyDescriptor(Module['ready'], '_malloc')) {
        Object.defineProperty(Module['ready'], '_malloc', { configurable: true, get: function() { abort('You are getting _malloc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
        Object.defineProperty(Module['ready'], '_malloc', { configurable: true, set: function() { abort('You are setting _malloc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
      }
    

      if (!Object.getOwnPropertyDescriptor(Module['ready'], '_free')) {
        Object.defineProperty(Module['ready'], '_free', { configurable: true, get: function() { abort('You are getting _free on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
        Object.defineProperty(Module['ready'], '_free', { configurable: true, set: function() { abort('You are setting _free on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
      }
    

      if (!Object.getOwnPropertyDescriptor(Module['ready'], '_crc32')) {
        Object.defineProperty(Module['ready'], '_crc32', { configurable: true, get: function() { abort('You are getting _crc32 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
        Object.defineProperty(Module['ready'], '_crc32', { configurable: true, set: function() { abort('You are setting _crc32 on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
      }
    

      if (!Object.getOwnPropertyDescriptor(Module['ready'], '_emscripten_stack_get_end')) {
        Object.defineProperty(Module['ready'], '_emscripten_stack_get_end', { configurable: true, get: function() { abort('You are getting _emscripten_stack_get_end on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
        Object.defineProperty(Module['ready'], '_emscripten_stack_get_end', { configurable: true, set: function() { abort('You are setting _emscripten_stack_get_end on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
      }
    

      if (!Object.getOwnPropertyDescriptor(Module['ready'], '_emscripten_stack_get_free')) {
        Object.defineProperty(Module['ready'], '_emscripten_stack_get_free', { configurable: true, get: function() { abort('You are getting _emscripten_stack_get_free on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
        Object.defineProperty(Module['ready'], '_emscripten_stack_get_free', { configurable: true, set: function() { abort('You are setting _emscripten_stack_get_free on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
      }
    

      if (!Object.getOwnPropertyDescriptor(Module['ready'], '_emscripten_stack_init')) {
        Object.defineProperty(Module['ready'], '_emscripten_stack_init', { configurable: true, get: function() { abort('You are getting _emscripten_stack_init on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
        Object.defineProperty(Module['ready'], '_emscripten_stack_init', { configurable: true, set: function() { abort('You are setting _emscripten_stack_init on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
      }
    

      if (!Object.getOwnPropertyDescriptor(Module['ready'], '_stackSave')) {
        Object.defineProperty(Module['ready'], '_stackSave', { configurable: true, get: function() { abort('You are getting _stackSave on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
        Object.defineProperty(Module['ready'], '_stackSave', { configurable: true, set: function() { abort('You are setting _stackSave on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
      }
    

      if (!Object.getOwnPropertyDescriptor(Module['ready'], '_stackRestore')) {
        Object.defineProperty(Module['ready'], '_stackRestore', { configurable: true, get: function() { abort('You are getting _stackRestore on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
        Object.defineProperty(Module['ready'], '_stackRestore', { configurable: true, set: function() { abort('You are setting _stackRestore on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
      }
    

      if (!Object.getOwnPropertyDescriptor(Module['ready'], '_stackAlloc')) {
        Object.defineProperty(Module['ready'], '_stackAlloc', { configurable: true, get: function() { abort('You are getting _stackAlloc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
        Object.defineProperty(Module['ready'], '_stackAlloc', { configurable: true, set: function() { abort('You are setting _stackAlloc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
      }
    

      if (!Object.getOwnPropertyDescriptor(Module['ready'], '___wasm_call_ctors')) {
        Object.defineProperty(Module['ready'], '___wasm_call_ctors', { configurable: true, get: function() { abort('You are getting ___wasm_call_ctors on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
        Object.defineProperty(Module['ready'], '___wasm_call_ctors', { configurable: true, set: function() { abort('You are setting ___wasm_call_ctors on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
      }
    

      if (!Object.getOwnPropertyDescriptor(Module['ready'], '___errno_location')) {
        Object.defineProperty(Module['ready'], '___errno_location', { configurable: true, get: function() { abort('You are getting ___errno_location on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
        Object.defineProperty(Module['ready'], '___errno_location', { configurable: true, set: function() { abort('You are setting ___errno_location on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
      }
    

      if (!Object.getOwnPropertyDescriptor(Module['ready'], 'onRuntimeInitialized')) {
        Object.defineProperty(Module['ready'], 'onRuntimeInitialized', { configurable: true, get: function() { abort('You are getting onRuntimeInitialized on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
        Object.defineProperty(Module['ready'], 'onRuntimeInitialized', { configurable: true, set: function() { abort('You are setting onRuntimeInitialized on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js') } });
      }
    

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)
// {{PRE_JSES}}

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
var key;
for (key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

var arguments_ = [];
var thisProgram = './this.program';
var quit_ = function(status, toThrow) {
  throw toThrow;
};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
ENVIRONMENT_IS_WEB = typeof window === 'object';
ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string';
ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (Module['ENVIRONMENT']) {
  throw new Error('Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -s ENVIRONMENT=web or -s ENVIRONMENT=node)');
}

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var read_,
    readAsync,
    readBinary,
    setWindowTitle;

var nodeFS;
var nodePath;

if (ENVIRONMENT_IS_NODE) {
  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = require('path').dirname(scriptDirectory) + '/';
  } else {
    scriptDirectory = __dirname + '/';
  }

// include: node_shell_read.js


read_ = function shell_read(filename, binary) {
  var ret = tryParseAsDataURI(filename);
  if (ret) {
    return binary ? ret : ret.toString();
  }
  if (!nodeFS) nodeFS = require('fs');
  if (!nodePath) nodePath = require('path');
  filename = nodePath['normalize'](filename);
  return nodeFS['readFileSync'](filename, binary ? null : 'utf8');
};

readBinary = function readBinary(filename) {
  var ret = read_(filename, true);
  if (!ret.buffer) {
    ret = new Uint8Array(ret);
  }
  assert(ret.buffer);
  return ret;
};

// end include: node_shell_read.js
  if (process['argv'].length > 1) {
    thisProgram = process['argv'][1].replace(/\\/g, '/');
  }

  arguments_ = process['argv'].slice(2);

  // MODULARIZE will export the module in the proper place outside, we don't need to export here

  process['on']('uncaughtException', function(ex) {
    // suppress ExitStatus exceptions from showing an error
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });

  process['on']('unhandledRejection', abort);

  quit_ = function(status) {
    process['exit'](status);
  };

  Module['inspect'] = function () { return '[Emscripten Module object]'; };

} else
if (ENVIRONMENT_IS_SHELL) {

  if (typeof read != 'undefined') {
    read_ = function shell_read(f) {
      var data = tryParseAsDataURI(f);
      if (data) {
        return intArrayToString(data);
      }
      return read(f);
    };
  }

  readBinary = function readBinary(f) {
    var data;
    data = tryParseAsDataURI(f);
    if (data) {
      return data;
    }
    if (typeof readbuffer === 'function') {
      return new Uint8Array(readbuffer(f));
    }
    data = read(f, 'binary');
    assert(typeof data === 'object');
    return data;
  };

  if (typeof scriptArgs != 'undefined') {
    arguments_ = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    arguments_ = arguments;
  }

  if (typeof quit === 'function') {
    quit_ = function(status) {
      quit(status);
    };
  }

  if (typeof print !== 'undefined') {
    // Prefer to use print/printErr where they exist, as they usually work better.
    if (typeof console === 'undefined') console = /** @type{!Console} */({});
    console.log = /** @type{!function(this:Console, ...*): undefined} */ (print);
    console.warn = console.error = /** @type{!function(this:Console, ...*): undefined} */ (typeof printErr !== 'undefined' ? printErr : print);
  }

} else

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (typeof document !== 'undefined' && document.currentScript) { // web
    scriptDirectory = document.currentScript.src;
  }
  // When MODULARIZE, this JS may be executed later, after document.currentScript
  // is gone, so we saved it, and we use it here instead of any other info.
  if (_scriptDir) {
    scriptDirectory = _scriptDir;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf('/')+1);
  } else {
    scriptDirectory = '';
  }

  // Differentiate the Web Worker from the Node Worker case, as reading must
  // be done differently.
  {

// include: web_or_worker_shell_read.js


  read_ = function shell_read(url) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
    } catch (err) {
      var data = tryParseAsDataURI(url);
      if (data) {
        return intArrayToString(data);
      }
      throw err;
    }
  };

  if (ENVIRONMENT_IS_WORKER) {
    readBinary = function readBinary(url) {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
        return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
      } catch (err) {
        var data = tryParseAsDataURI(url);
        if (data) {
          return data;
        }
        throw err;
      }
    };
  }

  readAsync = function readAsync(url, onload, onerror) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function xhr_onload() {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
        onload(xhr.response);
        return;
      }
      var data = tryParseAsDataURI(url);
      if (data) {
        onload(data.buffer);
        return;
      }
      onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
  };

// end include: web_or_worker_shell_read.js
  }

  setWindowTitle = function(title) { document.title = title };
} else
{
  throw new Error('environment detection error');
}

// Set up the out() and err() hooks, which are how we can print to stdout or
// stderr, respectively.
var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.warn.bind(console);

// Merge back in the overrides
for (key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = null;

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.
if (Module['arguments']) arguments_ = Module['arguments'];if (!Object.getOwnPropertyDescriptor(Module, 'arguments')) Object.defineProperty(Module, 'arguments', { configurable: true, get: function() { abort('Module.arguments has been replaced with plain arguments_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)') } });
if (Module['thisProgram']) thisProgram = Module['thisProgram'];if (!Object.getOwnPropertyDescriptor(Module, 'thisProgram')) Object.defineProperty(Module, 'thisProgram', { configurable: true, get: function() { abort('Module.thisProgram has been replaced with plain thisProgram (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)') } });
if (Module['quit']) quit_ = Module['quit'];if (!Object.getOwnPropertyDescriptor(Module, 'quit')) Object.defineProperty(Module, 'quit', { configurable: true, get: function() { abort('Module.quit has been replaced with plain quit_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)') } });

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
// Assertions on removed incoming Module JS APIs.
assert(typeof Module['memoryInitializerPrefixURL'] === 'undefined', 'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['pthreadMainPrefixURL'] === 'undefined', 'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['cdInitializerPrefixURL'] === 'undefined', 'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['filePackagePrefixURL'] === 'undefined', 'Module.filePackagePrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['read'] === 'undefined', 'Module.read option was removed (modify read_ in JS)');
assert(typeof Module['readAsync'] === 'undefined', 'Module.readAsync option was removed (modify readAsync in JS)');
assert(typeof Module['readBinary'] === 'undefined', 'Module.readBinary option was removed (modify readBinary in JS)');
assert(typeof Module['setWindowTitle'] === 'undefined', 'Module.setWindowTitle option was removed (modify setWindowTitle in JS)');
assert(typeof Module['TOTAL_MEMORY'] === 'undefined', 'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY');
if (!Object.getOwnPropertyDescriptor(Module, 'read')) Object.defineProperty(Module, 'read', { configurable: true, get: function() { abort('Module.read has been replaced with plain read_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)') } });
if (!Object.getOwnPropertyDescriptor(Module, 'readAsync')) Object.defineProperty(Module, 'readAsync', { configurable: true, get: function() { abort('Module.readAsync has been replaced with plain readAsync (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)') } });
if (!Object.getOwnPropertyDescriptor(Module, 'readBinary')) Object.defineProperty(Module, 'readBinary', { configurable: true, get: function() { abort('Module.readBinary has been replaced with plain readBinary (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)') } });
if (!Object.getOwnPropertyDescriptor(Module, 'setWindowTitle')) Object.defineProperty(Module, 'setWindowTitle', { configurable: true, get: function() { abort('Module.setWindowTitle has been replaced with plain setWindowTitle (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)') } });
var IDBFS = 'IDBFS is no longer included by default; build with -lidbfs.js';
var PROXYFS = 'PROXYFS is no longer included by default; build with -lproxyfs.js';
var WORKERFS = 'WORKERFS is no longer included by default; build with -lworkerfs.js';
var NODEFS = 'NODEFS is no longer included by default; build with -lnodefs.js';




var STACK_ALIGN = 16;

function alignMemory(size, factor) {
  if (!factor) factor = STACK_ALIGN; // stack alignment (16-byte) by default
  return Math.ceil(size / factor) * factor;
}

function getNativeTypeSize(type) {
  switch (type) {
    case 'i1': case 'i8': return 1;
    case 'i16': return 2;
    case 'i32': return 4;
    case 'i64': return 8;
    case 'float': return 4;
    case 'double': return 8;
    default: {
      if (type[type.length-1] === '*') {
        return 4; // A pointer
      } else if (type[0] === 'i') {
        var bits = Number(type.substr(1));
        assert(bits % 8 === 0, 'getNativeTypeSize invalid bits ' + bits + ', type ' + type);
        return bits / 8;
      } else {
        return 0;
      }
    }
  }
}

function warnOnce(text) {
  if (!warnOnce.shown) warnOnce.shown = {};
  if (!warnOnce.shown[text]) {
    warnOnce.shown[text] = 1;
    err(text);
  }
}

// include: runtime_functions.js


// Wraps a JS function as a wasm function with a given signature.
function convertJsFunctionToWasm(func, sig) {
  return func;
}

var freeTableIndexes = [];

// Weak map of functions in the table to their indexes, created on first use.
var functionsInTableMap;

function getEmptyTableSlot() {
  // Reuse a free index if there is one, otherwise grow.
  if (freeTableIndexes.length) {
    return freeTableIndexes.pop();
  }
  // Grow the table
  try {
    wasmTable.grow(1);
  } catch (err) {
    if (!(err instanceof RangeError)) {
      throw err;
    }
    throw 'Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.';
  }
  return wasmTable.length - 1;
}

// Add a wasm function to the table.
function addFunctionWasm(func, sig) {
  // Check if the function is already in the table, to ensure each function
  // gets a unique index. First, create the map if this is the first use.
  if (!functionsInTableMap) {
    functionsInTableMap = new WeakMap();
    for (var i = 0; i < wasmTable.length; i++) {
      var item = wasmTable.get(i);
      // Ignore null values.
      if (item) {
        functionsInTableMap.set(item, i);
      }
    }
  }
  if (functionsInTableMap.has(func)) {
    return functionsInTableMap.get(func);
  }

  // It's not in the table, add it now.

  var ret = getEmptyTableSlot();

  // Set the new value.
  try {
    // Attempting to call this with JS function will cause of table.set() to fail
    wasmTable.set(ret, func);
  } catch (err) {
    if (!(err instanceof TypeError)) {
      throw err;
    }
    assert(typeof sig !== 'undefined', 'Missing signature argument to addFunction: ' + func);
    var wrapped = convertJsFunctionToWasm(func, sig);
    wasmTable.set(ret, wrapped);
  }

  functionsInTableMap.set(func, ret);

  return ret;
}

function removeFunction(index) {
  functionsInTableMap.delete(wasmTable.get(index));
  freeTableIndexes.push(index);
}

// 'sig' parameter is required for the llvm backend but only when func is not
// already a WebAssembly function.
function addFunction(func, sig) {
  assert(typeof func !== 'undefined');

  return addFunctionWasm(func, sig);
}

// end include: runtime_functions.js
// include: runtime_debug.js


// end include: runtime_debug.js
function makeBigInt(low, high, unsigned) {
  return unsigned ? ((+((low>>>0)))+((+((high>>>0)))*4294967296.0)) : ((+((low>>>0)))+((+((high|0)))*4294967296.0));
}

var tempRet0 = 0;

var setTempRet0 = function(value) {
  tempRet0 = value;
};

var getTempRet0 = function() {
  return tempRet0;
};

function getCompilerSetting(name) {
  throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for getCompilerSetting or emscripten_get_compiler_setting to work';
}



// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary;if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];if (!Object.getOwnPropertyDescriptor(Module, 'wasmBinary')) Object.defineProperty(Module, 'wasmBinary', { configurable: true, get: function() { abort('Module.wasmBinary has been replaced with plain wasmBinary (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)') } });
var noExitRuntime;if (Module['noExitRuntime']) noExitRuntime = Module['noExitRuntime'];if (!Object.getOwnPropertyDescriptor(Module, 'noExitRuntime')) Object.defineProperty(Module, 'noExitRuntime', { configurable: true, get: function() { abort('Module.noExitRuntime has been replaced with plain noExitRuntime (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)') } });

// include: wasm2js.js


// wasm2js.js - enough of a polyfill for the WebAssembly object so that we can load
// wasm2js code that way.

// Emit "var WebAssembly" if definitely using wasm2js. Otherwise, in MAYBE_WASM2JS
// mode, we can't use a "var" since it would prevent normal wasm from working.
/** @suppress{duplicate, const} */
var
WebAssembly = {
  // Note that we do not use closure quoting (this['buffer'], etc.) on these
  // functions, as they are just meant for internal use. In other words, this is
  // not a fully general polyfill.
  Memory: function(opts) {
    this.buffer = new ArrayBuffer(opts['initial'] * 65536);
  },

  Module: function(binary) {
    // TODO: use the binary and info somehow - right now the wasm2js output is embedded in
    // the main JS
  },

  Instance: function(module, info) {
    // TODO: use the module and info somehow - right now the wasm2js output is embedded in
    // the main JS
    // This will be replaced by the actual wasm2js code.
    this.exports = (
function instantiate(asmLibraryArg) {
function Table(ret) {
  // grow method not included; table is not growable
  ret.set = function(i, func) {
    this[i] = func;
  };
  ret.get = function(i) {
    return this[i];
  };
  return ret;
}

  var bufferView;
  var base64ReverseLookup = new Uint8Array(123/*'z'+1*/);
  for (var i = 25; i >= 0; --i) {
    base64ReverseLookup[48+i] = 52+i; // '0-9'
    base64ReverseLookup[65+i] = i; // 'A-Z'
    base64ReverseLookup[97+i] = 26+i; // 'a-z'
  }
  base64ReverseLookup[43] = 62; // '+'
  base64ReverseLookup[47] = 63; // '/'
  /** @noinline Inlining this function would mean expanding the base64 string 4x times in the source code, which Closure seems to be happy to do. */
  function base64DecodeToExistingUint8Array(uint8Array, offset, b64) {
    var b1, b2, i = 0, j = offset, bLength = b64.length, end = offset + (bLength*3>>2) - (b64[bLength-2] == '=') - (b64[bLength-1] == '=');
    for (; i < bLength; i += 4) {
      b1 = base64ReverseLookup[b64.charCodeAt(i+1)];
      b2 = base64ReverseLookup[b64.charCodeAt(i+2)];
      uint8Array[j++] = base64ReverseLookup[b64.charCodeAt(i)] << 2 | b1 >> 4;
      if (j < end) uint8Array[j++] = b1 << 4 | b2 >> 2;
      if (j < end) uint8Array[j++] = b2 << 6 | base64ReverseLookup[b64.charCodeAt(i+3)];
    }
  }
function initActiveSegments(imports) {
  base64DecodeToExistingUint8Array(bufferView, 1024, "cEluZm8tPnBiSW5CdWZmIDw9IHBJbmZvLT5wYkluQnVmZkVuZABzdG9ybWxpYi5jcHAAUmVhZElucHV0RGF0YQBwSW5mby0+cGJPdXRCdWZmIDw9IHBJbmZvLT5wYk91dEJ1ZmZFbmQAV3JpdGVPdXRwdXREYXRhAA==");
  base64DecodeToExistingUint8Array(bufferView, 1152, "AgQEBQUFBQYGBgYGBgYGBgYGBgYGBgcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHCAgICAgICAgICAgICAgICAMNBRkJEQE+Hi4ONhYmBjoaKgoyEiJCAnw8XBxsLEwMdDRUFGQkRAR4OFgYaChICPBwsDDQUJAQ4GCgIMBAgAAAAAAAAAAAAAECAwQFBgcIAAABAAIAAwAEAAUABgAHAAgACgAOABYAJgBGAIYABgEDAgMDBAQEBQUFBQYGBgcHBQMBBgoCDBQEGAgwECBAAAsMDAwMDAwMDAgHDAwHDAwMDAwMDAwMDAwMDQwMDAwMBAoIDAoMCggHBwgJBwYHCAcGBwcHBwgHBwgIDAsHCQsMBgcGBgUHCAgGCwkGBwYGBwsGBgYHCQgJCQsICwkMCAwFBgYGBQYGBgULBwUGBQUGCgUFBQUIBwgICgsLDAwMDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDQwNDQ0MDQ0NDA0NDQ0MDQ0NDAwMDQ0NDQ0NDQ0NDQ2QBOAP4AfgC+AD4A3gBeAJ4AG4AGIA4A7gBiIA4ArgAuAM4ATgCOAAYA9gB2ALYANgDWAFQBJgCWABYA5gBmAKDwBQAjgAYAJQAGAMkAPYAEIAAgBYALABfAApADwAmABcAAkAHABsACwATAAYAAwAdADoAGgAYASQADQAsAAQB2AIMQBUABEAIQAXABQAqAAoAAEAEAMwAT4AZAAeAC4AJAAQBQ4ANgAWAEQAMADIANAB0AAQAUgAEAZQAWAAiACgDwcAJgAGADoAGwAaACoACgALABACBAATADIAAwAdABIAkAENABUABQAZAAgAeADwAHAAkAIQBBAAoAegC6ADQAJAHEAMQBRABEAYQAhAEEAAgB+AD4AXgAeAG4ALgBOAA4AdgA2AFYAFgBmACYARgAGAHoAOgBaABoAagAqAEoACgByADIAUgASAGIAIgBCAAAAfAA8AFwAHABsACwAToA2gBaAJoAGgDqAGoAqgAqAMoASgCKAAIA8gByALIAMgDSAFIAkgASAOIAYgCiACIAwgBCAIIADAD8AHwAvAA8ANwAXACcABwA7ABsAKwALADMAEwAjAAEAPQAdAC0ADAANADQAdAA0AFUAFAAUAGQAJQAkAEQABAB4ADkABABYABgAaQA5ABkAKAAoAEgACABwADAAUAAQAGAAIABAAAAAAAACWMAd3LGEO7rpRCZkZxG0Hj/RqcDWlY+mjlWSeMojbDqS43Hke6dXgiNnSlytMtgm9fLF+By2455Edv5BkELcd8iCwakhxufPeQb6EfdTaGuvk3W1RtdT0x4XTg1aYbBPAqGtkevli/ezJZYpPXAEU2WwGY2M9D/r1DQiNyCBuO14QaUzkQWDVcnFnotHkAzxH1ARL/YUN0mu1CqX6qLU1bJiyQtbJu9tA+bys42zYMnVc30XPDdbcWT3Rq6ww2SY6AN5RgFHXyBZh0L+19LQhI8SzVpmVus8Ppb24nrgCKAiIBV+y2QzGJOkLsYd8by8RTGhYqx1hwT0tZraQQdx2BnHbAbwg0pgqENXviYWxcR+1tgal5L+fM9S46KLJB3g0+QAPjqgJlhiYDuG7DWp/LT1tCJdsZJEBXGPm9FFra2JhbBzYMGWFTgBi8u2VBmx7pQEbwfQIglfED/XG2bBlUOm3Euq4vot8iLn83x3dYkkt2hXzfNOMZUzU+1hhsk3OUbU6dAC8o+Iwu9RBpd9K15XYPW3E0aT79NbTaulpQ/zZbjRGiGet0Lhg2nMtBETlHQMzX0wKqsl8Dd08cQVQqkECJxAQC76GIAzJJbVoV7OFbyAJ1Ga5n+Rhzg753l6YydkpIpjQsLSo18cXPbNZgQ20LjtcvbetbLrAIIO47bazv5oM4rYDmtKxdDlH1eqvd9KdFSbbBIMW3HMSC2PjhDtklD5qbQ2oWmp6C88O5J3/CZMnrgAKsZ4HfUSTD/DSowiHaPIBHv7CBmldV2L3y2dlgHE2bBnnBmtudhvU/uAr04laetoQzErdZ2/fufn5776OQ763F9WOsGDoo9bWfpPRocTC2DhS8t9P8We70WdXvKbdBrU/SzaySNorDdhMGwqv9koDNmB6BEHD72DfVd9nqO+ObjF5vmlGjLNhyxqDZryg0m8lNuJoUpV3DMwDRwu7uRYCIi8mBVW+O7rFKAu9spJatCsEarNcp//XwjHP0LWLntksHa7eW7DCZJsm8mPsnKNqdQqTbQKpBgmcPzYO64VnB3ITVwAFgkq/lRR6uOKuK7F7OBu2DJuO0pINvtXlt+/cfCHf2wvU0tOGQuLU8fiz3Whug9ofzRa+gVsmufbhd7Bvd0e3GOZaCIhwag//yjsGZlwLARH/nmWPaa5i+NP/a2FFz2wWeOIKoO7SDddUgwROwrMDOWEmZ6f3FmDQTUdpSdt3bj5KatGu3FrW2WYL30DwO9g3U668qcWeu95/z7JH6f+1MBzyvb2KwrrKMJOzU6ajtCQFNtC6kwbXzSlX3lS/Z9kjLnpms7hKYcQCG2hdlCtvKje+C7ShjgzDG98FWo3vAi1QDlAA");
  base64DecodeToExistingUint8Array(bufferView, 3156, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=");
}
function asmFunc(env) {
 var memory = env.memory;
 var buffer = memory.buffer;
 var HEAP8 = new Int8Array(buffer);
 var HEAP16 = new Int16Array(buffer);
 var HEAP32 = new Int32Array(buffer);
 var HEAPU8 = new Uint8Array(buffer);
 var HEAPU16 = new Uint16Array(buffer);
 var HEAPU32 = new Uint32Array(buffer);
 var HEAPF32 = new Float32Array(buffer);
 var HEAPF64 = new Float64Array(buffer);
 var Math_imul = Math.imul;
 var Math_fround = Math.fround;
 var Math_abs = Math.abs;
 var Math_clz32 = Math.clz32;
 var Math_min = Math.min;
 var Math_max = Math.max;
 var Math_floor = Math.floor;
 var Math_ceil = Math.ceil;
 var Math_trunc = Math.trunc;
 var Math_sqrt = Math.sqrt;
 var abort = env.abort;
 var nan = NaN;
 var infinity = Infinity;
 var fimport$0 = env.__assert_fail;
 var fimport$1 = env.emscripten_resize_heap;
 var fimport$2 = env.emscripten_memcpy_big;
 var global$0 = 5246544;
 var global$1 = 0;
 var global$2 = 0;
 // EMSCRIPTEN_START_FUNCS
;
 function $0() {
  $26();
 }
 
 function $1($0_1, $1_1, $2_1, $3_1, $4_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  var $7_1 = 0, $8_1 = 0, $51 = 0;
  $7_1 = global$0 - 64 | 0;
  global$0 = $7_1;
  $8_1 = 0;
  HEAP32[($7_1 + 56 | 0) >> 2] = $0_1;
  HEAP32[($7_1 + 52 | 0) >> 2] = $1_1;
  HEAP32[($7_1 + 48 | 0) >> 2] = $2_1;
  HEAP32[($7_1 + 44 | 0) >> 2] = $3_1;
  HEAP32[($7_1 + 40 | 0) >> 2] = $4_1;
  HEAP32[($7_1 + 20 | 0) >> 2] = $20(36312 | 0) | 0;
  HEAP32[($7_1 + 16 | 0) >> 2] = HEAP32[($7_1 + 40 | 0) >> 2] | 0;
  HEAP32[($7_1 + 12 | 0) >> 2] = $8_1;
  label$1 : {
   label$2 : {
    if (!((HEAP32[($7_1 + 20 | 0) >> 2] | 0 | 0) != ($8_1 | 0) & 1 | 0)) {
     break label$2
    }
    $24(HEAP32[($7_1 + 20 | 0) >> 2] | 0 | 0, 0 | 0, 36312 | 0) | 0;
    HEAP32[($7_1 + 24 | 0) >> 2] = HEAP32[($7_1 + 48 | 0) >> 2] | 0;
    HEAP32[($7_1 + 28 | 0) >> 2] = (HEAP32[($7_1 + 48 | 0) >> 2] | 0) + (HEAP32[($7_1 + 44 | 0) >> 2] | 0) | 0;
    HEAP32[($7_1 + 32 | 0) >> 2] = HEAP32[($7_1 + 56 | 0) >> 2] | 0;
    HEAP32[($7_1 + 36 | 0) >> 2] = (HEAP32[($7_1 + 56 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($7_1 + 52 | 0) >> 2] | 0) >> 2] | 0) | 0;
    HEAP32[($7_1 + 8 | 0) >> 2] = $5(1 | 0, 2 | 0, HEAP32[($7_1 + 20 | 0) >> 2] | 0 | 0, $7_1 + 24 | 0 | 0, $7_1 + 12 | 0 | 0, $7_1 + 16 | 0 | 0) | 0;
    label$3 : {
     if (HEAP32[($7_1 + 8 | 0) >> 2] | 0) {
      break label$3
     }
     HEAP32[(HEAP32[($7_1 + 52 | 0) >> 2] | 0) >> 2] = (HEAP32[($7_1 + 32 | 0) >> 2] | 0) - (HEAP32[($7_1 + 56 | 0) >> 2] | 0) | 0;
    }
    $21(HEAP32[($7_1 + 20 | 0) >> 2] | 0 | 0);
    HEAP32[($7_1 + 60 | 0) >> 2] = HEAP32[($7_1 + 8 | 0) >> 2] | 0;
    break label$1;
   }
   HEAP32[($7_1 + 60 | 0) >> 2] = 4;
  }
  $51 = HEAP32[($7_1 + 60 | 0) >> 2] | 0;
  global$0 = $7_1 + 64 | 0;
  return $51 | 0;
 }
 
 function $2($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $27_1 = 0, $43 = 0;
  $5_1 = global$0 - 32 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 28 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 24 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 20 | 0) >> 2] = $2_1;
  HEAP32[($5_1 + 16 | 0) >> 2] = HEAP32[($5_1 + 20 | 0) >> 2] | 0;
  HEAP32[($5_1 + 12 | 0) >> 2] = (HEAP32[((HEAP32[($5_1 + 16 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) - (HEAP32[(HEAP32[($5_1 + 16 | 0) >> 2] | 0) >> 2] | 0) | 0;
  HEAP32[($5_1 + 8 | 0) >> 2] = HEAP32[(HEAP32[($5_1 + 24 | 0) >> 2] | 0) >> 2] | 0;
  label$1 : {
   if (!((HEAP32[($5_1 + 8 | 0) >> 2] | 0) >>> 0 > (HEAP32[($5_1 + 12 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
    break label$1
   }
   HEAP32[($5_1 + 8 | 0) >> 2] = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
  }
  $23(HEAP32[($5_1 + 28 | 0) >> 2] | 0 | 0, HEAP32[(HEAP32[($5_1 + 16 | 0) >> 2] | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  $27_1 = HEAP32[($5_1 + 16 | 0) >> 2] | 0;
  HEAP32[$27_1 >> 2] = (HEAP32[$27_1 >> 2] | 0) + (HEAP32[($5_1 + 8 | 0) >> 2] | 0) | 0;
  label$2 : {
   if ((HEAP32[(HEAP32[($5_1 + 16 | 0) >> 2] | 0) >> 2] | 0) >>> 0 <= (HEAP32[((HEAP32[($5_1 + 16 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) >>> 0 & 1 | 0) {
    break label$2
   }
   fimport$0(1024 | 0, 1062 | 0, 50 | 0, 1075 | 0);
   abort();
  }
  $43 = HEAP32[($5_1 + 8 | 0) >> 2] | 0;
  global$0 = $5_1 + 32 | 0;
  return $43 | 0;
 }
 
 function $3($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $27_1 = 0;
  $5_1 = global$0 - 32 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 28 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 24 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 20 | 0) >> 2] = $2_1;
  HEAP32[($5_1 + 16 | 0) >> 2] = HEAP32[($5_1 + 20 | 0) >> 2] | 0;
  HEAP32[($5_1 + 12 | 0) >> 2] = (HEAP32[((HEAP32[($5_1 + 16 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0) - (HEAP32[((HEAP32[($5_1 + 16 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0) | 0;
  HEAP32[($5_1 + 8 | 0) >> 2] = HEAP32[(HEAP32[($5_1 + 24 | 0) >> 2] | 0) >> 2] | 0;
  label$1 : {
   if (!((HEAP32[($5_1 + 8 | 0) >> 2] | 0) >>> 0 > (HEAP32[($5_1 + 12 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
    break label$1
   }
   HEAP32[($5_1 + 8 | 0) >> 2] = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
  }
  $23(HEAP32[((HEAP32[($5_1 + 16 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 28 | 0) >> 2] | 0 | 0, HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0) | 0;
  $27_1 = HEAP32[($5_1 + 16 | 0) >> 2] | 0;
  HEAP32[($27_1 + 8 | 0) >> 2] = (HEAP32[($27_1 + 8 | 0) >> 2] | 0) + (HEAP32[($5_1 + 8 | 0) >> 2] | 0) | 0;
  label$2 : {
   if ((HEAP32[((HEAP32[($5_1 + 16 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0) >>> 0 <= (HEAP32[((HEAP32[($5_1 + 16 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0) >>> 0 & 1 | 0) {
    break label$2
   }
   fimport$0(1089 | 0, 1062 | 0, 74 | 0, 1129 | 0);
   abort();
  }
  global$0 = $5_1 + 32 | 0;
  return;
 }
 
 function $4($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $6_1 = 0, $50 = 0;
  $6_1 = global$0 - 48 | 0;
  global$0 = $6_1;
  HEAP32[($6_1 + 40 | 0) >> 2] = $0_1;
  HEAP32[($6_1 + 36 | 0) >> 2] = $1_1;
  HEAP32[($6_1 + 32 | 0) >> 2] = $2_1;
  HEAP32[($6_1 + 28 | 0) >> 2] = $3_1;
  HEAP32[($6_1 + 4 | 0) >> 2] = $20(12596 | 0) | 0;
  label$1 : {
   label$2 : {
    if (!((HEAP32[($6_1 + 4 | 0) >> 2] | 0 | 0) == (0 | 0) & 1 | 0)) {
     break label$2
    }
    HEAP32[($6_1 + 44 | 0) >> 2] = 0;
    break label$1;
   }
   $24(HEAP32[($6_1 + 4 | 0) >> 2] | 0 | 0, 0 | 0, 12596 | 0) | 0;
   HEAP32[($6_1 + 8 | 0) >> 2] = HEAP32[($6_1 + 32 | 0) >> 2] | 0;
   HEAP32[($6_1 + 12 | 0) >> 2] = (HEAP32[($6_1 + 32 | 0) >> 2] | 0) + (HEAP32[($6_1 + 28 | 0) >> 2] | 0) | 0;
   HEAP32[($6_1 + 16 | 0) >> 2] = HEAP32[($6_1 + 40 | 0) >> 2] | 0;
   HEAP32[($6_1 + 20 | 0) >> 2] = (HEAP32[($6_1 + 40 | 0) >> 2] | 0) + (HEAP32[(HEAP32[($6_1 + 36 | 0) >> 2] | 0) >> 2] | 0) | 0;
   $11(1 | 0, 2 | 0, HEAP32[($6_1 + 4 | 0) >> 2] | 0 | 0, $6_1 + 8 | 0 | 0) | 0;
   label$3 : {
    if (!((HEAP32[($6_1 + 16 | 0) >> 2] | 0 | 0) == (HEAP32[($6_1 + 40 | 0) >> 2] | 0 | 0) & 1 | 0)) {
     break label$3
    }
    $21(HEAP32[($6_1 + 4 | 0) >> 2] | 0 | 0);
    HEAP32[($6_1 + 44 | 0) >> 2] = 0;
    break label$1;
   }
   HEAP32[(HEAP32[($6_1 + 36 | 0) >> 2] | 0) >> 2] = (HEAP32[($6_1 + 16 | 0) >> 2] | 0) - (HEAP32[($6_1 + 40 | 0) >> 2] | 0) | 0;
   $21(HEAP32[($6_1 + 4 | 0) >> 2] | 0 | 0);
   HEAP32[($6_1 + 44 | 0) >> 2] = 1;
  }
  $50 = HEAP32[($6_1 + 44 | 0) >> 2] | 0;
  global$0 = $6_1 + 48 | 0;
  return $50 | 0;
 }
 
 function $5($0_1, $1_1, $2_1, $3_1, $4_1, $5_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  $4_1 = $4_1 | 0;
  $5_1 = $5_1 | 0;
  var $8_1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, i64toi32_i32$2 = 0, $198 = 0, $224 = 0, $202 = 0, $228 = 0, $27_1 = 0, $34 = 0, $38 = 0, $42 = 0, $46 = 0, $52 = 0, $54 = 0, $200 = 0, $204 = 0, $207 = 0, $210 = 0, $213 = 0, $216 = 0, $219 = 0, $226 = 0, $230 = 0, $233 = 0, $236 = 0, $239 = 0, $242 = 0, $245 = 0, $680 = 0, $690 = 0, $700 = 0, $710 = 0, $720 = 0, $730 = 0, $740 = 0, $750 = 0, $759 = 0, $769 = 0, $779 = 0, $789 = 0, $799 = 0, $809 = 0, $819 = 0, $829 = 0, $250 = 0;
  $8_1 = global$0 - 48 | 0;
  global$0 = $8_1;
  HEAP32[($8_1 + 40 | 0) >> 2] = $0_1;
  HEAP32[($8_1 + 36 | 0) >> 2] = $1_1;
  HEAP32[($8_1 + 32 | 0) >> 2] = $2_1;
  HEAP32[($8_1 + 28 | 0) >> 2] = $3_1;
  HEAP32[($8_1 + 24 | 0) >> 2] = $4_1;
  HEAP32[($8_1 + 20 | 0) >> 2] = $5_1;
  HEAP32[($8_1 + 16 | 0) >> 2] = HEAP32[($8_1 + 32 | 0) >> 2] | 0;
  HEAP32[((HEAP32[($8_1 + 16 | 0) >> 2] | 0) + 2484 | 0) >> 2] = HEAP32[($8_1 + 40 | 0) >> 2] | 0;
  HEAP32[((HEAP32[($8_1 + 16 | 0) >> 2] | 0) + 2488 | 0) >> 2] = HEAP32[($8_1 + 36 | 0) >> 2] | 0;
  HEAP32[((HEAP32[($8_1 + 16 | 0) >> 2] | 0) + 24 | 0) >> 2] = HEAP32[(HEAP32[($8_1 + 20 | 0) >> 2] | 0) >> 2] | 0;
  HEAP32[((HEAP32[($8_1 + 16 | 0) >> 2] | 0) + 20 | 0) >> 2] = HEAP32[(HEAP32[($8_1 + 24 | 0) >> 2] | 0) >> 2] | 0;
  HEAP32[((HEAP32[($8_1 + 16 | 0) >> 2] | 0) + 2480 | 0) >> 2] = HEAP32[($8_1 + 28 | 0) >> 2] | 0;
  HEAP32[((HEAP32[($8_1 + 16 | 0) >> 2] | 0) + 12 | 0) >> 2] = 4;
  HEAP32[((HEAP32[($8_1 + 16 | 0) >> 2] | 0) + 16 | 0) >> 2] = 15;
  $27_1 = HEAP32[(HEAP32[($8_1 + 20 | 0) >> 2] | 0) >> 2] | 0;
  label$1 : {
   label$2 : {
    label$3 : {
     label$4 : {
      if (($27_1 | 0) == (1024 | 0)) {
       break label$4
      }
      label$5 : {
       if (($27_1 | 0) == (2048 | 0)) {
        break label$5
       }
       if (($27_1 | 0) != (4096 | 0)) {
        break label$3
       }
       $34 = HEAP32[($8_1 + 16 | 0) >> 2] | 0;
       HEAP32[($34 + 12 | 0) >> 2] = (HEAP32[($34 + 12 | 0) >> 2] | 0) + 1 | 0;
       $38 = HEAP32[($8_1 + 16 | 0) >> 2] | 0;
       HEAP32[($38 + 16 | 0) >> 2] = HEAP32[($38 + 16 | 0) >> 2] | 0 | 32 | 0;
      }
      $42 = HEAP32[($8_1 + 16 | 0) >> 2] | 0;
      HEAP32[($42 + 12 | 0) >> 2] = (HEAP32[($42 + 12 | 0) >> 2] | 0) + 1 | 0;
      $46 = HEAP32[($8_1 + 16 | 0) >> 2] | 0;
      HEAP32[($46 + 16 | 0) >> 2] = HEAP32[($46 + 16 | 0) >> 2] | 0 | 16 | 0;
     }
     break label$2;
    }
    HEAP32[($8_1 + 44 | 0) >> 2] = 1;
    break label$1;
   }
   $52 = HEAP32[(HEAP32[($8_1 + 24 | 0) >> 2] | 0) >> 2] | 0;
   label$6 : {
    label$7 : {
     switch ($52 | 0) {
     case 0:
      $54 = 0;
      HEAP32[($8_1 + 12 | 0) >> 2] = $54;
      HEAP32[($8_1 + 8 | 0) >> 2] = $54;
      label$10 : {
       label$11 : while (1) {
        if (!((HEAP32[($8_1 + 8 | 0) >> 2] | 0) >>> 0 < 256 >>> 0 & 1 | 0)) {
         break label$10
        }
        HEAP8[(((HEAP32[($8_1 + 16 | 0) >> 2] | 0) + 156 | 0) + (HEAP32[($8_1 + 8 | 0) >> 2] | 0) | 0) >> 0] = 9;
        HEAP16[(((HEAP32[($8_1 + 16 | 0) >> 2] | 0) + 930 | 0) + ((HEAP32[($8_1 + 8 | 0) >> 2] | 0) << 1 | 0) | 0) >> 1] = HEAP32[($8_1 + 12 | 0) >> 2] | 0;
        HEAP32[($8_1 + 12 | 0) >> 2] = ((HEAP32[($8_1 + 12 | 0) >> 2] | 0) & 65535 | 0) + 2 | 0;
        HEAP32[($8_1 + 8 | 0) >> 2] = (HEAP32[($8_1 + 8 | 0) >> 2] | 0) + 1 | 0;
        continue label$11;
       };
      }
      break label$6;
     case 1:
      HEAP32[($8_1 + 8 | 0) >> 2] = 0;
      label$12 : {
       label$13 : while (1) {
        if (!((HEAP32[($8_1 + 8 | 0) >> 2] | 0) >>> 0 < 256 >>> 0 & 1 | 0)) {
         break label$12
        }
        HEAP8[(((HEAP32[($8_1 + 16 | 0) >> 2] | 0) + 156 | 0) + (HEAP32[($8_1 + 8 | 0) >> 2] | 0) | 0) >> 0] = ((HEAPU8[((HEAP32[($8_1 + 8 | 0) >> 2] | 0) + 1360 | 0) >> 0] | 0) & 255 | 0) + 1 | 0;
        HEAP16[(((HEAP32[($8_1 + 16 | 0) >> 2] | 0) + 930 | 0) + ((HEAP32[($8_1 + 8 | 0) >> 2] | 0) << 1 | 0) | 0) >> 1] = ((HEAPU16[(1616 + ((HEAP32[($8_1 + 8 | 0) >> 2] | 0) << 1 | 0) | 0) >> 1] | 0) & 65535 | 0) << 1 | 0;
        HEAP32[($8_1 + 8 | 0) >> 2] = (HEAP32[($8_1 + 8 | 0) >> 2] | 0) + 1 | 0;
        continue label$13;
       };
      }
      break label$6;
     default:
      break label$7;
     };
    }
    HEAP32[($8_1 + 44 | 0) >> 2] = 2;
    break label$1;
   }
   HEAP32[($8_1 + 4 | 0) >> 2] = 0;
   label$14 : {
    label$15 : while (1) {
     if (!((HEAP32[($8_1 + 4 | 0) >> 2] | 0) >>> 0 < 16 >>> 0 & 1 | 0)) {
      break label$14
     }
     HEAP32[$8_1 >> 2] = 0;
     label$16 : {
      label$17 : while (1) {
       if (!((HEAP32[$8_1 >> 2] | 0 | 0) < (1 << ((HEAPU8[((HEAP32[($8_1 + 4 | 0) >> 2] | 0) + 1280 | 0) >> 0] | 0) & 255 | 0) | 0 | 0) & 1 | 0)) {
        break label$16
       }
       HEAP8[(((HEAP32[($8_1 + 16 | 0) >> 2] | 0) + 156 | 0) + (HEAP32[($8_1 + 8 | 0) >> 2] | 0) | 0) >> 0] = (((HEAPU8[((HEAP32[($8_1 + 4 | 0) >> 2] | 0) + 1280 | 0) >> 0] | 0) & 255 | 0) + ((HEAPU8[((HEAP32[($8_1 + 4 | 0) >> 2] | 0) + 1328 | 0) >> 0] | 0) & 255 | 0) | 0) + 1 | 0;
       HEAP16[(((HEAP32[($8_1 + 16 | 0) >> 2] | 0) + 930 | 0) + ((HEAP32[($8_1 + 8 | 0) >> 2] | 0) << 1 | 0) | 0) >> 1] = (HEAP32[$8_1 >> 2] | 0) << (((HEAPU8[((HEAP32[($8_1 + 4 | 0) >> 2] | 0) + 1328 | 0) >> 0] | 0) & 255 | 0) + 1 | 0) | 0 | ((((HEAPU8[((HEAP32[($8_1 + 4 | 0) >> 2] | 0) + 1344 | 0) >> 0] | 0) & 255 | 0) & -65281 | 0) << 1 | 0) | 0 | 1 | 0;
       HEAP32[($8_1 + 8 | 0) >> 2] = (HEAP32[($8_1 + 8 | 0) >> 2] | 0) + 1 | 0;
       HEAP32[$8_1 >> 2] = (HEAP32[$8_1 >> 2] | 0) + 1 | 0;
       continue label$17;
      };
     }
     HEAP32[($8_1 + 4 | 0) >> 2] = (HEAP32[($8_1 + 4 | 0) >> 2] | 0) + 1 | 0;
     continue label$15;
    };
   }
   $198 = (HEAP32[($8_1 + 16 | 0) >> 2] | 0) + 92 | 0;
   i64toi32_i32$2 = 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1216 | 0) >> 2] | 0;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1220 | 0) >> 2] | 0;
   $680 = i64toi32_i32$0;
   i64toi32_i32$0 = $198;
   HEAP32[i64toi32_i32$0 >> 2] = $680;
   HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
   $200 = 56;
   $202 = 1216;
   i64toi32_i32$2 = $202 + $200 | 0;
   i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
   $690 = i64toi32_i32$1;
   i64toi32_i32$1 = $198 + $200 | 0;
   HEAP32[i64toi32_i32$1 >> 2] = $690;
   HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
   $204 = 48;
   i64toi32_i32$2 = $202 + $204 | 0;
   i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
   $700 = i64toi32_i32$0;
   i64toi32_i32$0 = $198 + $204 | 0;
   HEAP32[i64toi32_i32$0 >> 2] = $700;
   HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
   $207 = 40;
   i64toi32_i32$2 = $202 + $207 | 0;
   i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
   $710 = i64toi32_i32$1;
   i64toi32_i32$1 = $198 + $207 | 0;
   HEAP32[i64toi32_i32$1 >> 2] = $710;
   HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
   $210 = 32;
   i64toi32_i32$2 = $202 + $210 | 0;
   i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
   $720 = i64toi32_i32$0;
   i64toi32_i32$0 = $198 + $210 | 0;
   HEAP32[i64toi32_i32$0 >> 2] = $720;
   HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
   $213 = 24;
   i64toi32_i32$2 = $202 + $213 | 0;
   i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
   $730 = i64toi32_i32$1;
   i64toi32_i32$1 = $198 + $213 | 0;
   HEAP32[i64toi32_i32$1 >> 2] = $730;
   HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
   $216 = 16;
   i64toi32_i32$2 = $202 + $216 | 0;
   i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
   $740 = i64toi32_i32$0;
   i64toi32_i32$0 = $198 + $216 | 0;
   HEAP32[i64toi32_i32$0 >> 2] = $740;
   HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
   $219 = 8;
   i64toi32_i32$2 = $202 + $219 | 0;
   i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
   $750 = i64toi32_i32$1;
   i64toi32_i32$1 = $198 + $219 | 0;
   HEAP32[i64toi32_i32$1 >> 2] = $750;
   HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
   $224 = (HEAP32[($8_1 + 16 | 0) >> 2] | 0) + 28 | 0;
   i64toi32_i32$2 = 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1152 | 0) >> 2] | 0;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1156 | 0) >> 2] | 0;
   $759 = i64toi32_i32$0;
   i64toi32_i32$0 = $224;
   HEAP32[i64toi32_i32$0 >> 2] = $759;
   HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
   $226 = 56;
   $228 = 1152;
   i64toi32_i32$2 = $228 + $226 | 0;
   i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
   $769 = i64toi32_i32$1;
   i64toi32_i32$1 = $224 + $226 | 0;
   HEAP32[i64toi32_i32$1 >> 2] = $769;
   HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
   $230 = 48;
   i64toi32_i32$2 = $228 + $230 | 0;
   i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
   $779 = i64toi32_i32$0;
   i64toi32_i32$0 = $224 + $230 | 0;
   HEAP32[i64toi32_i32$0 >> 2] = $779;
   HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
   $233 = 40;
   i64toi32_i32$2 = $228 + $233 | 0;
   i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
   $789 = i64toi32_i32$1;
   i64toi32_i32$1 = $224 + $233 | 0;
   HEAP32[i64toi32_i32$1 >> 2] = $789;
   HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
   $236 = 32;
   i64toi32_i32$2 = $228 + $236 | 0;
   i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
   $799 = i64toi32_i32$0;
   i64toi32_i32$0 = $224 + $236 | 0;
   HEAP32[i64toi32_i32$0 >> 2] = $799;
   HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
   $239 = 24;
   i64toi32_i32$2 = $228 + $239 | 0;
   i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
   $809 = i64toi32_i32$1;
   i64toi32_i32$1 = $224 + $239 | 0;
   HEAP32[i64toi32_i32$1 >> 2] = $809;
   HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
   $242 = 16;
   i64toi32_i32$2 = $228 + $242 | 0;
   i64toi32_i32$0 = HEAP32[i64toi32_i32$2 >> 2] | 0;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
   $819 = i64toi32_i32$0;
   i64toi32_i32$0 = $224 + $242 | 0;
   HEAP32[i64toi32_i32$0 >> 2] = $819;
   HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
   $245 = 8;
   i64toi32_i32$2 = $228 + $245 | 0;
   i64toi32_i32$1 = HEAP32[i64toi32_i32$2 >> 2] | 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 4 | 0) >> 2] | 0;
   $829 = i64toi32_i32$1;
   i64toi32_i32$1 = $224 + $245 | 0;
   HEAP32[i64toi32_i32$1 >> 2] = $829;
   HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
   $6(HEAP32[($8_1 + 16 | 0) >> 2] | 0 | 0);
   HEAP32[($8_1 + 44 | 0) >> 2] = 0;
  }
  $250 = HEAP32[($8_1 + 44 | 0) >> 2] | 0;
  global$0 = $8_1 + 48 | 0;
  return $250 | 0;
 }
 
 function $6($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $5_1 = 0, $74 = 0, $409 = 0;
  $3_1 = global$0 - 48 | 0;
  global$0 = $3_1;
  $5_1 = 0;
  HEAP32[($3_1 + 44 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 36 | 0) >> 2] = (((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 10188 | 0) + (HEAP32[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 24 | 0) >> 2] | 0) | 0) + 516 | 0;
  HEAP32[($3_1 + 32 | 0) >> 2] = $5_1;
  HEAP32[($3_1 + 24 | 0) >> 2] = $5_1;
  HEAP32[($3_1 + 16 | 0) >> 2] = $5_1;
  HEAP8[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 8138 | 0) >> 0] = HEAP32[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 20 | 0) >> 2] | 0;
  HEAP8[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 8139 | 0) >> 0] = HEAP32[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0;
  HEAP32[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 4 | 0) >> 2] = 2;
  $24(((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 8138 | 0) + 2 | 0 | 0, 0 | 0, 2048 | 0) | 0;
  HEAP32[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 8 | 0) >> 2] = 0;
  label$1 : {
   label$2 : {
    label$3 : while (1) {
     if (HEAP32[($3_1 + 32 | 0) >> 2] | 0) {
      break label$2
     }
     HEAP32[($3_1 + 12 | 0) >> 2] = 4096;
     HEAP32[($3_1 + 8 | 0) >> 2] = 0;
     label$4 : {
      label$5 : while (1) {
       if (!(HEAP32[($3_1 + 12 | 0) >> 2] | 0)) {
        break label$4
       }
       HEAP32[($3_1 + 4 | 0) >> 2] = FUNCTION_TABLE[HEAP32[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 2484 | 0) >> 2] | 0 | 0](((((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 10188 | 0) + (HEAP32[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 24 | 0) >> 2] | 0) | 0) + 516 | 0) + (HEAP32[($3_1 + 8 | 0) >> 2] | 0) | 0, $3_1 + 12 | 0, HEAP32[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 2480 | 0) >> 2] | 0) | 0;
       label$6 : {
        if (HEAP32[($3_1 + 4 | 0) >> 2] | 0) {
         break label$6
        }
        label$7 : {
         if (HEAP32[($3_1 + 8 | 0) >> 2] | 0) {
          break label$7
         }
         if (HEAP32[($3_1 + 16 | 0) >> 2] | 0) {
          break label$7
         }
         break label$1;
        }
        HEAP32[($3_1 + 32 | 0) >> 2] = 1;
        break label$4;
       }
       HEAP32[($3_1 + 12 | 0) >> 2] = (HEAP32[($3_1 + 12 | 0) >> 2] | 0) - (HEAP32[($3_1 + 4 | 0) >> 2] | 0) | 0;
       HEAP32[($3_1 + 8 | 0) >> 2] = (HEAP32[($3_1 + 8 | 0) >> 2] | 0) + (HEAP32[($3_1 + 4 | 0) >> 2] | 0) | 0;
       continue label$5;
      };
     }
     HEAP32[($3_1 + 40 | 0) >> 2] = (((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 10188 | 0) + (HEAP32[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 24 | 0) >> 2] | 0) | 0) + (HEAP32[($3_1 + 8 | 0) >> 2] | 0) | 0;
     label$8 : {
      if (!(HEAP32[($3_1 + 32 | 0) >> 2] | 0)) {
       break label$8
      }
      HEAP32[($3_1 + 40 | 0) >> 2] = (HEAP32[($3_1 + 40 | 0) >> 2] | 0) + 516 | 0;
     }
     $74 = HEAP32[($3_1 + 16 | 0) >> 2] | 0;
     label$9 : {
      label$10 : {
       switch ($74 | 0) {
       case 0:
        $7(HEAP32[($3_1 + 44 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 36 | 0) >> 2] | 0 | 0, (HEAP32[($3_1 + 40 | 0) >> 2] | 0) + 1 | 0 | 0);
        HEAP32[($3_1 + 16 | 0) >> 2] = (HEAP32[($3_1 + 16 | 0) >> 2] | 0) + 1 | 0;
        label$13 : {
         if (!((HEAP32[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 24 | 0) >> 2] | 0 | 0) != (4096 | 0) & 1 | 0)) {
          break label$13
         }
         HEAP32[($3_1 + 16 | 0) >> 2] = (HEAP32[($3_1 + 16 | 0) >> 2] | 0) + 1 | 0;
        }
        break label$9;
       case 1:
        $7(HEAP32[($3_1 + 44 | 0) >> 2] | 0 | 0, ((HEAP32[($3_1 + 36 | 0) >> 2] | 0) + (0 - (HEAP32[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 24 | 0) >> 2] | 0) | 0) | 0) + 516 | 0 | 0, (HEAP32[($3_1 + 40 | 0) >> 2] | 0) + 1 | 0 | 0);
        HEAP32[($3_1 + 16 | 0) >> 2] = (HEAP32[($3_1 + 16 | 0) >> 2] | 0) + 1 | 0;
        break label$9;
       default:
        break label$10;
       };
      }
      $7(HEAP32[($3_1 + 44 | 0) >> 2] | 0 | 0, (HEAP32[($3_1 + 36 | 0) >> 2] | 0) + (0 - (HEAP32[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 24 | 0) >> 2] | 0) | 0) | 0 | 0, (HEAP32[($3_1 + 40 | 0) >> 2] | 0) + 1 | 0 | 0);
     }
     label$14 : {
      label$15 : while (1) {
       if (!((HEAP32[($3_1 + 36 | 0) >> 2] | 0) >>> 0 < (HEAP32[($3_1 + 40 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
        break label$14
       }
       HEAP32[($3_1 + 20 | 0) >> 2] = $8(HEAP32[($3_1 + 44 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 36 | 0) >> 2] | 0 | 0) | 0;
       label$16 : {
        label$17 : {
         label$18 : {
          label$19 : {
           label$20 : while (1) {
            if (!(HEAP32[($3_1 + 20 | 0) >> 2] | 0)) {
             break label$17
            }
            label$21 : {
             if (!((HEAP32[($3_1 + 20 | 0) >> 2] | 0 | 0) == (2 | 0) & 1 | 0)) {
              break label$21
             }
             if (!((HEAP32[(HEAP32[($3_1 + 44 | 0) >> 2] | 0) >> 2] | 0) >>> 0 >= 256 >>> 0 & 1 | 0)) {
              break label$21
             }
             break label$17;
            }
            label$22 : {
             if (!(HEAP32[($3_1 + 32 | 0) >> 2] | 0)) {
              break label$22
             }
             if (!(((HEAP32[($3_1 + 36 | 0) >> 2] | 0) + (HEAP32[($3_1 + 20 | 0) >> 2] | 0) | 0) >>> 0 > (HEAP32[($3_1 + 40 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
              break label$22
             }
             HEAP32[($3_1 + 20 | 0) >> 2] = (HEAP32[($3_1 + 40 | 0) >> 2] | 0) - (HEAP32[($3_1 + 36 | 0) >> 2] | 0) | 0;
             label$23 : {
              if (!((HEAP32[($3_1 + 20 | 0) >> 2] | 0) >>> 0 < 2 >>> 0 & 1 | 0)) {
               break label$23
              }
              break label$17;
             }
             label$24 : {
              if (!((HEAP32[($3_1 + 20 | 0) >> 2] | 0 | 0) == (2 | 0) & 1 | 0)) {
               break label$24
              }
              if (!((HEAP32[(HEAP32[($3_1 + 44 | 0) >> 2] | 0) >> 2] | 0) >>> 0 >= 256 >>> 0 & 1 | 0)) {
               break label$24
              }
              break label$17;
             }
             break label$18;
            }
            label$25 : {
             label$26 : {
              if ((HEAP32[($3_1 + 20 | 0) >> 2] | 0) >>> 0 >= 8 >>> 0 & 1 | 0) {
               break label$26
              }
              if (!(((HEAP32[($3_1 + 36 | 0) >> 2] | 0) + 1 | 0) >>> 0 >= (HEAP32[($3_1 + 40 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
               break label$25
              }
             }
             break label$18;
            }
            HEAP32[($3_1 + 28 | 0) >> 2] = HEAP32[($3_1 + 20 | 0) >> 2] | 0;
            HEAP32[($3_1 + 24 | 0) >> 2] = HEAP32[(HEAP32[($3_1 + 44 | 0) >> 2] | 0) >> 2] | 0;
            HEAP32[($3_1 + 20 | 0) >> 2] = $8(HEAP32[($3_1 + 44 | 0) >> 2] | 0 | 0, (HEAP32[($3_1 + 36 | 0) >> 2] | 0) + 1 | 0 | 0) | 0;
            if (!((HEAP32[($3_1 + 20 | 0) >> 2] | 0) >>> 0 > (HEAP32[($3_1 + 28 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
             break label$19
            }
            label$27 : {
             label$28 : {
              if ((HEAP32[($3_1 + 20 | 0) >> 2] | 0) >>> 0 > ((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 1 | 0) >>> 0 & 1 | 0) {
               break label$28
              }
              if (!((HEAP32[($3_1 + 24 | 0) >> 2] | 0) >>> 0 > 128 >>> 0 & 1 | 0)) {
               break label$27
              }
             }
             $9(HEAP32[($3_1 + 44 | 0) >> 2] | 0 | 0, (HEAPU8[(((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 156 | 0) + ((HEAPU8[(HEAP32[($3_1 + 36 | 0) >> 2] | 0) >> 0] | 0) & 255 | 0) | 0) >> 0] | 0) & 255 | 0 | 0, (HEAPU16[(((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 930 | 0) + (((HEAPU8[(HEAP32[($3_1 + 36 | 0) >> 2] | 0) >> 0] | 0) & 255 | 0) << 1 | 0) | 0) >> 1] | 0) & 65535 | 0 | 0);
             HEAP32[($3_1 + 36 | 0) >> 2] = (HEAP32[($3_1 + 36 | 0) >> 2] | 0) + 1 | 0;
             continue label$20;
            }
            break label$20;
           };
          }
          HEAP32[($3_1 + 20 | 0) >> 2] = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
          HEAP32[(HEAP32[($3_1 + 44 | 0) >> 2] | 0) >> 2] = HEAP32[($3_1 + 24 | 0) >> 2] | 0;
         }
         $9(HEAP32[($3_1 + 44 | 0) >> 2] | 0 | 0, (HEAPU8[(((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 156 | 0) + ((HEAP32[($3_1 + 20 | 0) >> 2] | 0) + 254 | 0) | 0) >> 0] | 0) & 255 | 0 | 0, (HEAPU16[(((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 930 | 0) + (((HEAP32[($3_1 + 20 | 0) >> 2] | 0) + 254 | 0) << 1 | 0) | 0) >> 1] | 0) & 65535 | 0 | 0);
         label$29 : {
          label$30 : {
           if (!((HEAP32[($3_1 + 20 | 0) >> 2] | 0 | 0) == (2 | 0) & 1 | 0)) {
            break label$30
           }
           $9(HEAP32[($3_1 + 44 | 0) >> 2] | 0 | 0, (HEAPU8[(((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 28 | 0) + ((HEAP32[(HEAP32[($3_1 + 44 | 0) >> 2] | 0) >> 2] | 0) >>> 2 | 0) | 0) >> 0] | 0) & 255 | 0 | 0, (HEAPU8[(((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 92 | 0) + ((HEAP32[(HEAP32[($3_1 + 44 | 0) >> 2] | 0) >> 2] | 0) >>> 2 | 0) | 0) >> 0] | 0) & 255 | 0 | 0);
           $9(HEAP32[($3_1 + 44 | 0) >> 2] | 0 | 0, 2 | 0, (HEAP32[(HEAP32[($3_1 + 44 | 0) >> 2] | 0) >> 2] | 0) & 3 | 0 | 0);
           break label$29;
          }
          $9(HEAP32[($3_1 + 44 | 0) >> 2] | 0 | 0, (HEAPU8[(((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 28 | 0) + ((HEAP32[(HEAP32[($3_1 + 44 | 0) >> 2] | 0) >> 2] | 0) >>> (HEAP32[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0) | 0) | 0) >> 0] | 0) & 255 | 0 | 0, (HEAPU8[(((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 92 | 0) + ((HEAP32[(HEAP32[($3_1 + 44 | 0) >> 2] | 0) >> 2] | 0) >>> (HEAP32[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0) | 0) | 0) >> 0] | 0) & 255 | 0 | 0);
          $9(HEAP32[($3_1 + 44 | 0) >> 2] | 0 | 0, HEAP32[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0 | 0, (HEAP32[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 16 | 0) >> 2] | 0) & (HEAP32[(HEAP32[($3_1 + 44 | 0) >> 2] | 0) >> 2] | 0) | 0 | 0);
         }
         HEAP32[($3_1 + 36 | 0) >> 2] = (HEAP32[($3_1 + 36 | 0) >> 2] | 0) + (HEAP32[($3_1 + 20 | 0) >> 2] | 0) | 0;
         break label$16;
        }
        $9(HEAP32[($3_1 + 44 | 0) >> 2] | 0 | 0, (HEAPU8[(((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 156 | 0) + ((HEAPU8[(HEAP32[($3_1 + 36 | 0) >> 2] | 0) >> 0] | 0) & 255 | 0) | 0) >> 0] | 0) & 255 | 0 | 0, (HEAPU16[(((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 930 | 0) + (((HEAPU8[(HEAP32[($3_1 + 36 | 0) >> 2] | 0) >> 0] | 0) & 255 | 0) << 1 | 0) | 0) >> 1] | 0) & 65535 | 0 | 0);
        HEAP32[($3_1 + 36 | 0) >> 2] = (HEAP32[($3_1 + 36 | 0) >> 2] | 0) + 1 | 0;
       }
       continue label$15;
      };
     }
     label$31 : {
      if (HEAP32[($3_1 + 32 | 0) >> 2] | 0) {
       break label$31
      }
      HEAP32[($3_1 + 36 | 0) >> 2] = (HEAP32[($3_1 + 36 | 0) >> 2] | 0) + -4096 | 0;
      $25((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 10188 | 0 | 0, ((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 10188 | 0) + 4096 | 0 | 0, (HEAP32[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 24 | 0) >> 2] | 0) + 516 | 0 | 0) | 0;
     }
     continue label$3;
    };
   }
  }
  $9(HEAP32[($3_1 + 44 | 0) >> 2] | 0 | 0, (HEAPU8[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 929 | 0) >> 0] | 0) & 255 | 0 | 0, (HEAPU16[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 2476 | 0) >> 1] | 0) & 65535 | 0 | 0);
  label$32 : {
   if (!(HEAP32[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0)) {
    break label$32
   }
   $409 = HEAP32[($3_1 + 44 | 0) >> 2] | 0;
   HEAP32[($409 + 4 | 0) >> 2] = (HEAP32[($409 + 4 | 0) >> 2] | 0) + 1 | 0;
  }
  FUNCTION_TABLE[HEAP32[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 2488 | 0) >> 2] | 0 | 0]((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 8138 | 0, (HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 4 | 0, HEAP32[((HEAP32[($3_1 + 44 | 0) >> 2] | 0) + 2480 | 0) >> 2] | 0);
  global$0 = $3_1 + 48 | 0;
  return;
 }
 
 function $7($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $21_1 = 0, $29_1 = 0, $33 = 0, $74 = 0, $93 = 0;
  $5_1 = global$0 - 32 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 28 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 24 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 20 | 0) >> 2] = $2_1;
  HEAP16[($5_1 + 10 | 0) >> 1] = 0;
  $24((HEAP32[($5_1 + 28 | 0) >> 2] | 0) + 3528 | 0 | 0, 0 | 0, 4608 | 0) | 0;
  HEAP32[($5_1 + 12 | 0) >> 2] = HEAP32[($5_1 + 24 | 0) >> 2] | 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[($5_1 + 12 | 0) >> 2] | 0) >>> 0 < (HEAP32[($5_1 + 20 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
     break label$1
    }
    $21_1 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
    $29_1 = 1;
    $33 = ((HEAP32[($5_1 + 28 | 0) >> 2] | 0) + ((((HEAPU8[$21_1 >> 0] | 0) << 2 | 0) + Math_imul(HEAPU8[($21_1 + 1 | 0) >> 0] | 0, 5) | 0) << $29_1 | 0) | 0) + 3528 | 0;
    HEAP16[$33 >> 1] = (HEAPU16[$33 >> 1] | 0) + $29_1 | 0;
    HEAP32[($5_1 + 12 | 0) >> 2] = (HEAP32[($5_1 + 12 | 0) >> 2] | 0) + 1 | 0;
    continue label$2;
   };
  }
  HEAP32[($5_1 + 16 | 0) >> 2] = (HEAP32[($5_1 + 28 | 0) >> 2] | 0) + 3528 | 0;
  label$3 : {
   label$4 : while (1) {
    if (!((HEAP32[($5_1 + 16 | 0) >> 2] | 0) >>> 0 < ((HEAP32[($5_1 + 28 | 0) >> 2] | 0) + 8136 | 0) >>> 0 & 1 | 0)) {
     break label$3
    }
    HEAP16[($5_1 + 10 | 0) >> 1] = ((HEAPU16[($5_1 + 10 | 0) >> 1] | 0) & 65535 | 0) + ((HEAPU16[(HEAP32[($5_1 + 16 | 0) >> 2] | 0) >> 1] | 0) & 65535 | 0) | 0;
    HEAP16[(HEAP32[($5_1 + 16 | 0) >> 2] | 0) >> 1] = HEAPU16[($5_1 + 10 | 0) >> 1] | 0;
    HEAP32[($5_1 + 16 | 0) >> 2] = (HEAP32[($5_1 + 16 | 0) >> 2] | 0) + 2 | 0;
    continue label$4;
   };
  }
  HEAP32[($5_1 + 20 | 0) >> 2] = (HEAP32[($5_1 + 20 | 0) >> 2] | 0) + -1 | 0;
  label$5 : {
   label$6 : while (1) {
    if (!((HEAP32[($5_1 + 20 | 0) >> 2] | 0) >>> 0 >= (HEAP32[($5_1 + 24 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
     break label$5
    }
    $74 = HEAP32[($5_1 + 20 | 0) >> 2] | 0;
    HEAP32[($5_1 + 4 | 0) >> 2] = ((HEAPU8[$74 >> 0] | 0) << 2 | 0) + Math_imul(HEAPU8[($74 + 1 | 0) >> 0] | 0, 5) | 0;
    HEAP16[($5_1 + 2 | 0) >> 1] = ((HEAP32[($5_1 + 20 | 0) >> 2] | 0) - (HEAP32[($5_1 + 28 | 0) >> 2] | 0) | 0) + -10188 | 0;
    $93 = ((HEAP32[($5_1 + 28 | 0) >> 2] | 0) + ((HEAP32[($5_1 + 4 | 0) >> 2] | 0) << 1 | 0) | 0) + 3528 | 0;
    HEAP16[$93 >> 1] = (HEAPU16[$93 >> 1] | 0) + -1 | 0;
    HEAP16[(((HEAP32[($5_1 + 28 | 0) >> 2] | 0) + 18896 | 0) + (((HEAPU16[(((HEAP32[($5_1 + 28 | 0) >> 2] | 0) + 3528 | 0) + ((HEAP32[($5_1 + 4 | 0) >> 2] | 0) << 1 | 0) | 0) >> 1] | 0) & 65535 | 0) << 1 | 0) | 0) >> 1] = HEAPU16[($5_1 + 2 | 0) >> 1] | 0;
    HEAP32[($5_1 + 20 | 0) >> 2] = (HEAP32[($5_1 + 20 | 0) >> 2] | 0) + -1 | 0;
    continue label$6;
   };
  }
  global$0 = $5_1 + 32 | 0;
  return;
 }
 
 function $8($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $194 = 0, $229 = 0, $239 = 0, $269 = 0, $323 = 0, $324 = 0, $329 = 0, $486 = 0, $523 = 0, $546 = 0, $603 = 0, $604 = 0, $609 = 0, $327 = 0, $607 = 0;
  $4_1 = global$0 - 64 | 0;
  HEAP32[($4_1 + 56 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 52 | 0) >> 2] = $1_1;
  HEAP32[($4_1 + 12 | 0) >> 2] = 1;
  HEAP32[($4_1 + 48 | 0) >> 2] = ((HEAP32[($4_1 + 56 | 0) >> 2] | 0) + 3528 | 0) + (((((HEAPU8[(HEAP32[($4_1 + 52 | 0) >> 2] | 0) >> 0] | 0) & 255 | 0) << 2 | 0) + Math_imul((HEAPU8[((HEAP32[($4_1 + 52 | 0) >> 2] | 0) + 1 | 0) >> 0] | 0) & 255 | 0, 5) | 0) << 1 | 0) | 0;
  HEAP16[($4_1 + 24 | 0) >> 1] = (((HEAP32[($4_1 + 52 | 0) >> 2] | 0) - ((HEAP32[($4_1 + 56 | 0) >> 2] | 0) + 10188 | 0) | 0) - (HEAP32[((HEAP32[($4_1 + 56 | 0) >> 2] | 0) + 24 | 0) >> 2] | 0) | 0) + 1 | 0;
  HEAP16[($4_1 + 26 | 0) >> 1] = HEAPU16[(HEAP32[($4_1 + 48 | 0) >> 2] | 0) >> 1] | 0;
  HEAP32[($4_1 + 44 | 0) >> 2] = ((HEAP32[($4_1 + 56 | 0) >> 2] | 0) + 18896 | 0) + (((HEAPU16[($4_1 + 26 | 0) >> 1] | 0) & 65535 | 0) << 1 | 0) | 0;
  label$1 : {
   if (!(((HEAPU16[(HEAP32[($4_1 + 44 | 0) >> 2] | 0) >> 1] | 0) & 65535 | 0 | 0) < ((HEAPU16[($4_1 + 24 | 0) >> 1] | 0) & 65535 | 0 | 0) & 1 | 0)) {
    break label$1
   }
   label$2 : {
    label$3 : while (1) {
     if (!(((HEAPU16[(HEAP32[($4_1 + 44 | 0) >> 2] | 0) >> 1] | 0) & 65535 | 0 | 0) < ((HEAPU16[($4_1 + 24 | 0) >> 1] | 0) & 65535 | 0 | 0) & 1 | 0)) {
      break label$2
     }
     HEAP16[($4_1 + 26 | 0) >> 1] = (HEAPU16[($4_1 + 26 | 0) >> 1] | 0) + 1 | 0;
     HEAP32[($4_1 + 44 | 0) >> 2] = (HEAP32[($4_1 + 44 | 0) >> 2] | 0) + 2 | 0;
     continue label$3;
    };
   }
   HEAP16[(HEAP32[($4_1 + 48 | 0) >> 2] | 0) >> 1] = HEAPU16[($4_1 + 26 | 0) >> 1] | 0;
  }
  HEAP32[($4_1 + 44 | 0) >> 2] = ((HEAP32[($4_1 + 56 | 0) >> 2] | 0) + 18896 | 0) + (((HEAPU16[($4_1 + 26 | 0) >> 1] | 0) & 65535 | 0) << 1 | 0) | 0;
  HEAP32[($4_1 + 36 | 0) >> 2] = ((HEAP32[($4_1 + 56 | 0) >> 2] | 0) + 10188 | 0) + ((HEAPU16[(HEAP32[($4_1 + 44 | 0) >> 2] | 0) >> 1] | 0) & 65535 | 0) | 0;
  HEAP32[($4_1 + 40 | 0) >> 2] = (HEAP32[($4_1 + 52 | 0) >> 2] | 0) + -1 | 0;
  label$4 : {
   label$5 : {
    if (!((HEAP32[($4_1 + 36 | 0) >> 2] | 0) >>> 0 >= (HEAP32[($4_1 + 40 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
     break label$5
    }
    HEAP32[($4_1 + 60 | 0) >> 2] = 0;
    break label$4;
   }
   HEAP32[($4_1 + 28 | 0) >> 2] = HEAP32[($4_1 + 52 | 0) >> 2] | 0;
   label$6 : {
    label$7 : while (1) {
     label$8 : {
      if (!(((HEAPU8[(HEAP32[($4_1 + 28 | 0) >> 2] | 0) >> 0] | 0) & 255 | 0 | 0) == ((HEAPU8[(HEAP32[($4_1 + 36 | 0) >> 2] | 0) >> 0] | 0) & 255 | 0 | 0) & 1 | 0)) {
       break label$8
      }
      if (!(((HEAPU8[((HEAP32[($4_1 + 28 | 0) >> 2] | 0) + ((HEAP32[($4_1 + 12 | 0) >> 2] | 0) - 1 | 0) | 0) >> 0] | 0) & 255 | 0 | 0) == ((HEAPU8[((HEAP32[($4_1 + 36 | 0) >> 2] | 0) + ((HEAP32[($4_1 + 12 | 0) >> 2] | 0) - 1 | 0) | 0) >> 0] | 0) & 255 | 0 | 0) & 1 | 0)) {
       break label$8
      }
      HEAP32[($4_1 + 36 | 0) >> 2] = (HEAP32[($4_1 + 36 | 0) >> 2] | 0) + 1 | 0;
      HEAP32[($4_1 + 28 | 0) >> 2] = (HEAP32[($4_1 + 28 | 0) >> 2] | 0) + 1 | 0;
      HEAP32[($4_1 + 16 | 0) >> 2] = 2;
      label$9 : {
       label$10 : while (1) {
        if (!((HEAP32[($4_1 + 16 | 0) >> 2] | 0) >>> 0 < 516 >>> 0 & 1 | 0)) {
         break label$9
        }
        HEAP32[($4_1 + 36 | 0) >> 2] = (HEAP32[($4_1 + 36 | 0) >> 2] | 0) + 1 | 0;
        HEAP32[($4_1 + 28 | 0) >> 2] = (HEAP32[($4_1 + 28 | 0) >> 2] | 0) + 1 | 0;
        label$11 : {
         if (!(((HEAPU8[(HEAP32[($4_1 + 36 | 0) >> 2] | 0) >> 0] | 0) & 255 | 0 | 0) != ((HEAPU8[(HEAP32[($4_1 + 28 | 0) >> 2] | 0) >> 0] | 0) & 255 | 0 | 0) & 1 | 0)) {
          break label$11
         }
         break label$9;
        }
        HEAP32[($4_1 + 16 | 0) >> 2] = (HEAP32[($4_1 + 16 | 0) >> 2] | 0) + 1 | 0;
        continue label$10;
       };
      }
      HEAP32[($4_1 + 28 | 0) >> 2] = HEAP32[($4_1 + 52 | 0) >> 2] | 0;
      label$12 : {
       if (!((HEAP32[($4_1 + 16 | 0) >> 2] | 0) >>> 0 >= (HEAP32[($4_1 + 12 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
        break label$12
       }
       HEAP32[(HEAP32[($4_1 + 56 | 0) >> 2] | 0) >> 2] = (((HEAP32[($4_1 + 52 | 0) >> 2] | 0) - (HEAP32[($4_1 + 36 | 0) >> 2] | 0) | 0) + (HEAP32[($4_1 + 16 | 0) >> 2] | 0) | 0) - 1 | 0;
       $194 = HEAP32[($4_1 + 16 | 0) >> 2] | 0;
       HEAP32[($4_1 + 12 | 0) >> 2] = $194;
       label$13 : {
        if (!($194 >>> 0 > 10 >>> 0 & 1 | 0)) {
         break label$13
        }
        break label$6;
       }
      }
     }
     HEAP16[($4_1 + 26 | 0) >> 1] = (HEAPU16[($4_1 + 26 | 0) >> 1] | 0) + 1 | 0;
     HEAP32[($4_1 + 44 | 0) >> 2] = (HEAP32[($4_1 + 44 | 0) >> 2] | 0) + 2 | 0;
     HEAP32[($4_1 + 36 | 0) >> 2] = ((HEAP32[($4_1 + 56 | 0) >> 2] | 0) + 10188 | 0) + ((HEAPU16[(HEAP32[($4_1 + 44 | 0) >> 2] | 0) >> 1] | 0) & 65535 | 0) | 0;
     label$14 : {
      if (!((HEAP32[($4_1 + 36 | 0) >> 2] | 0) >>> 0 >= (HEAP32[($4_1 + 40 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
       break label$14
      }
      label$15 : {
       label$16 : {
        if (!((HEAP32[($4_1 + 12 | 0) >> 2] | 0) >>> 0 >= 2 >>> 0 & 1 | 0)) {
         break label$16
        }
        $229 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
        break label$15;
       }
       $229 = 0;
      }
      HEAP32[($4_1 + 60 | 0) >> 2] = $229;
      break label$4;
     }
     continue label$7;
    };
   }
   label$17 : {
    if (!((HEAP32[($4_1 + 16 | 0) >> 2] | 0 | 0) == (516 | 0) & 1 | 0)) {
     break label$17
    }
    $239 = HEAP32[($4_1 + 56 | 0) >> 2] | 0;
    HEAP32[$239 >> 2] = (HEAP32[$239 >> 2] | 0) + -1 | 0;
    HEAP32[($4_1 + 60 | 0) >> 2] = HEAP32[($4_1 + 16 | 0) >> 2] | 0;
    break label$4;
   }
   HEAP32[($4_1 + 44 | 0) >> 2] = ((HEAP32[($4_1 + 56 | 0) >> 2] | 0) + 18896 | 0) + (((HEAPU16[($4_1 + 26 | 0) >> 1] | 0) & 65535 | 0) << 1 | 0) | 0;
   label$18 : {
    if (!((((HEAP32[($4_1 + 56 | 0) >> 2] | 0) + 10188 | 0) + ((HEAPU16[((HEAP32[($4_1 + 44 | 0) >> 2] | 0) + 2 | 0) >> 1] | 0) & 65535 | 0) | 0) >>> 0 >= (HEAP32[($4_1 + 40 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
     break label$18
    }
    HEAP32[($4_1 + 60 | 0) >> 2] = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
    break label$4;
   }
   $269 = 0;
   HEAP16[((HEAP32[($4_1 + 56 | 0) >> 2] | 0) + 2492 | 0) >> 1] = 65535;
   HEAP16[((HEAP32[($4_1 + 56 | 0) >> 2] | 0) + 2494 | 0) >> 1] = $269;
   HEAP16[($4_1 + 4 | 0) >> 1] = $269;
   HEAP16[($4_1 + 22 | 0) >> 1] = 1;
   label$19 : {
    label$20 : while (1) {
     if (!(((HEAPU16[($4_1 + 22 | 0) >> 1] | 0) & 65535 | 0) >>> 0 < (HEAP32[($4_1 + 12 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
      break label$19
     }
     label$21 : {
      if (!(((HEAPU8[((HEAP32[($4_1 + 52 | 0) >> 2] | 0) + ((HEAPU16[($4_1 + 22 | 0) >> 1] | 0) & 65535 | 0) | 0) >> 0] | 0) & 255 | 0 | 0) != ((HEAPU8[((HEAP32[($4_1 + 52 | 0) >> 2] | 0) + ((HEAPU16[($4_1 + 4 | 0) >> 1] | 0) & 65535 | 0) | 0) >> 0] | 0) & 255 | 0 | 0) & 1 | 0)) {
       break label$21
      }
      HEAP16[($4_1 + 4 | 0) >> 1] = HEAPU16[(((HEAP32[($4_1 + 56 | 0) >> 2] | 0) + 2492 | 0) + (((HEAPU16[($4_1 + 4 | 0) >> 1] | 0) & 65535 | 0) << 1 | 0) | 0) >> 1] | 0;
      label$22 : {
       if (!(((HEAPU16[($4_1 + 4 | 0) >> 1] | 0) & 65535 | 0 | 0) != (65535 | 0) & 1 | 0)) {
        break label$22
       }
       continue label$20;
      }
     }
     $323 = 1;
     $324 = (HEAPU16[($4_1 + 4 | 0) >> 1] | 0) + $323 | 0;
     HEAP16[($4_1 + 4 | 0) >> 1] = $324;
     $327 = (HEAP32[($4_1 + 56 | 0) >> 2] | 0) + 2492 | 0;
     $329 = (HEAPU16[($4_1 + 22 | 0) >> 1] | 0) + $323 | 0;
     HEAP16[($4_1 + 22 | 0) >> 1] = $329;
     HEAP16[($327 + (($329 & 65535 | 0) << 1 | 0) | 0) >> 1] = $324;
     continue label$20;
    };
   }
   HEAP32[($4_1 + 36 | 0) >> 2] = ((HEAP32[($4_1 + 56 | 0) >> 2] | 0) + 10188 | 0) + ((HEAPU16[(HEAP32[($4_1 + 44 | 0) >> 2] | 0) >> 1] | 0) & 65535 | 0) | 0;
   HEAP32[($4_1 + 32 | 0) >> 2] = (HEAP32[($4_1 + 36 | 0) >> 2] | 0) + (HEAP32[($4_1 + 12 | 0) >> 2] | 0) | 0;
   HEAP32[($4_1 + 8 | 0) >> 2] = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
   label$23 : while (1) {
    HEAP32[($4_1 + 8 | 0) >> 2] = (HEAPU16[(((HEAP32[($4_1 + 56 | 0) >> 2] | 0) + 2492 | 0) + ((HEAP32[($4_1 + 8 | 0) >> 2] | 0) << 1 | 0) | 0) >> 1] | 0) & 65535 | 0;
    label$24 : {
     if (!((HEAP32[($4_1 + 8 | 0) >> 2] | 0 | 0) == (65535 | 0) & 1 | 0)) {
      break label$24
     }
     HEAP32[($4_1 + 8 | 0) >> 2] = 0;
    }
    HEAP32[($4_1 + 44 | 0) >> 2] = ((HEAP32[($4_1 + 56 | 0) >> 2] | 0) + 18896 | 0) + (((HEAPU16[($4_1 + 26 | 0) >> 1] | 0) & 65535 | 0) << 1 | 0) | 0;
    label$25 : while (1) {
     HEAP32[($4_1 + 44 | 0) >> 2] = (HEAP32[($4_1 + 44 | 0) >> 2] | 0) + 2 | 0;
     HEAP16[($4_1 + 26 | 0) >> 1] = (HEAPU16[($4_1 + 26 | 0) >> 1] | 0) + 1 | 0;
     HEAP32[($4_1 + 36 | 0) >> 2] = ((HEAP32[($4_1 + 56 | 0) >> 2] | 0) + 10188 | 0) + ((HEAPU16[(HEAP32[($4_1 + 44 | 0) >> 2] | 0) >> 1] | 0) & 65535 | 0) | 0;
     label$26 : {
      if (!((HEAP32[($4_1 + 36 | 0) >> 2] | 0) >>> 0 >= (HEAP32[($4_1 + 40 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
       break label$26
      }
      HEAP32[($4_1 + 60 | 0) >> 2] = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
      break label$4;
     }
     if (((HEAP32[($4_1 + 36 | 0) >> 2] | 0) + (HEAP32[($4_1 + 8 | 0) >> 2] | 0) | 0) >>> 0 < (HEAP32[($4_1 + 32 | 0) >> 2] | 0) >>> 0 & 1 | 0) {
      continue label$25
     }
     break label$25;
    };
    HEAP8[($4_1 + 7 | 0) >> 0] = HEAPU8[((HEAP32[($4_1 + 52 | 0) >> 2] | 0) + ((HEAP32[($4_1 + 12 | 0) >> 2] | 0) - 2 | 0) | 0) >> 0] | 0;
    label$27 : {
     label$28 : {
      if (!(((HEAPU8[($4_1 + 7 | 0) >> 0] | 0) & 255 | 0 | 0) == ((HEAPU8[((HEAP32[($4_1 + 36 | 0) >> 2] | 0) + ((HEAP32[($4_1 + 12 | 0) >> 2] | 0) - 2 | 0) | 0) >> 0] | 0) & 255 | 0 | 0) & 1 | 0)) {
       break label$28
      }
      label$29 : {
       if (!(((HEAP32[($4_1 + 36 | 0) >> 2] | 0) + (HEAP32[($4_1 + 8 | 0) >> 2] | 0) | 0 | 0) != (HEAP32[($4_1 + 32 | 0) >> 2] | 0 | 0) & 1 | 0)) {
        break label$29
       }
       HEAP32[($4_1 + 32 | 0) >> 2] = HEAP32[($4_1 + 36 | 0) >> 2] | 0;
       HEAP32[($4_1 + 8 | 0) >> 2] = 0;
      }
      break label$27;
     }
     HEAP32[($4_1 + 44 | 0) >> 2] = ((HEAP32[($4_1 + 56 | 0) >> 2] | 0) + 18896 | 0) + (((HEAPU16[($4_1 + 26 | 0) >> 1] | 0) & 65535 | 0) << 1 | 0) | 0;
     label$30 : while (1) {
      HEAP32[($4_1 + 44 | 0) >> 2] = (HEAP32[($4_1 + 44 | 0) >> 2] | 0) + 2 | 0;
      HEAP16[($4_1 + 26 | 0) >> 1] = (HEAPU16[($4_1 + 26 | 0) >> 1] | 0) + 1 | 0;
      HEAP32[($4_1 + 36 | 0) >> 2] = ((HEAP32[($4_1 + 56 | 0) >> 2] | 0) + 10188 | 0) + ((HEAPU16[(HEAP32[($4_1 + 44 | 0) >> 2] | 0) >> 1] | 0) & 65535 | 0) | 0;
      label$31 : {
       if (!((HEAP32[($4_1 + 36 | 0) >> 2] | 0) >>> 0 >= (HEAP32[($4_1 + 40 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
        break label$31
       }
       HEAP32[($4_1 + 60 | 0) >> 2] = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
       break label$4;
      }
      $486 = 1;
      label$32 : {
       if (((HEAPU8[((HEAP32[($4_1 + 36 | 0) >> 2] | 0) + ((HEAP32[($4_1 + 12 | 0) >> 2] | 0) - 2 | 0) | 0) >> 0] | 0) & 255 | 0 | 0) != ((HEAPU8[($4_1 + 7 | 0) >> 0] | 0) & 255 | 0 | 0) & 1 | 0) {
        break label$32
       }
       $486 = ((HEAPU8[(HEAP32[($4_1 + 36 | 0) >> 2] | 0) >> 0] | 0) & 255 | 0 | 0) != ((HEAPU8[(HEAP32[($4_1 + 52 | 0) >> 2] | 0) >> 0] | 0) & 255 | 0 | 0);
      }
      if ($486 & 1 | 0) {
       continue label$30
      }
      break label$30;
     };
     HEAP32[($4_1 + 32 | 0) >> 2] = (HEAP32[($4_1 + 36 | 0) >> 2] | 0) + 2 | 0;
     HEAP32[($4_1 + 8 | 0) >> 2] = 2;
    }
    label$33 : {
     label$34 : while (1) {
      if (!(((HEAPU8[(HEAP32[($4_1 + 32 | 0) >> 2] | 0) >> 0] | 0) & 255 | 0 | 0) == ((HEAPU8[((HEAP32[($4_1 + 52 | 0) >> 2] | 0) + (HEAP32[($4_1 + 8 | 0) >> 2] | 0) | 0) >> 0] | 0) & 255 | 0 | 0) & 1 | 0)) {
       break label$33
      }
      $523 = (HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 1 | 0;
      HEAP32[($4_1 + 8 | 0) >> 2] = $523;
      label$35 : {
       if (!($523 >>> 0 >= 516 >>> 0 & 1 | 0)) {
        break label$35
       }
       break label$33;
      }
      HEAP32[($4_1 + 32 | 0) >> 2] = (HEAP32[($4_1 + 32 | 0) >> 2] | 0) + 1 | 0;
      continue label$34;
     };
    }
    label$36 : {
     if (!((HEAP32[($4_1 + 8 | 0) >> 2] | 0) >>> 0 >= (HEAP32[($4_1 + 12 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
      break label$36
     }
     HEAP32[(HEAP32[($4_1 + 56 | 0) >> 2] | 0) >> 2] = ((HEAP32[($4_1 + 52 | 0) >> 2] | 0) - (HEAP32[($4_1 + 36 | 0) >> 2] | 0) | 0) - 1 | 0;
     $546 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
     HEAP32[($4_1 + 12 | 0) >> 2] = $546;
     label$37 : {
      if (!(($546 | 0) == (516 | 0) & 1 | 0)) {
       break label$37
      }
      HEAP32[($4_1 + 60 | 0) >> 2] = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
      break label$4;
     }
     label$38 : {
      label$39 : while (1) {
       if (!(((HEAPU16[($4_1 + 22 | 0) >> 1] | 0) & 65535 | 0) >>> 0 < (HEAP32[($4_1 + 8 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
        break label$38
       }
       label$40 : {
        if (!(((HEAPU8[((HEAP32[($4_1 + 52 | 0) >> 2] | 0) + ((HEAPU16[($4_1 + 22 | 0) >> 1] | 0) & 65535 | 0) | 0) >> 0] | 0) & 255 | 0 | 0) != ((HEAPU8[((HEAP32[($4_1 + 52 | 0) >> 2] | 0) + ((HEAPU16[($4_1 + 4 | 0) >> 1] | 0) & 65535 | 0) | 0) >> 0] | 0) & 255 | 0 | 0) & 1 | 0)) {
         break label$40
        }
        HEAP16[($4_1 + 4 | 0) >> 1] = HEAPU16[(((HEAP32[($4_1 + 56 | 0) >> 2] | 0) + 2492 | 0) + (((HEAPU16[($4_1 + 4 | 0) >> 1] | 0) & 65535 | 0) << 1 | 0) | 0) >> 1] | 0;
        label$41 : {
         if (!(((HEAPU16[($4_1 + 4 | 0) >> 1] | 0) & 65535 | 0 | 0) != (65535 | 0) & 1 | 0)) {
          break label$41
         }
         continue label$39;
        }
       }
       $603 = 1;
       $604 = (HEAPU16[($4_1 + 4 | 0) >> 1] | 0) + $603 | 0;
       HEAP16[($4_1 + 4 | 0) >> 1] = $604;
       $607 = (HEAP32[($4_1 + 56 | 0) >> 2] | 0) + 2492 | 0;
       $609 = (HEAPU16[($4_1 + 22 | 0) >> 1] | 0) + $603 | 0;
       HEAP16[($4_1 + 22 | 0) >> 1] = $609;
       HEAP16[($607 + (($609 & 65535 | 0) << 1 | 0) | 0) >> 1] = $604;
       continue label$39;
      };
     }
    }
    continue label$23;
   };
  }
  return HEAP32[($4_1 + 60 | 0) >> 2] | 0 | 0;
 }
 
 function $9($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $35 = 0, $37 = 0, $42 = 0, $53 = 0, $68 = 0, $72 = 0, $78 = 0;
  $5_1 = global$0 - 16 | 0;
  global$0 = $5_1;
  HEAP32[($5_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 8 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 4 | 0) >> 2] = $2_1;
  label$1 : {
   if (!((HEAP32[($5_1 + 8 | 0) >> 2] | 0) >>> 0 > 8 >>> 0 & 1 | 0)) {
    break label$1
   }
   $9(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0, 8 | 0, HEAP32[($5_1 + 4 | 0) >> 2] | 0 | 0);
   HEAP32[($5_1 + 4 | 0) >> 2] = (HEAP32[($5_1 + 4 | 0) >> 2] | 0) >>> 8 | 0;
   HEAP32[($5_1 + 8 | 0) >> 2] = (HEAP32[($5_1 + 8 | 0) >> 2] | 0) - 8 | 0;
  }
  HEAP32[$5_1 >> 2] = HEAP32[((HEAP32[($5_1 + 12 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0;
  $35 = ((HEAP32[($5_1 + 12 | 0) >> 2] | 0) + 8138 | 0) + (HEAP32[((HEAP32[($5_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) | 0;
  $37 = 24;
  HEAP8[$35 >> 0] = ((HEAPU8[$35 >> 0] | 0) << $37 | 0) >> $37 | 0 | (((HEAP32[($5_1 + 4 | 0) >> 2] | 0) << (HEAP32[$5_1 >> 2] | 0) | 0) & 255 | 0) | 0;
  $42 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
  HEAP32[($42 + 8 | 0) >> 2] = (HEAP32[($42 + 8 | 0) >> 2] | 0) + (HEAP32[($5_1 + 8 | 0) >> 2] | 0) | 0;
  label$2 : {
   label$3 : {
    if (!((HEAP32[((HEAP32[($5_1 + 12 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0) >>> 0 > 8 >>> 0 & 1 | 0)) {
     break label$3
    }
    $53 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
    HEAP32[($53 + 4 | 0) >> 2] = (HEAP32[($53 + 4 | 0) >> 2] | 0) + 1 | 0;
    HEAP32[($5_1 + 4 | 0) >> 2] = (HEAP32[($5_1 + 4 | 0) >> 2] | 0) >>> (8 - (HEAP32[$5_1 >> 2] | 0) | 0) | 0;
    HEAP8[(((HEAP32[($5_1 + 12 | 0) >> 2] | 0) + 8138 | 0) + (HEAP32[((HEAP32[($5_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) | 0) >> 0] = HEAP32[($5_1 + 4 | 0) >> 2] | 0;
    $68 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
    HEAP32[($68 + 8 | 0) >> 2] = (HEAP32[($68 + 8 | 0) >> 2] | 0) & 7 | 0;
    break label$2;
   }
   $72 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
   HEAP32[($72 + 8 | 0) >> 2] = (HEAP32[($72 + 8 | 0) >> 2] | 0) & 7 | 0;
   label$4 : {
    if (HEAP32[((HEAP32[($5_1 + 12 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0) {
     break label$4
    }
    $78 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
    HEAP32[($78 + 4 | 0) >> 2] = (HEAP32[($78 + 4 | 0) >> 2] | 0) + 1 | 0;
   }
  }
  label$5 : {
   if (!((HEAP32[((HEAP32[($5_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) >>> 0 >= 2048 >>> 0 & 1 | 0)) {
    break label$5
   }
   $10(HEAP32[($5_1 + 12 | 0) >> 2] | 0 | 0);
  }
  global$0 = $5_1 + 16 | 0;
  return;
 }
 
 function $10($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $24_1 = 0;
  $3_1 = global$0 - 16 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 4 | 0) >> 2] = 2048;
  FUNCTION_TABLE[HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 2488 | 0) >> 2] | 0 | 0]((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8138 | 0, $3_1 + 4 | 0, HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 2480 | 0) >> 2] | 0);
  HEAP8[($3_1 + 11 | 0) >> 0] = HEAPU8[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 10186 | 0) >> 0] | 0;
  HEAP8[($3_1 + 10 | 0) >> 0] = HEAPU8[(((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8138 | 0) + (HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) | 0) >> 0] | 0;
  $24_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
  HEAP32[($24_1 + 4 | 0) >> 2] = (HEAP32[($24_1 + 4 | 0) >> 2] | 0) - 2048 | 0;
  $24((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8138 | 0 | 0, 0 | 0, 2050 | 0) | 0;
  label$1 : {
   if (!(HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0)) {
    break label$1
   }
   HEAP8[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8138 | 0) >> 0] = HEAPU8[($3_1 + 11 | 0) >> 0] | 0;
  }
  label$2 : {
   if (!(HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0)) {
    break label$2
   }
   HEAP8[(((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 8138 | 0) + (HEAP32[((HEAP32[($3_1 + 12 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) | 0) >> 0] = HEAPU8[($3_1 + 10 | 0) >> 0] | 0;
  }
  global$0 = $3_1 + 16 | 0;
  return;
 }
 
 function $11($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, $6_1 = 0, i64toi32_i32$2 = 0, $129 = 0, $119 = 0, $99 = 0, $113 = 0, $27_1 = 0, $393 = 0, $397 = 0, $423 = 0, $427 = 0, $439 = 0, $446 = 0, $453 = 0, $457 = 0, $469 = 0, $476 = 0, $483 = 0, $490 = 0, $497 = 0, $504 = 0, $511 = 0, $515 = 0, $163 = 0;
  $6_1 = global$0 - 32 | 0;
  global$0 = $6_1;
  HEAP32[($6_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($6_1 + 20 | 0) >> 2] = $1_1;
  HEAP32[($6_1 + 16 | 0) >> 2] = $2_1;
  HEAP32[($6_1 + 12 | 0) >> 2] = $3_1;
  HEAP32[($6_1 + 8 | 0) >> 2] = HEAP32[($6_1 + 16 | 0) >> 2] | 0;
  HEAP32[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 40 | 0) >> 2] = HEAP32[($6_1 + 24 | 0) >> 2] | 0;
  HEAP32[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 44 | 0) >> 2] = HEAP32[($6_1 + 20 | 0) >> 2] | 0;
  HEAP32[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 36 | 0) >> 2] = HEAP32[($6_1 + 12 | 0) >> 2] | 0;
  HEAP32[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 28 | 0) >> 2] = 2048;
  $27_1 = FUNCTION_TABLE[HEAP32[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 40 | 0) >> 2] | 0 | 0]((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 8756 | 0, (HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 28 | 0, HEAP32[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 36 | 0) >> 2] | 0) | 0;
  HEAP32[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 32 | 0) >> 2] = $27_1;
  label$1 : {
   label$2 : {
    if (!((HEAP32[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 32 | 0) >> 2] | 0) >>> 0 <= 4 >>> 0 & 1 | 0)) {
     break label$2
    }
    HEAP32[($6_1 + 28 | 0) >> 2] = 3;
    break label$1;
   }
   HEAP32[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] = (HEAPU8[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 8756 | 0) >> 0] | 0) & 255 | 0;
   HEAP32[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 12 | 0) >> 2] = (HEAPU8[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 8757 | 0) >> 0] | 0) & 255 | 0;
   HEAP32[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 20 | 0) >> 2] = (HEAPU8[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 8758 | 0) >> 0] | 0) & 255 | 0;
   HEAP32[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 24 | 0) >> 2] = 0;
   HEAP32[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 28 | 0) >> 2] = 3;
   label$3 : {
    label$4 : {
     if (4 >>> 0 > (HEAP32[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0) >>> 0 & 1 | 0) {
      break label$4
     }
     if (!((HEAP32[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0) >>> 0 > 6 >>> 0 & 1 | 0)) {
      break label$3
     }
    }
    HEAP32[($6_1 + 28 | 0) >> 2] = 1;
    break label$1;
   }
   HEAP32[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 16 | 0) >> 2] = 65535 >> (16 - (HEAP32[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0) | 0) | 0;
   label$5 : {
    if (!(HEAP32[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0)) {
     break label$5
    }
    label$6 : {
     if (!((HEAP32[((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0 | 0) != (1 | 0) & 1 | 0)) {
      break label$6
     }
     HEAP32[($6_1 + 28 | 0) >> 2] = 2;
     break label$1;
    }
    $23((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 12212 | 0 | 0, 1360 | 0, 256 | 0) | 0;
    $12(HEAP32[($6_1 + 8 | 0) >> 2] | 0 | 0);
   }
   $99 = (HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 12532 | 0;
   i64toi32_i32$2 = 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1336 | 0) >> 2] | 0;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1340 | 0) >> 2] | 0;
   $393 = i64toi32_i32$0;
   i64toi32_i32$0 = $99 + 8 | 0;
   HEAP32[i64toi32_i32$0 >> 2] = $393;
   HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1328 | 0) >> 2] | 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1332 | 0) >> 2] | 0;
   $397 = i64toi32_i32$1;
   i64toi32_i32$1 = $99;
   HEAP32[i64toi32_i32$1 >> 2] = $397;
   HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
   $13((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 11060 | 0 | 0, 1344 | 0, (HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 12532 | 0 | 0, 16 | 0);
   $113 = (HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 12548 | 0;
   i64toi32_i32$2 = 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1288 | 0) >> 2] | 0;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1292 | 0) >> 2] | 0;
   $423 = i64toi32_i32$0;
   i64toi32_i32$0 = $113 + 8 | 0;
   HEAP32[i64toi32_i32$0 >> 2] = $423;
   HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1280 | 0) >> 2] | 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1284 | 0) >> 2] | 0;
   $427 = i64toi32_i32$1;
   i64toi32_i32$1 = $113;
   HEAP32[i64toi32_i32$1 >> 2] = $427;
   HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
   $119 = (HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 12564 | 0;
   i64toi32_i32$2 = 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1320 | 0) >> 2] | 0;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1324 | 0) >> 2] | 0;
   $439 = i64toi32_i32$0;
   i64toi32_i32$0 = $119 + 24 | 0;
   HEAP32[i64toi32_i32$0 >> 2] = $439;
   HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1312 | 0) >> 2] | 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1316 | 0) >> 2] | 0;
   $446 = i64toi32_i32$1;
   i64toi32_i32$1 = $119 + 16 | 0;
   HEAP32[i64toi32_i32$1 >> 2] = $446;
   HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1304 | 0) >> 2] | 0;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1308 | 0) >> 2] | 0;
   $453 = i64toi32_i32$0;
   i64toi32_i32$0 = $119 + 8 | 0;
   HEAP32[i64toi32_i32$0 >> 2] = $453;
   HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1296 | 0) >> 2] | 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1300 | 0) >> 2] | 0;
   $457 = i64toi32_i32$1;
   i64toi32_i32$1 = $119;
   HEAP32[i64toi32_i32$1 >> 2] = $457;
   HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
   $129 = (HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 12468 | 0;
   i64toi32_i32$2 = 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1208 | 0) >> 2] | 0;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1212 | 0) >> 2] | 0;
   $469 = i64toi32_i32$0;
   i64toi32_i32$0 = $129 + 56 | 0;
   HEAP32[i64toi32_i32$0 >> 2] = $469;
   HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1200 | 0) >> 2] | 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1204 | 0) >> 2] | 0;
   $476 = i64toi32_i32$1;
   i64toi32_i32$1 = $129 + 48 | 0;
   HEAP32[i64toi32_i32$1 >> 2] = $476;
   HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1192 | 0) >> 2] | 0;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1196 | 0) >> 2] | 0;
   $483 = i64toi32_i32$0;
   i64toi32_i32$0 = $129 + 40 | 0;
   HEAP32[i64toi32_i32$0 >> 2] = $483;
   HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1184 | 0) >> 2] | 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1188 | 0) >> 2] | 0;
   $490 = i64toi32_i32$1;
   i64toi32_i32$1 = $129 + 32 | 0;
   HEAP32[i64toi32_i32$1 >> 2] = $490;
   HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1176 | 0) >> 2] | 0;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1180 | 0) >> 2] | 0;
   $497 = i64toi32_i32$0;
   i64toi32_i32$0 = $129 + 24 | 0;
   HEAP32[i64toi32_i32$0 >> 2] = $497;
   HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1168 | 0) >> 2] | 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1172 | 0) >> 2] | 0;
   $504 = i64toi32_i32$1;
   i64toi32_i32$1 = $129 + 16 | 0;
   HEAP32[i64toi32_i32$1 >> 2] = $504;
   HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1160 | 0) >> 2] | 0;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1164 | 0) >> 2] | 0;
   $511 = i64toi32_i32$0;
   i64toi32_i32$0 = $129 + 8 | 0;
   HEAP32[i64toi32_i32$0 >> 2] = $511;
   HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
   i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 1152 | 0) >> 2] | 0;
   i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 1156 | 0) >> 2] | 0;
   $515 = i64toi32_i32$1;
   i64toi32_i32$1 = $129;
   HEAP32[i64toi32_i32$1 >> 2] = $515;
   HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
   $13((HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 10804 | 0 | 0, 1216 | 0, (HEAP32[($6_1 + 8 | 0) >> 2] | 0) + 12468 | 0 | 0, 64 | 0);
   label$7 : {
    if (!(($14(HEAP32[($6_1 + 8 | 0) >> 2] | 0 | 0) | 0 | 0) != (774 | 0) & 1 | 0)) {
     break label$7
    }
    HEAP32[($6_1 + 28 | 0) >> 2] = 0;
    break label$1;
   }
   HEAP32[($6_1 + 28 | 0) >> 2] = 4;
  }
  $163 = HEAP32[($6_1 + 28 | 0) >> 2] | 0;
  global$0 = $6_1 + 32 | 0;
  return $163 | 0;
 }
 
 function $12($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $63 = 0;
  $3_1 = global$0 - 32 | 0;
  HEAP32[($3_1 + 28 | 0) >> 2] = $0_1;
  HEAP32[($3_1 + 24 | 0) >> 2] = 1616 + 510 | 0;
  HEAP16[($3_1 + 14 | 0) >> 1] = 255;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[($3_1 + 24 | 0) >> 2] | 0) >>> 0 >= 1616 >>> 0 & 1 | 0)) {
     break label$1
    }
    HEAP32[($3_1 + 8 | 0) >> 2] = ((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 12212 | 0) + ((HEAPU16[($3_1 + 14 | 0) >> 1] | 0) & 65535 | 0) | 0;
    HEAP8[($3_1 + 7 | 0) >> 0] = HEAPU8[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 0] | 0;
    label$3 : {
     label$4 : {
      if (!(((HEAPU8[($3_1 + 7 | 0) >> 0] | 0) & 255 | 0 | 0) <= (8 | 0) & 1 | 0)) {
       break label$4
      }
      HEAP32[($3_1 + 16 | 0) >> 2] = 1 << ((HEAPU8[($3_1 + 7 | 0) >> 0] | 0) & 255 | 0) | 0;
      HEAP32[($3_1 + 20 | 0) >> 2] = (HEAPU16[(HEAP32[($3_1 + 24 | 0) >> 2] | 0) >> 1] | 0) & 65535 | 0;
      label$5 : while (1) {
       HEAP8[(((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 11316 | 0) + (HEAP32[($3_1 + 20 | 0) >> 2] | 0) | 0) >> 0] = HEAPU16[($3_1 + 14 | 0) >> 1] | 0;
       HEAP32[($3_1 + 20 | 0) >> 2] = (HEAP32[($3_1 + 20 | 0) >> 2] | 0) + (HEAP32[($3_1 + 16 | 0) >> 2] | 0) | 0;
       if ((HEAP32[($3_1 + 20 | 0) >> 2] | 0) >>> 0 < 256 >>> 0 & 1 | 0) {
        continue label$5
       }
       break label$5;
      };
      break label$3;
     }
     $63 = ((HEAPU16[(HEAP32[($3_1 + 24 | 0) >> 2] | 0) >> 1] | 0) & 65535 | 0) & 255 | 0;
     HEAP32[($3_1 + 20 | 0) >> 2] = $63;
     label$6 : {
      label$7 : {
       if (!$63) {
        break label$7
       }
       HEAP8[(((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 11316 | 0) + (HEAP32[($3_1 + 20 | 0) >> 2] | 0) | 0) >> 0] = 255;
       label$8 : {
        label$9 : {
         if (!(((HEAPU16[(HEAP32[($3_1 + 24 | 0) >> 2] | 0) >> 1] | 0) & 65535 | 0) & 63 | 0)) {
          break label$9
         }
         HEAP8[($3_1 + 7 | 0) >> 0] = ((HEAPU8[($3_1 + 7 | 0) >> 0] | 0) & 255 | 0) - 4 | 0;
         HEAP8[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 0] = HEAPU8[($3_1 + 7 | 0) >> 0] | 0;
         HEAP32[($3_1 + 16 | 0) >> 2] = 1 << ((HEAPU8[($3_1 + 7 | 0) >> 0] | 0) & 255 | 0) | 0;
         HEAP32[($3_1 + 20 | 0) >> 2] = ((HEAPU16[(HEAP32[($3_1 + 24 | 0) >> 2] | 0) >> 1] | 0) & 65535 | 0) >> 4 | 0;
         label$10 : while (1) {
          HEAP8[(((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 11572 | 0) + (HEAP32[($3_1 + 20 | 0) >> 2] | 0) | 0) >> 0] = HEAPU16[($3_1 + 14 | 0) >> 1] | 0;
          HEAP32[($3_1 + 20 | 0) >> 2] = (HEAP32[($3_1 + 20 | 0) >> 2] | 0) + (HEAP32[($3_1 + 16 | 0) >> 2] | 0) | 0;
          if ((HEAP32[($3_1 + 20 | 0) >> 2] | 0) >>> 0 < 256 >>> 0 & 1 | 0) {
           continue label$10
          }
          break label$10;
         };
         break label$8;
        }
        HEAP8[($3_1 + 7 | 0) >> 0] = ((HEAPU8[($3_1 + 7 | 0) >> 0] | 0) & 255 | 0) - 6 | 0;
        HEAP8[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 0] = HEAPU8[($3_1 + 7 | 0) >> 0] | 0;
        HEAP32[($3_1 + 16 | 0) >> 2] = 1 << ((HEAPU8[($3_1 + 7 | 0) >> 0] | 0) & 255 | 0) | 0;
        HEAP32[($3_1 + 20 | 0) >> 2] = ((HEAPU16[(HEAP32[($3_1 + 24 | 0) >> 2] | 0) >> 1] | 0) & 65535 | 0) >> 6 | 0;
        label$11 : while (1) {
         HEAP8[(((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 11828 | 0) + (HEAP32[($3_1 + 20 | 0) >> 2] | 0) | 0) >> 0] = HEAPU16[($3_1 + 14 | 0) >> 1] | 0;
         HEAP32[($3_1 + 20 | 0) >> 2] = (HEAP32[($3_1 + 20 | 0) >> 2] | 0) + (HEAP32[($3_1 + 16 | 0) >> 2] | 0) | 0;
         if ((HEAP32[($3_1 + 20 | 0) >> 2] | 0) >>> 0 < 128 >>> 0 & 1 | 0) {
          continue label$11
         }
         break label$11;
        };
       }
       break label$6;
      }
      HEAP8[($3_1 + 7 | 0) >> 0] = ((HEAPU8[($3_1 + 7 | 0) >> 0] | 0) & 255 | 0) - 8 | 0;
      HEAP8[(HEAP32[($3_1 + 8 | 0) >> 2] | 0) >> 0] = HEAPU8[($3_1 + 7 | 0) >> 0] | 0;
      HEAP32[($3_1 + 16 | 0) >> 2] = 1 << ((HEAPU8[($3_1 + 7 | 0) >> 0] | 0) & 255 | 0) | 0;
      HEAP32[($3_1 + 20 | 0) >> 2] = ((HEAPU16[(HEAP32[($3_1 + 24 | 0) >> 2] | 0) >> 1] | 0) & 65535 | 0) >> 8 | 0;
      label$12 : while (1) {
       HEAP8[(((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 11956 | 0) + (HEAP32[($3_1 + 20 | 0) >> 2] | 0) | 0) >> 0] = HEAPU16[($3_1 + 14 | 0) >> 1] | 0;
       HEAP32[($3_1 + 20 | 0) >> 2] = (HEAP32[($3_1 + 20 | 0) >> 2] | 0) + (HEAP32[($3_1 + 16 | 0) >> 2] | 0) | 0;
       if ((HEAP32[($3_1 + 20 | 0) >> 2] | 0) >>> 0 < 256 >>> 0 & 1 | 0) {
        continue label$12
       }
       break label$12;
      };
     }
    }
    HEAP32[($3_1 + 24 | 0) >> 2] = (HEAP32[($3_1 + 24 | 0) >> 2] | 0) + -2 | 0;
    HEAP16[($3_1 + 14 | 0) >> 1] = (HEAPU16[($3_1 + 14 | 0) >> 1] | 0) + -1 | 0;
    continue label$2;
   };
  }
  return;
 }
 
 function $13($0_1, $1_1, $2_1, $3_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  $3_1 = $3_1 | 0;
  var $6_1 = 0;
  $6_1 = global$0 - 32 | 0;
  HEAP32[($6_1 + 28 | 0) >> 2] = $0_1;
  HEAP32[($6_1 + 24 | 0) >> 2] = $1_1;
  HEAP32[($6_1 + 20 | 0) >> 2] = $2_1;
  HEAP32[($6_1 + 16 | 0) >> 2] = $3_1;
  HEAP32[($6_1 + 4 | 0) >> 2] = 0;
  label$1 : {
   label$2 : while (1) {
    if (!((HEAP32[($6_1 + 4 | 0) >> 2] | 0) >>> 0 < (HEAP32[($6_1 + 16 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
     break label$1
    }
    HEAP32[($6_1 + 8 | 0) >> 2] = 1 << ((HEAPU8[((HEAP32[($6_1 + 20 | 0) >> 2] | 0) + (HEAP32[($6_1 + 4 | 0) >> 2] | 0) | 0) >> 0] | 0) & 255 | 0) | 0;
    HEAP32[($6_1 + 12 | 0) >> 2] = (HEAPU8[((HEAP32[($6_1 + 24 | 0) >> 2] | 0) + (HEAP32[($6_1 + 4 | 0) >> 2] | 0) | 0) >> 0] | 0) & 255 | 0;
    label$3 : {
     label$4 : while (1) {
      if (!((HEAP32[($6_1 + 12 | 0) >> 2] | 0) >>> 0 < 256 >>> 0 & 1 | 0)) {
       break label$3
      }
      HEAP8[((HEAP32[($6_1 + 28 | 0) >> 2] | 0) + (HEAP32[($6_1 + 12 | 0) >> 2] | 0) | 0) >> 0] = HEAP32[($6_1 + 4 | 0) >> 2] | 0;
      HEAP32[($6_1 + 12 | 0) >> 2] = (HEAP32[($6_1 + 12 | 0) >> 2] | 0) + (HEAP32[($6_1 + 8 | 0) >> 2] | 0) | 0;
      continue label$4;
     };
    }
    HEAP32[($6_1 + 4 | 0) >> 2] = (HEAP32[($6_1 + 4 | 0) >> 2] | 0) + 1 | 0;
    continue label$2;
   };
  }
  return;
 }
 
 function $14($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $8_1 = 0, $26_1 = 0, $40 = 0, $44 = 0, $52 = 0, $56 = 0, $63 = 0, $64 = 0, $101 = 0, $55 = 0, $59 = 0, $62 = 0, $121 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 28 | 0) >> 2] = $0_1;
  HEAP32[((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 8 | 0) >> 2] = 4096;
  label$1 : {
   label$2 : while (1) {
    $8_1 = $15(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0) | 0;
    HEAP32[($3_1 + 24 | 0) >> 2] = $8_1;
    HEAP32[($3_1 + 20 | 0) >> 2] = $8_1;
    if (!($8_1 >>> 0 < 773 >>> 0 & 1 | 0)) {
     break label$1
    }
    label$3 : {
     label$4 : {
      if (!((HEAP32[($3_1 + 24 | 0) >> 2] | 0) >>> 0 >= 256 >>> 0 & 1 | 0)) {
       break label$4
      }
      HEAP32[($3_1 + 4 | 0) >> 2] = (HEAP32[($3_1 + 24 | 0) >> 2] | 0) - 254 | 0;
      $26_1 = $16(HEAP32[($3_1 + 28 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 4 | 0) >> 2] | 0 | 0) | 0;
      HEAP32[$3_1 >> 2] = $26_1;
      label$5 : {
       if ($26_1) {
        break label$5
       }
       HEAP32[($3_1 + 20 | 0) >> 2] = 774;
       break label$1;
      }
      HEAP32[($3_1 + 8 | 0) >> 2] = ((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 48 | 0) + (HEAP32[((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0) | 0;
      HEAP32[($3_1 + 12 | 0) >> 2] = (HEAP32[($3_1 + 8 | 0) >> 2] | 0) + (0 - (HEAP32[$3_1 >> 2] | 0) | 0) | 0;
      $40 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
      HEAP32[($40 + 8 | 0) >> 2] = (HEAP32[($40 + 8 | 0) >> 2] | 0) + (HEAP32[($3_1 + 4 | 0) >> 2] | 0) | 0;
      label$6 : {
       label$7 : while (1) {
        $44 = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
        HEAP32[($3_1 + 4 | 0) >> 2] = $44 + -1 | 0;
        if (!($44 >>> 0 > 0 >>> 0 & 1 | 0)) {
         break label$6
        }
        $52 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
        HEAP32[($3_1 + 12 | 0) >> 2] = $52 + 1 | 0;
        $55 = HEAPU8[$52 >> 0] | 0;
        $56 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
        HEAP32[($3_1 + 8 | 0) >> 2] = $56 + 1 | 0;
        HEAP8[$56 >> 0] = $55;
        continue label$7;
       };
      }
      break label$3;
     }
     $59 = HEAP32[($3_1 + 24 | 0) >> 2] | 0;
     $62 = (HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 48 | 0;
     $63 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
     $64 = HEAP32[($63 + 8 | 0) >> 2] | 0;
     HEAP32[($63 + 8 | 0) >> 2] = $64 + 1 | 0;
     HEAP8[($62 + $64 | 0) >> 0] = $59;
    }
    label$8 : {
     if (!((HEAP32[((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0) >>> 0 >= 8192 >>> 0 & 1 | 0)) {
      break label$8
     }
     HEAP32[($3_1 + 16 | 0) >> 2] = 4096;
     FUNCTION_TABLE[HEAP32[((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 44 | 0) >> 2] | 0 | 0](((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 48 | 0) + 4096 | 0, $3_1 + 16 | 0, HEAP32[((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 36 | 0) >> 2] | 0);
     $25((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 48 | 0 | 0, ((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 48 | 0) + 4096 | 0 | 0, (HEAP32[((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0) - 4096 | 0 | 0) | 0;
     $101 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
     HEAP32[($101 + 8 | 0) >> 2] = (HEAP32[($101 + 8 | 0) >> 2] | 0) - 4096 | 0;
    }
    continue label$2;
   };
  }
  HEAP32[($3_1 + 16 | 0) >> 2] = (HEAP32[((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 8 | 0) >> 2] | 0) - 4096 | 0;
  FUNCTION_TABLE[HEAP32[((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 44 | 0) >> 2] | 0 | 0](((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 48 | 0) + 4096 | 0, $3_1 + 16 | 0, HEAP32[((HEAP32[($3_1 + 28 | 0) >> 2] | 0) + 36 | 0) >> 2] | 0);
  $121 = HEAP32[($3_1 + 20 | 0) >> 2] | 0;
  global$0 = $3_1 + 32 | 0;
  return $121 | 0;
 }
 
 function $15($0_1) {
  $0_1 = $0_1 | 0;
  var $3_1 = 0, $41 = 0, $175 = 0, $178 = 0;
  $3_1 = global$0 - 32 | 0;
  global$0 = $3_1;
  HEAP32[($3_1 + 24 | 0) >> 2] = $0_1;
  label$1 : {
   label$2 : {
    if (!((HEAP32[((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 20 | 0) >> 2] | 0) & 1 | 0)) {
     break label$2
    }
    label$3 : {
     if (!($17(HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0, 1 | 0) | 0)) {
      break label$3
     }
     HEAP32[($3_1 + 28 | 0) >> 2] = 774;
     break label$1;
    }
    HEAP32[($3_1 + 16 | 0) >> 2] = (HEAPU8[(((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 11060 | 0) + ((HEAP32[((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 20 | 0) >> 2] | 0) & 255 | 0) | 0) >> 0] | 0) & 255 | 0;
    label$4 : {
     if (!($17(HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0, (HEAPU8[(((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 12532 | 0) + (HEAP32[($3_1 + 16 | 0) >> 2] | 0) | 0) >> 0] | 0) & 255 | 0 | 0) | 0)) {
      break label$4
     }
     HEAP32[($3_1 + 28 | 0) >> 2] = 774;
     break label$1;
    }
    $41 = (HEAPU8[(((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 12548 | 0) + (HEAP32[($3_1 + 16 | 0) >> 2] | 0) | 0) >> 0] | 0) & 255 | 0;
    HEAP32[($3_1 + 20 | 0) >> 2] = $41;
    label$5 : {
     if (!$41) {
      break label$5
     }
     HEAP32[($3_1 + 8 | 0) >> 2] = (HEAP32[((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 20 | 0) >> 2] | 0) & ((1 << (HEAP32[($3_1 + 20 | 0) >> 2] | 0) | 0) - 1 | 0) | 0;
     label$6 : {
      if (!($17(HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0, HEAP32[($3_1 + 20 | 0) >> 2] | 0 | 0) | 0)) {
       break label$6
      }
      label$7 : {
       if (!(((HEAP32[($3_1 + 16 | 0) >> 2] | 0) + (HEAP32[($3_1 + 8 | 0) >> 2] | 0) | 0 | 0) != (270 | 0) & 1 | 0)) {
        break label$7
       }
       HEAP32[($3_1 + 28 | 0) >> 2] = 774;
       break label$1;
      }
     }
     HEAP32[($3_1 + 16 | 0) >> 2] = ((HEAPU16[(((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 12564 | 0) + ((HEAP32[($3_1 + 16 | 0) >> 2] | 0) << 1 | 0) | 0) >> 1] | 0) & 65535 | 0) + (HEAP32[($3_1 + 8 | 0) >> 2] | 0) | 0;
    }
    HEAP32[($3_1 + 28 | 0) >> 2] = (HEAP32[($3_1 + 16 | 0) >> 2] | 0) + 256 | 0;
    break label$1;
   }
   label$8 : {
    if (!($17(HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0, 1 | 0) | 0)) {
     break label$8
    }
    HEAP32[($3_1 + 28 | 0) >> 2] = 774;
    break label$1;
   }
   label$9 : {
    if (HEAP32[((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 4 | 0) >> 2] | 0) {
     break label$9
    }
    HEAP32[($3_1 + 4 | 0) >> 2] = (HEAP32[((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 20 | 0) >> 2] | 0) & 255 | 0;
    label$10 : {
     if (!($17(HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0, 8 | 0) | 0)) {
      break label$10
     }
     HEAP32[($3_1 + 28 | 0) >> 2] = 774;
     break label$1;
    }
    HEAP32[($3_1 + 28 | 0) >> 2] = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
    break label$1;
   }
   label$11 : {
    label$12 : {
     if (!((HEAP32[((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 20 | 0) >> 2] | 0) & 255 | 0)) {
      break label$12
     }
     HEAP32[($3_1 + 12 | 0) >> 2] = (HEAPU8[(((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 11316 | 0) + ((HEAP32[((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 20 | 0) >> 2] | 0) & 255 | 0) | 0) >> 0] | 0) & 255 | 0;
     label$13 : {
      if (!((HEAP32[($3_1 + 12 | 0) >> 2] | 0 | 0) == (255 | 0) & 1 | 0)) {
       break label$13
      }
      label$14 : {
       label$15 : {
        if (!((HEAP32[((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 20 | 0) >> 2] | 0) & 63 | 0)) {
         break label$15
        }
        label$16 : {
         if (!($17(HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0, 4 | 0) | 0)) {
          break label$16
         }
         HEAP32[($3_1 + 28 | 0) >> 2] = 774;
         break label$1;
        }
        HEAP32[($3_1 + 12 | 0) >> 2] = (HEAPU8[(((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 11572 | 0) + ((HEAP32[((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 20 | 0) >> 2] | 0) & 255 | 0) | 0) >> 0] | 0) & 255 | 0;
        break label$14;
       }
       label$17 : {
        if (!($17(HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0, 6 | 0) | 0)) {
         break label$17
        }
        HEAP32[($3_1 + 28 | 0) >> 2] = 774;
        break label$1;
       }
       HEAP32[($3_1 + 12 | 0) >> 2] = (HEAPU8[(((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 11828 | 0) + ((HEAP32[((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 20 | 0) >> 2] | 0) & 127 | 0) | 0) >> 0] | 0) & 255 | 0;
      }
     }
     break label$11;
    }
    label$18 : {
     if (!($17(HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0, 8 | 0) | 0)) {
      break label$18
     }
     HEAP32[($3_1 + 28 | 0) >> 2] = 774;
     break label$1;
    }
    HEAP32[($3_1 + 12 | 0) >> 2] = (HEAPU8[(((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 11956 | 0) + ((HEAP32[((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 20 | 0) >> 2] | 0) & 255 | 0) | 0) >> 0] | 0) & 255 | 0;
   }
   label$19 : {
    label$20 : {
     if (!($17(HEAP32[($3_1 + 24 | 0) >> 2] | 0 | 0, (HEAPU8[(((HEAP32[($3_1 + 24 | 0) >> 2] | 0) + 12212 | 0) + (HEAP32[($3_1 + 12 | 0) >> 2] | 0) | 0) >> 0] | 0) & 255 | 0 | 0) | 0)) {
      break label$20
     }
     $175 = 774;
     break label$19;
    }
    $175 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
   }
   HEAP32[($3_1 + 28 | 0) >> 2] = $175;
  }
  $178 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
  global$0 = $3_1 + 32 | 0;
  return $178 | 0;
 }
 
 function $16($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $65 = 0;
  $4_1 = global$0 - 32 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 24 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 20 | 0) >> 2] = $1_1;
  HEAP32[($4_1 + 16 | 0) >> 2] = (HEAPU8[(((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + 10804 | 0) + ((HEAP32[((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + 20 | 0) >> 2] | 0) & 255 | 0) | 0) >> 0] | 0) & 255 | 0;
  HEAP32[($4_1 + 12 | 0) >> 2] = (HEAPU8[(((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + 12468 | 0) + (HEAP32[($4_1 + 16 | 0) >> 2] | 0) | 0) >> 0] | 0) & 255 | 0;
  label$1 : {
   label$2 : {
    if (!($17(HEAP32[($4_1 + 24 | 0) >> 2] | 0 | 0, HEAP32[($4_1 + 12 | 0) >> 2] | 0 | 0) | 0)) {
     break label$2
    }
    HEAP32[($4_1 + 28 | 0) >> 2] = 0;
    break label$1;
   }
   label$3 : {
    label$4 : {
     if (!((HEAP32[($4_1 + 20 | 0) >> 2] | 0 | 0) == (2 | 0) & 1 | 0)) {
      break label$4
     }
     HEAP32[($4_1 + 8 | 0) >> 2] = (HEAP32[($4_1 + 16 | 0) >> 2] | 0) << 2 | 0 | ((HEAP32[((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + 20 | 0) >> 2] | 0) & 3 | 0) | 0;
     label$5 : {
      if (!($17(HEAP32[($4_1 + 24 | 0) >> 2] | 0 | 0, 2 | 0) | 0)) {
       break label$5
      }
      HEAP32[($4_1 + 28 | 0) >> 2] = 0;
      break label$1;
     }
     break label$3;
    }
    HEAP32[($4_1 + 8 | 0) >> 2] = (HEAP32[($4_1 + 16 | 0) >> 2] | 0) << (HEAP32[((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0) | 0 | ((HEAP32[((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + 20 | 0) >> 2] | 0) & (HEAP32[((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + 16 | 0) >> 2] | 0) | 0) | 0;
    label$6 : {
     if (!($17(HEAP32[($4_1 + 24 | 0) >> 2] | 0 | 0, HEAP32[((HEAP32[($4_1 + 24 | 0) >> 2] | 0) + 12 | 0) >> 2] | 0 | 0) | 0)) {
      break label$6
     }
     HEAP32[($4_1 + 28 | 0) >> 2] = 0;
     break label$1;
    }
   }
   HEAP32[($4_1 + 28 | 0) >> 2] = (HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 1 | 0;
  }
  $65 = HEAP32[($4_1 + 28 | 0) >> 2] | 0;
  global$0 = $4_1 + 32 | 0;
  return $65 | 0;
 }
 
 function $17($0_1, $1_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  var $4_1 = 0, $15_1 = 0, $19_1 = 0, $24_1 = 0, $48 = 0, $57 = 0, $58 = 0, $67 = 0, $74 = 0, $56 = 0, $84 = 0;
  $4_1 = global$0 - 16 | 0;
  global$0 = $4_1;
  HEAP32[($4_1 + 8 | 0) >> 2] = $0_1;
  HEAP32[($4_1 + 4 | 0) >> 2] = $1_1;
  label$1 : {
   label$2 : {
    if (!((HEAP32[($4_1 + 4 | 0) >> 2] | 0) >>> 0 <= (HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 24 | 0) >> 2] | 0) >>> 0 & 1 | 0)) {
     break label$2
    }
    $15_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
    HEAP32[($15_1 + 24 | 0) >> 2] = (HEAP32[($15_1 + 24 | 0) >> 2] | 0) - (HEAP32[($4_1 + 4 | 0) >> 2] | 0) | 0;
    $19_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
    HEAP32[($19_1 + 20 | 0) >> 2] = (HEAP32[($19_1 + 20 | 0) >> 2] | 0) >>> (HEAP32[($4_1 + 4 | 0) >> 2] | 0) | 0;
    HEAP32[($4_1 + 12 | 0) >> 2] = 0;
    break label$1;
   }
   $24_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
   HEAP32[($24_1 + 20 | 0) >> 2] = (HEAP32[($24_1 + 20 | 0) >> 2] | 0) >>> (HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 24 | 0) >> 2] | 0) | 0;
   label$3 : {
    if (!((HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 28 | 0) >> 2] | 0 | 0) == (HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 32 | 0) >> 2] | 0 | 0) & 1 | 0)) {
     break label$3
    }
    HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 28 | 0) >> 2] = 2048;
    $48 = FUNCTION_TABLE[HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 40 | 0) >> 2] | 0 | 0]((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 8756 | 0, (HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 28 | 0, HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 36 | 0) >> 2] | 0) | 0;
    HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 32 | 0) >> 2] = $48;
    label$4 : {
     if ($48) {
      break label$4
     }
     HEAP32[($4_1 + 12 | 0) >> 2] = 1;
     break label$1;
    }
    HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 28 | 0) >> 2] = 0;
   }
   $56 = (HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 8756 | 0;
   $57 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
   $58 = HEAP32[($57 + 28 | 0) >> 2] | 0;
   HEAP32[($57 + 28 | 0) >> 2] = $58 + 1 | 0;
   $67 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
   HEAP32[($67 + 20 | 0) >> 2] = HEAP32[($67 + 20 | 0) >> 2] | 0 | (((HEAPU8[($56 + $58 | 0) >> 0] | 0) & 255 | 0) << 8 | 0) | 0;
   $74 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
   HEAP32[($74 + 20 | 0) >> 2] = (HEAP32[($74 + 20 | 0) >> 2] | 0) >>> ((HEAP32[($4_1 + 4 | 0) >> 2] | 0) - (HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 24 | 0) >> 2] | 0) | 0) | 0;
   HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 24 | 0) >> 2] = ((HEAP32[((HEAP32[($4_1 + 8 | 0) >> 2] | 0) + 24 | 0) >> 2] | 0) - (HEAP32[($4_1 + 4 | 0) >> 2] | 0) | 0) + 8 | 0;
   HEAP32[($4_1 + 12 | 0) >> 2] = 0;
  }
  $84 = HEAP32[($4_1 + 12 | 0) >> 2] | 0;
  global$0 = $4_1 + 16 | 0;
  return $84 | 0;
 }
 
 function $18($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $5_1 = 0, $10_1 = 0, $14_1 = 0, $18_1 = 0, $22_1 = 0;
  $5_1 = global$0 - 32 | 0;
  HEAP32[($5_1 + 28 | 0) >> 2] = $0_1;
  HEAP32[($5_1 + 24 | 0) >> 2] = $1_1;
  HEAP32[($5_1 + 20 | 0) >> 2] = $2_1;
  HEAP32[($5_1 + 16 | 0) >> 2] = HEAP32[(HEAP32[($5_1 + 24 | 0) >> 2] | 0) >> 2] | 0;
  HEAP32[($5_1 + 8 | 0) >> 2] = HEAP32[(HEAP32[($5_1 + 20 | 0) >> 2] | 0) >> 2] | 0;
  label$1 : {
   label$2 : while (1) {
    $10_1 = HEAP32[($5_1 + 16 | 0) >> 2] | 0;
    HEAP32[($5_1 + 16 | 0) >> 2] = $10_1 + -1 | 0;
    if (!$10_1) {
     break label$1
    }
    $14_1 = HEAP32[($5_1 + 28 | 0) >> 2] | 0;
    HEAP32[($5_1 + 28 | 0) >> 2] = $14_1 + 1 | 0;
    $18_1 = 24;
    $22_1 = 24;
    HEAP32[($5_1 + 12 | 0) >> 2] = (((HEAPU8[$14_1 >> 0] | 0) << $18_1 | 0) >> $18_1 | 0) ^ (((HEAP32[($5_1 + 8 | 0) >> 2] | 0) << $22_1 | 0) >> $22_1 | 0) | 0;
    HEAP32[($5_1 + 8 | 0) >> 2] = (HEAP32[($5_1 + 8 | 0) >> 2] | 0) >>> 8 | 0;
    HEAP32[($5_1 + 8 | 0) >> 2] = (HEAP32[(2128 + (((HEAP32[($5_1 + 12 | 0) >> 2] | 0) & 255 | 0) << 2 | 0) | 0) >> 2] | 0) ^ (HEAP32[($5_1 + 8 | 0) >> 2] | 0) | 0;
    continue label$2;
   };
  }
  return HEAP32[($5_1 + 8 | 0) >> 2] | 0 | 0;
 }
 
 function $19() {
  return 3156 | 0;
 }
 
 function $20($0_1) {
  $0_1 = $0_1 | 0;
  var $4_1 = 0, $6_1 = 0, $5_1 = 0, $3_1 = 0, $8_1 = 0, $2_1 = 0, $12_1 = 0, $9_1 = 0, $7_1 = 0, i64toi32_i32$0 = 0, i64toi32_i32$1 = 0, i64toi32_i32$2 = 0, $10_1 = 0, $11_1 = 0, $1_1 = 0, $83 = 0, $96 = 0, $107 = 0, $115 = 0, $123 = 0, $217 = 0, $228 = 0, $236 = 0, $244 = 0, $279 = 0, $354 = 0, $361 = 0, $368 = 0, $459 = 0, $470 = 0, $478 = 0, $486 = 0, $1194 = 0, $1201 = 0, $1208 = 0, $1330 = 0, $1332 = 0, $1393 = 0, $1400 = 0, $1407 = 0, $1640 = 0, $1647 = 0, $1654 = 0;
  $1_1 = global$0 - 16 | 0;
  global$0 = $1_1;
  label$1 : {
   label$2 : {
    label$3 : {
     label$4 : {
      label$5 : {
       label$6 : {
        label$7 : {
         label$8 : {
          label$9 : {
           label$10 : {
            label$11 : {
             label$12 : {
              label$13 : {
               if ($0_1 >>> 0 > 244 >>> 0) {
                break label$13
               }
               label$14 : {
                $2_1 = HEAP32[(0 + 3160 | 0) >> 2] | 0;
                $3_1 = $0_1 >>> 0 < 11 >>> 0 ? 16 : ($0_1 + 11 | 0) & -8 | 0;
                $4_1 = $3_1 >>> 3 | 0;
                $0_1 = $2_1 >>> $4_1 | 0;
                if (!($0_1 & 3 | 0)) {
                 break label$14
                }
                $3_1 = (($0_1 ^ -1 | 0) & 1 | 0) + $4_1 | 0;
                $5_1 = $3_1 << 3 | 0;
                $4_1 = HEAP32[($5_1 + 3208 | 0) >> 2] | 0;
                $0_1 = $4_1 + 8 | 0;
                label$15 : {
                 label$16 : {
                  $6_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
                  $5_1 = $5_1 + 3200 | 0;
                  if (($6_1 | 0) != ($5_1 | 0)) {
                   break label$16
                  }
                  HEAP32[(0 + 3160 | 0) >> 2] = $2_1 & (__wasm_rotl_i32(-2 | 0, $3_1 | 0) | 0) | 0;
                  break label$15;
                 }
                 HEAP32[(0 + 3176 | 0) >> 2] | 0;
                 HEAP32[($6_1 + 12 | 0) >> 2] = $5_1;
                 HEAP32[($5_1 + 8 | 0) >> 2] = $6_1;
                }
                $6_1 = $3_1 << 3 | 0;
                HEAP32[($4_1 + 4 | 0) >> 2] = $6_1 | 3 | 0;
                $4_1 = $4_1 + $6_1 | 0;
                HEAP32[($4_1 + 4 | 0) >> 2] = HEAP32[($4_1 + 4 | 0) >> 2] | 0 | 1 | 0;
                break label$1;
               }
               $7_1 = HEAP32[(0 + 3168 | 0) >> 2] | 0;
               if ($3_1 >>> 0 <= $7_1 >>> 0) {
                break label$12
               }
               label$17 : {
                if (!$0_1) {
                 break label$17
                }
                label$18 : {
                 label$19 : {
                  $83 = $0_1 << $4_1 | 0;
                  $0_1 = 2 << $4_1 | 0;
                  $0_1 = $83 & ($0_1 | (0 - $0_1 | 0) | 0) | 0;
                  $0_1 = ($0_1 & (0 - $0_1 | 0) | 0) + -1 | 0;
                  $96 = $0_1;
                  $0_1 = ($0_1 >>> 12 | 0) & 16 | 0;
                  $4_1 = $96 >>> $0_1 | 0;
                  $6_1 = ($4_1 >>> 5 | 0) & 8 | 0;
                  $107 = $6_1 | $0_1 | 0;
                  $0_1 = $4_1 >>> $6_1 | 0;
                  $4_1 = ($0_1 >>> 2 | 0) & 4 | 0;
                  $115 = $107 | $4_1 | 0;
                  $0_1 = $0_1 >>> $4_1 | 0;
                  $4_1 = ($0_1 >>> 1 | 0) & 2 | 0;
                  $123 = $115 | $4_1 | 0;
                  $0_1 = $0_1 >>> $4_1 | 0;
                  $4_1 = ($0_1 >>> 1 | 0) & 1 | 0;
                  $6_1 = ($123 | $4_1 | 0) + ($0_1 >>> $4_1 | 0) | 0;
                  $5_1 = $6_1 << 3 | 0;
                  $4_1 = HEAP32[($5_1 + 3208 | 0) >> 2] | 0;
                  $0_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
                  $5_1 = $5_1 + 3200 | 0;
                  if (($0_1 | 0) != ($5_1 | 0)) {
                   break label$19
                  }
                  $2_1 = $2_1 & (__wasm_rotl_i32(-2 | 0, $6_1 | 0) | 0) | 0;
                  HEAP32[(0 + 3160 | 0) >> 2] = $2_1;
                  break label$18;
                 }
                 HEAP32[(0 + 3176 | 0) >> 2] | 0;
                 HEAP32[($0_1 + 12 | 0) >> 2] = $5_1;
                 HEAP32[($5_1 + 8 | 0) >> 2] = $0_1;
                }
                $0_1 = $4_1 + 8 | 0;
                HEAP32[($4_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
                $5_1 = $4_1 + $3_1 | 0;
                $8_1 = $6_1 << 3 | 0;
                $6_1 = $8_1 - $3_1 | 0;
                HEAP32[($5_1 + 4 | 0) >> 2] = $6_1 | 1 | 0;
                HEAP32[($4_1 + $8_1 | 0) >> 2] = $6_1;
                label$20 : {
                 if (!$7_1) {
                  break label$20
                 }
                 $8_1 = $7_1 >>> 3 | 0;
                 $3_1 = ($8_1 << 3 | 0) + 3200 | 0;
                 $4_1 = HEAP32[(0 + 3180 | 0) >> 2] | 0;
                 label$21 : {
                  label$22 : {
                   $8_1 = 1 << $8_1 | 0;
                   if ($2_1 & $8_1 | 0) {
                    break label$22
                   }
                   HEAP32[(0 + 3160 | 0) >> 2] = $2_1 | $8_1 | 0;
                   $8_1 = $3_1;
                   break label$21;
                  }
                  $8_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
                 }
                 HEAP32[($3_1 + 8 | 0) >> 2] = $4_1;
                 HEAP32[($8_1 + 12 | 0) >> 2] = $4_1;
                 HEAP32[($4_1 + 12 | 0) >> 2] = $3_1;
                 HEAP32[($4_1 + 8 | 0) >> 2] = $8_1;
                }
                HEAP32[(0 + 3180 | 0) >> 2] = $5_1;
                HEAP32[(0 + 3168 | 0) >> 2] = $6_1;
                break label$1;
               }
               $9_1 = HEAP32[(0 + 3164 | 0) >> 2] | 0;
               if (!$9_1) {
                break label$12
               }
               $0_1 = ($9_1 & (0 - $9_1 | 0) | 0) + -1 | 0;
               $217 = $0_1;
               $0_1 = ($0_1 >>> 12 | 0) & 16 | 0;
               $4_1 = $217 >>> $0_1 | 0;
               $6_1 = ($4_1 >>> 5 | 0) & 8 | 0;
               $228 = $6_1 | $0_1 | 0;
               $0_1 = $4_1 >>> $6_1 | 0;
               $4_1 = ($0_1 >>> 2 | 0) & 4 | 0;
               $236 = $228 | $4_1 | 0;
               $0_1 = $0_1 >>> $4_1 | 0;
               $4_1 = ($0_1 >>> 1 | 0) & 2 | 0;
               $244 = $236 | $4_1 | 0;
               $0_1 = $0_1 >>> $4_1 | 0;
               $4_1 = ($0_1 >>> 1 | 0) & 1 | 0;
               $5_1 = HEAP32[(((($244 | $4_1 | 0) + ($0_1 >>> $4_1 | 0) | 0) << 2 | 0) + 3464 | 0) >> 2] | 0;
               $4_1 = ((HEAP32[($5_1 + 4 | 0) >> 2] | 0) & -8 | 0) - $3_1 | 0;
               $6_1 = $5_1;
               label$23 : {
                label$24 : while (1) {
                 label$25 : {
                  $0_1 = HEAP32[($6_1 + 16 | 0) >> 2] | 0;
                  if ($0_1) {
                   break label$25
                  }
                  $0_1 = HEAP32[($6_1 + 20 | 0) >> 2] | 0;
                  if (!$0_1) {
                   break label$23
                  }
                 }
                 $6_1 = ((HEAP32[($0_1 + 4 | 0) >> 2] | 0) & -8 | 0) - $3_1 | 0;
                 $279 = $6_1;
                 $6_1 = $6_1 >>> 0 < $4_1 >>> 0;
                 $4_1 = $6_1 ? $279 : $4_1;
                 $5_1 = $6_1 ? $0_1 : $5_1;
                 $6_1 = $0_1;
                 continue label$24;
                };
               }
               $10_1 = $5_1 + $3_1 | 0;
               if ($10_1 >>> 0 <= $5_1 >>> 0) {
                break label$11
               }
               $11_1 = HEAP32[($5_1 + 24 | 0) >> 2] | 0;
               label$26 : {
                $8_1 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
                if (($8_1 | 0) == ($5_1 | 0)) {
                 break label$26
                }
                label$27 : {
                 $0_1 = HEAP32[($5_1 + 8 | 0) >> 2] | 0;
                 if ((HEAP32[(0 + 3176 | 0) >> 2] | 0) >>> 0 > $0_1 >>> 0) {
                  break label$27
                 }
                 HEAP32[($0_1 + 12 | 0) >> 2] | 0;
                }
                HEAP32[($0_1 + 12 | 0) >> 2] = $8_1;
                HEAP32[($8_1 + 8 | 0) >> 2] = $0_1;
                break label$2;
               }
               label$28 : {
                $6_1 = $5_1 + 20 | 0;
                $0_1 = HEAP32[$6_1 >> 2] | 0;
                if ($0_1) {
                 break label$28
                }
                $0_1 = HEAP32[($5_1 + 16 | 0) >> 2] | 0;
                if (!$0_1) {
                 break label$10
                }
                $6_1 = $5_1 + 16 | 0;
               }
               label$29 : while (1) {
                $12_1 = $6_1;
                $8_1 = $0_1;
                $6_1 = $0_1 + 20 | 0;
                $0_1 = HEAP32[$6_1 >> 2] | 0;
                if ($0_1) {
                 continue label$29
                }
                $6_1 = $8_1 + 16 | 0;
                $0_1 = HEAP32[($8_1 + 16 | 0) >> 2] | 0;
                if ($0_1) {
                 continue label$29
                }
                break label$29;
               };
               HEAP32[$12_1 >> 2] = 0;
               break label$2;
              }
              $3_1 = -1;
              if ($0_1 >>> 0 > -65 >>> 0) {
               break label$12
              }
              $0_1 = $0_1 + 11 | 0;
              $3_1 = $0_1 & -8 | 0;
              $7_1 = HEAP32[(0 + 3164 | 0) >> 2] | 0;
              if (!$7_1) {
               break label$12
              }
              $12_1 = 31;
              label$30 : {
               if ($3_1 >>> 0 > 16777215 >>> 0) {
                break label$30
               }
               $0_1 = $0_1 >>> 8 | 0;
               $354 = $0_1;
               $0_1 = (($0_1 + 1048320 | 0) >>> 16 | 0) & 8 | 0;
               $4_1 = $354 << $0_1 | 0;
               $361 = $4_1;
               $4_1 = (($4_1 + 520192 | 0) >>> 16 | 0) & 4 | 0;
               $6_1 = $361 << $4_1 | 0;
               $368 = $6_1;
               $6_1 = (($6_1 + 245760 | 0) >>> 16 | 0) & 2 | 0;
               $0_1 = (($368 << $6_1 | 0) >>> 15 | 0) - ($0_1 | $4_1 | 0 | $6_1 | 0) | 0;
               $12_1 = ($0_1 << 1 | 0 | (($3_1 >>> ($0_1 + 21 | 0) | 0) & 1 | 0) | 0) + 28 | 0;
              }
              $4_1 = 0 - $3_1 | 0;
              label$31 : {
               label$32 : {
                label$33 : {
                 label$34 : {
                  $6_1 = HEAP32[(($12_1 << 2 | 0) + 3464 | 0) >> 2] | 0;
                  if ($6_1) {
                   break label$34
                  }
                  $0_1 = 0;
                  $8_1 = 0;
                  break label$33;
                 }
                 $0_1 = 0;
                 $5_1 = $3_1 << (($12_1 | 0) == (31 | 0) ? 0 : 25 - ($12_1 >>> 1 | 0) | 0) | 0;
                 $8_1 = 0;
                 label$35 : while (1) {
                  label$36 : {
                   $2_1 = ((HEAP32[($6_1 + 4 | 0) >> 2] | 0) & -8 | 0) - $3_1 | 0;
                   if ($2_1 >>> 0 >= $4_1 >>> 0) {
                    break label$36
                   }
                   $4_1 = $2_1;
                   $8_1 = $6_1;
                   if ($4_1) {
                    break label$36
                   }
                   $4_1 = 0;
                   $8_1 = $6_1;
                   $0_1 = $6_1;
                   break label$32;
                  }
                  $2_1 = HEAP32[($6_1 + 20 | 0) >> 2] | 0;
                  $6_1 = HEAP32[(($6_1 + (($5_1 >>> 29 | 0) & 4 | 0) | 0) + 16 | 0) >> 2] | 0;
                  $0_1 = $2_1 ? (($2_1 | 0) == ($6_1 | 0) ? $0_1 : $2_1) : $0_1;
                  $5_1 = $5_1 << 1 | 0;
                  if ($6_1) {
                   continue label$35
                  }
                  break label$35;
                 };
                }
                label$37 : {
                 if ($0_1 | $8_1 | 0) {
                  break label$37
                 }
                 $0_1 = 2 << $12_1 | 0;
                 $0_1 = ($0_1 | (0 - $0_1 | 0) | 0) & $7_1 | 0;
                 if (!$0_1) {
                  break label$12
                 }
                 $0_1 = ($0_1 & (0 - $0_1 | 0) | 0) + -1 | 0;
                 $459 = $0_1;
                 $0_1 = ($0_1 >>> 12 | 0) & 16 | 0;
                 $6_1 = $459 >>> $0_1 | 0;
                 $5_1 = ($6_1 >>> 5 | 0) & 8 | 0;
                 $470 = $5_1 | $0_1 | 0;
                 $0_1 = $6_1 >>> $5_1 | 0;
                 $6_1 = ($0_1 >>> 2 | 0) & 4 | 0;
                 $478 = $470 | $6_1 | 0;
                 $0_1 = $0_1 >>> $6_1 | 0;
                 $6_1 = ($0_1 >>> 1 | 0) & 2 | 0;
                 $486 = $478 | $6_1 | 0;
                 $0_1 = $0_1 >>> $6_1 | 0;
                 $6_1 = ($0_1 >>> 1 | 0) & 1 | 0;
                 $0_1 = HEAP32[(((($486 | $6_1 | 0) + ($0_1 >>> $6_1 | 0) | 0) << 2 | 0) + 3464 | 0) >> 2] | 0;
                }
                if (!$0_1) {
                 break label$31
                }
               }
               label$38 : while (1) {
                $2_1 = ((HEAP32[($0_1 + 4 | 0) >> 2] | 0) & -8 | 0) - $3_1 | 0;
                $5_1 = $2_1 >>> 0 < $4_1 >>> 0;
                label$39 : {
                 $6_1 = HEAP32[($0_1 + 16 | 0) >> 2] | 0;
                 if ($6_1) {
                  break label$39
                 }
                 $6_1 = HEAP32[($0_1 + 20 | 0) >> 2] | 0;
                }
                $4_1 = $5_1 ? $2_1 : $4_1;
                $8_1 = $5_1 ? $0_1 : $8_1;
                $0_1 = $6_1;
                if ($0_1) {
                 continue label$38
                }
                break label$38;
               };
              }
              if (!$8_1) {
               break label$12
              }
              if ($4_1 >>> 0 >= ((HEAP32[(0 + 3168 | 0) >> 2] | 0) - $3_1 | 0) >>> 0) {
               break label$12
              }
              $12_1 = $8_1 + $3_1 | 0;
              if ($12_1 >>> 0 <= $8_1 >>> 0) {
               break label$11
              }
              $9_1 = HEAP32[($8_1 + 24 | 0) >> 2] | 0;
              label$40 : {
               $5_1 = HEAP32[($8_1 + 12 | 0) >> 2] | 0;
               if (($5_1 | 0) == ($8_1 | 0)) {
                break label$40
               }
               label$41 : {
                $0_1 = HEAP32[($8_1 + 8 | 0) >> 2] | 0;
                if ((HEAP32[(0 + 3176 | 0) >> 2] | 0) >>> 0 > $0_1 >>> 0) {
                 break label$41
                }
                HEAP32[($0_1 + 12 | 0) >> 2] | 0;
               }
               HEAP32[($0_1 + 12 | 0) >> 2] = $5_1;
               HEAP32[($5_1 + 8 | 0) >> 2] = $0_1;
               break label$3;
              }
              label$42 : {
               $6_1 = $8_1 + 20 | 0;
               $0_1 = HEAP32[$6_1 >> 2] | 0;
               if ($0_1) {
                break label$42
               }
               $0_1 = HEAP32[($8_1 + 16 | 0) >> 2] | 0;
               if (!$0_1) {
                break label$9
               }
               $6_1 = $8_1 + 16 | 0;
              }
              label$43 : while (1) {
               $2_1 = $6_1;
               $5_1 = $0_1;
               $6_1 = $0_1 + 20 | 0;
               $0_1 = HEAP32[$6_1 >> 2] | 0;
               if ($0_1) {
                continue label$43
               }
               $6_1 = $5_1 + 16 | 0;
               $0_1 = HEAP32[($5_1 + 16 | 0) >> 2] | 0;
               if ($0_1) {
                continue label$43
               }
               break label$43;
              };
              HEAP32[$2_1 >> 2] = 0;
              break label$3;
             }
             label$44 : {
              $0_1 = HEAP32[(0 + 3168 | 0) >> 2] | 0;
              if ($0_1 >>> 0 < $3_1 >>> 0) {
               break label$44
              }
              $4_1 = HEAP32[(0 + 3180 | 0) >> 2] | 0;
              label$45 : {
               label$46 : {
                $6_1 = $0_1 - $3_1 | 0;
                if ($6_1 >>> 0 < 16 >>> 0) {
                 break label$46
                }
                HEAP32[(0 + 3168 | 0) >> 2] = $6_1;
                $5_1 = $4_1 + $3_1 | 0;
                HEAP32[(0 + 3180 | 0) >> 2] = $5_1;
                HEAP32[($5_1 + 4 | 0) >> 2] = $6_1 | 1 | 0;
                HEAP32[($4_1 + $0_1 | 0) >> 2] = $6_1;
                HEAP32[($4_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
                break label$45;
               }
               HEAP32[(0 + 3180 | 0) >> 2] = 0;
               HEAP32[(0 + 3168 | 0) >> 2] = 0;
               HEAP32[($4_1 + 4 | 0) >> 2] = $0_1 | 3 | 0;
               $0_1 = $4_1 + $0_1 | 0;
               HEAP32[($0_1 + 4 | 0) >> 2] = HEAP32[($0_1 + 4 | 0) >> 2] | 0 | 1 | 0;
              }
              $0_1 = $4_1 + 8 | 0;
              break label$1;
             }
             label$47 : {
              $5_1 = HEAP32[(0 + 3172 | 0) >> 2] | 0;
              if ($5_1 >>> 0 <= $3_1 >>> 0) {
               break label$47
              }
              $4_1 = $5_1 - $3_1 | 0;
              HEAP32[(0 + 3172 | 0) >> 2] = $4_1;
              $0_1 = HEAP32[(0 + 3184 | 0) >> 2] | 0;
              $6_1 = $0_1 + $3_1 | 0;
              HEAP32[(0 + 3184 | 0) >> 2] = $6_1;
              HEAP32[($6_1 + 4 | 0) >> 2] = $4_1 | 1 | 0;
              HEAP32[($0_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
              $0_1 = $0_1 + 8 | 0;
              break label$1;
             }
             label$48 : {
              label$49 : {
               if (!(HEAP32[(0 + 3632 | 0) >> 2] | 0)) {
                break label$49
               }
               $4_1 = HEAP32[(0 + 3640 | 0) >> 2] | 0;
               break label$48;
              }
              i64toi32_i32$1 = 0;
              i64toi32_i32$0 = -1;
              HEAP32[(i64toi32_i32$1 + 3644 | 0) >> 2] = -1;
              HEAP32[(i64toi32_i32$1 + 3648 | 0) >> 2] = i64toi32_i32$0;
              i64toi32_i32$1 = 0;
              i64toi32_i32$0 = 4096;
              HEAP32[(i64toi32_i32$1 + 3636 | 0) >> 2] = 4096;
              HEAP32[(i64toi32_i32$1 + 3640 | 0) >> 2] = i64toi32_i32$0;
              HEAP32[(0 + 3632 | 0) >> 2] = (($1_1 + 12 | 0) & -16 | 0) ^ 1431655768 | 0;
              HEAP32[(0 + 3652 | 0) >> 2] = 0;
              HEAP32[(0 + 3604 | 0) >> 2] = 0;
              $4_1 = 4096;
             }
             $0_1 = 0;
             $7_1 = $3_1 + 47 | 0;
             $2_1 = $4_1 + $7_1 | 0;
             $12_1 = 0 - $4_1 | 0;
             $8_1 = $2_1 & $12_1 | 0;
             if ($8_1 >>> 0 <= $3_1 >>> 0) {
              break label$1
             }
             $0_1 = 0;
             label$50 : {
              $4_1 = HEAP32[(0 + 3600 | 0) >> 2] | 0;
              if (!$4_1) {
               break label$50
              }
              $6_1 = HEAP32[(0 + 3592 | 0) >> 2] | 0;
              $9_1 = $6_1 + $8_1 | 0;
              if ($9_1 >>> 0 <= $6_1 >>> 0) {
               break label$1
              }
              if ($9_1 >>> 0 > $4_1 >>> 0) {
               break label$1
              }
             }
             if ((HEAPU8[(0 + 3604 | 0) >> 0] | 0) & 4 | 0) {
              break label$6
             }
             label$51 : {
              label$52 : {
               label$53 : {
                $4_1 = HEAP32[(0 + 3184 | 0) >> 2] | 0;
                if (!$4_1) {
                 break label$53
                }
                $0_1 = 3608;
                label$54 : while (1) {
                 label$55 : {
                  $6_1 = HEAP32[$0_1 >> 2] | 0;
                  if ($6_1 >>> 0 > $4_1 >>> 0) {
                   break label$55
                  }
                  if (($6_1 + (HEAP32[($0_1 + 4 | 0) >> 2] | 0) | 0) >>> 0 > $4_1 >>> 0) {
                   break label$52
                  }
                 }
                 $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
                 if ($0_1) {
                  continue label$54
                 }
                 break label$54;
                };
               }
               $5_1 = $22(0 | 0) | 0;
               if (($5_1 | 0) == (-1 | 0)) {
                break label$7
               }
               $2_1 = $8_1;
               label$56 : {
                $0_1 = HEAP32[(0 + 3636 | 0) >> 2] | 0;
                $4_1 = $0_1 + -1 | 0;
                if (!($4_1 & $5_1 | 0)) {
                 break label$56
                }
                $2_1 = ($8_1 - $5_1 | 0) + (($4_1 + $5_1 | 0) & (0 - $0_1 | 0) | 0) | 0;
               }
               if ($2_1 >>> 0 <= $3_1 >>> 0) {
                break label$7
               }
               if ($2_1 >>> 0 > 2147483646 >>> 0) {
                break label$7
               }
               label$57 : {
                $0_1 = HEAP32[(0 + 3600 | 0) >> 2] | 0;
                if (!$0_1) {
                 break label$57
                }
                $4_1 = HEAP32[(0 + 3592 | 0) >> 2] | 0;
                $6_1 = $4_1 + $2_1 | 0;
                if ($6_1 >>> 0 <= $4_1 >>> 0) {
                 break label$7
                }
                if ($6_1 >>> 0 > $0_1 >>> 0) {
                 break label$7
                }
               }
               $0_1 = $22($2_1 | 0) | 0;
               if (($0_1 | 0) != ($5_1 | 0)) {
                break label$51
               }
               break label$5;
              }
              $2_1 = ($2_1 - $5_1 | 0) & $12_1 | 0;
              if ($2_1 >>> 0 > 2147483646 >>> 0) {
               break label$7
              }
              $5_1 = $22($2_1 | 0) | 0;
              if (($5_1 | 0) == ((HEAP32[$0_1 >> 2] | 0) + (HEAP32[($0_1 + 4 | 0) >> 2] | 0) | 0 | 0)) {
               break label$8
              }
              $0_1 = $5_1;
             }
             label$58 : {
              if (($3_1 + 48 | 0) >>> 0 <= $2_1 >>> 0) {
               break label$58
              }
              if (($0_1 | 0) == (-1 | 0)) {
               break label$58
              }
              label$59 : {
               $4_1 = HEAP32[(0 + 3640 | 0) >> 2] | 0;
               $4_1 = (($7_1 - $2_1 | 0) + $4_1 | 0) & (0 - $4_1 | 0) | 0;
               if ($4_1 >>> 0 <= 2147483646 >>> 0) {
                break label$59
               }
               $5_1 = $0_1;
               break label$5;
              }
              label$60 : {
               if (($22($4_1 | 0) | 0 | 0) == (-1 | 0)) {
                break label$60
               }
               $2_1 = $4_1 + $2_1 | 0;
               $5_1 = $0_1;
               break label$5;
              }
              $22(0 - $2_1 | 0 | 0) | 0;
              break label$7;
             }
             $5_1 = $0_1;
             if (($0_1 | 0) != (-1 | 0)) {
              break label$5
             }
             break label$7;
            }
            abort();
           }
           $8_1 = 0;
           break label$2;
          }
          $5_1 = 0;
          break label$3;
         }
         if (($5_1 | 0) != (-1 | 0)) {
          break label$5
         }
        }
        HEAP32[(0 + 3604 | 0) >> 2] = HEAP32[(0 + 3604 | 0) >> 2] | 0 | 4 | 0;
       }
       if ($8_1 >>> 0 > 2147483646 >>> 0) {
        break label$4
       }
       $5_1 = $22($8_1 | 0) | 0;
       $0_1 = $22(0 | 0) | 0;
       if ($5_1 >>> 0 >= $0_1 >>> 0) {
        break label$4
       }
       if (($5_1 | 0) == (-1 | 0)) {
        break label$4
       }
       if (($0_1 | 0) == (-1 | 0)) {
        break label$4
       }
       $2_1 = $0_1 - $5_1 | 0;
       if ($2_1 >>> 0 <= ($3_1 + 40 | 0) >>> 0) {
        break label$4
       }
      }
      $0_1 = (HEAP32[(0 + 3592 | 0) >> 2] | 0) + $2_1 | 0;
      HEAP32[(0 + 3592 | 0) >> 2] = $0_1;
      label$61 : {
       if ($0_1 >>> 0 <= (HEAP32[(0 + 3596 | 0) >> 2] | 0) >>> 0) {
        break label$61
       }
       HEAP32[(0 + 3596 | 0) >> 2] = $0_1;
      }
      label$62 : {
       label$63 : {
        label$64 : {
         label$65 : {
          $4_1 = HEAP32[(0 + 3184 | 0) >> 2] | 0;
          if (!$4_1) {
           break label$65
          }
          $0_1 = 3608;
          label$66 : while (1) {
           $6_1 = HEAP32[$0_1 >> 2] | 0;
           $8_1 = HEAP32[($0_1 + 4 | 0) >> 2] | 0;
           if (($5_1 | 0) == ($6_1 + $8_1 | 0 | 0)) {
            break label$64
           }
           $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
           if ($0_1) {
            continue label$66
           }
           break label$63;
          };
         }
         label$67 : {
          label$68 : {
           $0_1 = HEAP32[(0 + 3176 | 0) >> 2] | 0;
           if (!$0_1) {
            break label$68
           }
           if ($5_1 >>> 0 >= $0_1 >>> 0) {
            break label$67
           }
          }
          HEAP32[(0 + 3176 | 0) >> 2] = $5_1;
         }
         $0_1 = 0;
         HEAP32[(0 + 3612 | 0) >> 2] = $2_1;
         HEAP32[(0 + 3608 | 0) >> 2] = $5_1;
         HEAP32[(0 + 3192 | 0) >> 2] = -1;
         HEAP32[(0 + 3196 | 0) >> 2] = HEAP32[(0 + 3632 | 0) >> 2] | 0;
         HEAP32[(0 + 3620 | 0) >> 2] = 0;
         label$69 : while (1) {
          $4_1 = $0_1 << 3 | 0;
          $6_1 = $4_1 + 3200 | 0;
          HEAP32[($4_1 + 3208 | 0) >> 2] = $6_1;
          HEAP32[($4_1 + 3212 | 0) >> 2] = $6_1;
          $0_1 = $0_1 + 1 | 0;
          if (($0_1 | 0) != (32 | 0)) {
           continue label$69
          }
          break label$69;
         };
         $0_1 = $2_1 + -40 | 0;
         $4_1 = ($5_1 + 8 | 0) & 7 | 0 ? (-8 - $5_1 | 0) & 7 | 0 : 0;
         $6_1 = $0_1 - $4_1 | 0;
         HEAP32[(0 + 3172 | 0) >> 2] = $6_1;
         $4_1 = $5_1 + $4_1 | 0;
         HEAP32[(0 + 3184 | 0) >> 2] = $4_1;
         HEAP32[($4_1 + 4 | 0) >> 2] = $6_1 | 1 | 0;
         HEAP32[(($5_1 + $0_1 | 0) + 4 | 0) >> 2] = 40;
         HEAP32[(0 + 3188 | 0) >> 2] = HEAP32[(0 + 3648 | 0) >> 2] | 0;
         break label$62;
        }
        if ((HEAPU8[($0_1 + 12 | 0) >> 0] | 0) & 8 | 0) {
         break label$63
        }
        if ($5_1 >>> 0 <= $4_1 >>> 0) {
         break label$63
        }
        if ($6_1 >>> 0 > $4_1 >>> 0) {
         break label$63
        }
        HEAP32[($0_1 + 4 | 0) >> 2] = $8_1 + $2_1 | 0;
        $0_1 = ($4_1 + 8 | 0) & 7 | 0 ? (-8 - $4_1 | 0) & 7 | 0 : 0;
        $6_1 = $4_1 + $0_1 | 0;
        HEAP32[(0 + 3184 | 0) >> 2] = $6_1;
        $5_1 = (HEAP32[(0 + 3172 | 0) >> 2] | 0) + $2_1 | 0;
        $0_1 = $5_1 - $0_1 | 0;
        HEAP32[(0 + 3172 | 0) >> 2] = $0_1;
        HEAP32[($6_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
        HEAP32[(($4_1 + $5_1 | 0) + 4 | 0) >> 2] = 40;
        HEAP32[(0 + 3188 | 0) >> 2] = HEAP32[(0 + 3648 | 0) >> 2] | 0;
        break label$62;
       }
       label$70 : {
        $8_1 = HEAP32[(0 + 3176 | 0) >> 2] | 0;
        if ($5_1 >>> 0 >= $8_1 >>> 0) {
         break label$70
        }
        HEAP32[(0 + 3176 | 0) >> 2] = $5_1;
        $8_1 = $5_1;
       }
       $6_1 = $5_1 + $2_1 | 0;
       $0_1 = 3608;
       label$71 : {
        label$72 : {
         label$73 : {
          label$74 : {
           label$75 : {
            label$76 : {
             label$77 : {
              label$78 : while (1) {
               if ((HEAP32[$0_1 >> 2] | 0 | 0) == ($6_1 | 0)) {
                break label$77
               }
               $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
               if ($0_1) {
                continue label$78
               }
               break label$76;
              };
             }
             if (!((HEAPU8[($0_1 + 12 | 0) >> 0] | 0) & 8 | 0)) {
              break label$75
             }
            }
            $0_1 = 3608;
            label$79 : while (1) {
             label$80 : {
              $6_1 = HEAP32[$0_1 >> 2] | 0;
              if ($6_1 >>> 0 > $4_1 >>> 0) {
               break label$80
              }
              $6_1 = $6_1 + (HEAP32[($0_1 + 4 | 0) >> 2] | 0) | 0;
              if ($6_1 >>> 0 > $4_1 >>> 0) {
               break label$74
              }
             }
             $0_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
             continue label$79;
            };
           }
           HEAP32[$0_1 >> 2] = $5_1;
           HEAP32[($0_1 + 4 | 0) >> 2] = (HEAP32[($0_1 + 4 | 0) >> 2] | 0) + $2_1 | 0;
           $12_1 = $5_1 + (($5_1 + 8 | 0) & 7 | 0 ? (-8 - $5_1 | 0) & 7 | 0 : 0) | 0;
           HEAP32[($12_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
           $5_1 = $6_1 + (($6_1 + 8 | 0) & 7 | 0 ? (-8 - $6_1 | 0) & 7 | 0 : 0) | 0;
           $0_1 = ($5_1 - $12_1 | 0) - $3_1 | 0;
           $6_1 = $12_1 + $3_1 | 0;
           label$81 : {
            if (($4_1 | 0) != ($5_1 | 0)) {
             break label$81
            }
            HEAP32[(0 + 3184 | 0) >> 2] = $6_1;
            $0_1 = (HEAP32[(0 + 3172 | 0) >> 2] | 0) + $0_1 | 0;
            HEAP32[(0 + 3172 | 0) >> 2] = $0_1;
            HEAP32[($6_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
            break label$72;
           }
           label$82 : {
            if ((HEAP32[(0 + 3180 | 0) >> 2] | 0 | 0) != ($5_1 | 0)) {
             break label$82
            }
            HEAP32[(0 + 3180 | 0) >> 2] = $6_1;
            $0_1 = (HEAP32[(0 + 3168 | 0) >> 2] | 0) + $0_1 | 0;
            HEAP32[(0 + 3168 | 0) >> 2] = $0_1;
            HEAP32[($6_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
            HEAP32[($6_1 + $0_1 | 0) >> 2] = $0_1;
            break label$72;
           }
           label$83 : {
            $4_1 = HEAP32[($5_1 + 4 | 0) >> 2] | 0;
            if (($4_1 & 3 | 0 | 0) != (1 | 0)) {
             break label$83
            }
            $7_1 = $4_1 & -8 | 0;
            label$84 : {
             label$85 : {
              if ($4_1 >>> 0 > 255 >>> 0) {
               break label$85
              }
              $3_1 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
              label$86 : {
               $2_1 = HEAP32[($5_1 + 8 | 0) >> 2] | 0;
               $9_1 = $4_1 >>> 3 | 0;
               $4_1 = ($9_1 << 3 | 0) + 3200 | 0;
               if (($2_1 | 0) == ($4_1 | 0)) {
                break label$86
               }
              }
              label$87 : {
               if (($3_1 | 0) != ($2_1 | 0)) {
                break label$87
               }
               HEAP32[(0 + 3160 | 0) >> 2] = (HEAP32[(0 + 3160 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $9_1 | 0) | 0) | 0;
               break label$84;
              }
              label$88 : {
               if (($3_1 | 0) == ($4_1 | 0)) {
                break label$88
               }
              }
              HEAP32[($2_1 + 12 | 0) >> 2] = $3_1;
              HEAP32[($3_1 + 8 | 0) >> 2] = $2_1;
              break label$84;
             }
             $9_1 = HEAP32[($5_1 + 24 | 0) >> 2] | 0;
             label$89 : {
              label$90 : {
               $2_1 = HEAP32[($5_1 + 12 | 0) >> 2] | 0;
               if (($2_1 | 0) == ($5_1 | 0)) {
                break label$90
               }
               label$91 : {
                $4_1 = HEAP32[($5_1 + 8 | 0) >> 2] | 0;
                if ($8_1 >>> 0 > $4_1 >>> 0) {
                 break label$91
                }
                HEAP32[($4_1 + 12 | 0) >> 2] | 0;
               }
               HEAP32[($4_1 + 12 | 0) >> 2] = $2_1;
               HEAP32[($2_1 + 8 | 0) >> 2] = $4_1;
               break label$89;
              }
              label$92 : {
               $4_1 = $5_1 + 20 | 0;
               $3_1 = HEAP32[$4_1 >> 2] | 0;
               if ($3_1) {
                break label$92
               }
               $4_1 = $5_1 + 16 | 0;
               $3_1 = HEAP32[$4_1 >> 2] | 0;
               if ($3_1) {
                break label$92
               }
               $2_1 = 0;
               break label$89;
              }
              label$93 : while (1) {
               $8_1 = $4_1;
               $2_1 = $3_1;
               $4_1 = $3_1 + 20 | 0;
               $3_1 = HEAP32[$4_1 >> 2] | 0;
               if ($3_1) {
                continue label$93
               }
               $4_1 = $2_1 + 16 | 0;
               $3_1 = HEAP32[($2_1 + 16 | 0) >> 2] | 0;
               if ($3_1) {
                continue label$93
               }
               break label$93;
              };
              HEAP32[$8_1 >> 2] = 0;
             }
             if (!$9_1) {
              break label$84
             }
             label$94 : {
              label$95 : {
               $3_1 = HEAP32[($5_1 + 28 | 0) >> 2] | 0;
               $4_1 = ($3_1 << 2 | 0) + 3464 | 0;
               if ((HEAP32[$4_1 >> 2] | 0 | 0) != ($5_1 | 0)) {
                break label$95
               }
               HEAP32[$4_1 >> 2] = $2_1;
               if ($2_1) {
                break label$94
               }
               HEAP32[(0 + 3164 | 0) >> 2] = (HEAP32[(0 + 3164 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $3_1 | 0) | 0) | 0;
               break label$84;
              }
              HEAP32[($9_1 + ((HEAP32[($9_1 + 16 | 0) >> 2] | 0 | 0) == ($5_1 | 0) ? 16 : 20) | 0) >> 2] = $2_1;
              if (!$2_1) {
               break label$84
              }
             }
             HEAP32[($2_1 + 24 | 0) >> 2] = $9_1;
             label$96 : {
              $4_1 = HEAP32[($5_1 + 16 | 0) >> 2] | 0;
              if (!$4_1) {
               break label$96
              }
              HEAP32[($2_1 + 16 | 0) >> 2] = $4_1;
              HEAP32[($4_1 + 24 | 0) >> 2] = $2_1;
             }
             $4_1 = HEAP32[($5_1 + 20 | 0) >> 2] | 0;
             if (!$4_1) {
              break label$84
             }
             HEAP32[($2_1 + 20 | 0) >> 2] = $4_1;
             HEAP32[($4_1 + 24 | 0) >> 2] = $2_1;
            }
            $0_1 = $7_1 + $0_1 | 0;
            $5_1 = $5_1 + $7_1 | 0;
           }
           HEAP32[($5_1 + 4 | 0) >> 2] = (HEAP32[($5_1 + 4 | 0) >> 2] | 0) & -2 | 0;
           HEAP32[($6_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
           HEAP32[($6_1 + $0_1 | 0) >> 2] = $0_1;
           label$97 : {
            if ($0_1 >>> 0 > 255 >>> 0) {
             break label$97
            }
            $4_1 = $0_1 >>> 3 | 0;
            $0_1 = ($4_1 << 3 | 0) + 3200 | 0;
            label$98 : {
             label$99 : {
              $3_1 = HEAP32[(0 + 3160 | 0) >> 2] | 0;
              $4_1 = 1 << $4_1 | 0;
              if ($3_1 & $4_1 | 0) {
               break label$99
              }
              HEAP32[(0 + 3160 | 0) >> 2] = $3_1 | $4_1 | 0;
              $4_1 = $0_1;
              break label$98;
             }
             $4_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
            }
            HEAP32[($0_1 + 8 | 0) >> 2] = $6_1;
            HEAP32[($4_1 + 12 | 0) >> 2] = $6_1;
            HEAP32[($6_1 + 12 | 0) >> 2] = $0_1;
            HEAP32[($6_1 + 8 | 0) >> 2] = $4_1;
            break label$72;
           }
           $4_1 = 31;
           label$100 : {
            if ($0_1 >>> 0 > 16777215 >>> 0) {
             break label$100
            }
            $4_1 = $0_1 >>> 8 | 0;
            $1194 = $4_1;
            $4_1 = (($4_1 + 1048320 | 0) >>> 16 | 0) & 8 | 0;
            $3_1 = $1194 << $4_1 | 0;
            $1201 = $3_1;
            $3_1 = (($3_1 + 520192 | 0) >>> 16 | 0) & 4 | 0;
            $5_1 = $1201 << $3_1 | 0;
            $1208 = $5_1;
            $5_1 = (($5_1 + 245760 | 0) >>> 16 | 0) & 2 | 0;
            $4_1 = (($1208 << $5_1 | 0) >>> 15 | 0) - ($4_1 | $3_1 | 0 | $5_1 | 0) | 0;
            $4_1 = ($4_1 << 1 | 0 | (($0_1 >>> ($4_1 + 21 | 0) | 0) & 1 | 0) | 0) + 28 | 0;
           }
           HEAP32[($6_1 + 28 | 0) >> 2] = $4_1;
           i64toi32_i32$1 = $6_1;
           i64toi32_i32$0 = 0;
           HEAP32[($6_1 + 16 | 0) >> 2] = 0;
           HEAP32[($6_1 + 20 | 0) >> 2] = i64toi32_i32$0;
           $3_1 = ($4_1 << 2 | 0) + 3464 | 0;
           label$101 : {
            label$102 : {
             $5_1 = HEAP32[(0 + 3164 | 0) >> 2] | 0;
             $8_1 = 1 << $4_1 | 0;
             if ($5_1 & $8_1 | 0) {
              break label$102
             }
             HEAP32[(0 + 3164 | 0) >> 2] = $5_1 | $8_1 | 0;
             HEAP32[$3_1 >> 2] = $6_1;
             HEAP32[($6_1 + 24 | 0) >> 2] = $3_1;
             break label$101;
            }
            $4_1 = $0_1 << (($4_1 | 0) == (31 | 0) ? 0 : 25 - ($4_1 >>> 1 | 0) | 0) | 0;
            $5_1 = HEAP32[$3_1 >> 2] | 0;
            label$103 : while (1) {
             $3_1 = $5_1;
             if (((HEAP32[($5_1 + 4 | 0) >> 2] | 0) & -8 | 0 | 0) == ($0_1 | 0)) {
              break label$73
             }
             $5_1 = $4_1 >>> 29 | 0;
             $4_1 = $4_1 << 1 | 0;
             $8_1 = ($3_1 + ($5_1 & 4 | 0) | 0) + 16 | 0;
             $5_1 = HEAP32[$8_1 >> 2] | 0;
             if ($5_1) {
              continue label$103
             }
             break label$103;
            };
            HEAP32[$8_1 >> 2] = $6_1;
            HEAP32[($6_1 + 24 | 0) >> 2] = $3_1;
           }
           HEAP32[($6_1 + 12 | 0) >> 2] = $6_1;
           HEAP32[($6_1 + 8 | 0) >> 2] = $6_1;
           break label$72;
          }
          $0_1 = $2_1 + -40 | 0;
          $8_1 = ($5_1 + 8 | 0) & 7 | 0 ? (-8 - $5_1 | 0) & 7 | 0 : 0;
          $12_1 = $0_1 - $8_1 | 0;
          HEAP32[(0 + 3172 | 0) >> 2] = $12_1;
          $8_1 = $5_1 + $8_1 | 0;
          HEAP32[(0 + 3184 | 0) >> 2] = $8_1;
          HEAP32[($8_1 + 4 | 0) >> 2] = $12_1 | 1 | 0;
          HEAP32[(($5_1 + $0_1 | 0) + 4 | 0) >> 2] = 40;
          HEAP32[(0 + 3188 | 0) >> 2] = HEAP32[(0 + 3648 | 0) >> 2] | 0;
          $0_1 = ($6_1 + (($6_1 + -39 | 0) & 7 | 0 ? (39 - $6_1 | 0) & 7 | 0 : 0) | 0) + -47 | 0;
          $8_1 = $0_1 >>> 0 < ($4_1 + 16 | 0) >>> 0 ? $4_1 : $0_1;
          HEAP32[($8_1 + 4 | 0) >> 2] = 27;
          i64toi32_i32$2 = 0;
          i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 3616 | 0) >> 2] | 0;
          i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 3620 | 0) >> 2] | 0;
          $1330 = i64toi32_i32$0;
          i64toi32_i32$0 = $8_1 + 16 | 0;
          HEAP32[i64toi32_i32$0 >> 2] = $1330;
          HEAP32[(i64toi32_i32$0 + 4 | 0) >> 2] = i64toi32_i32$1;
          i64toi32_i32$2 = 0;
          i64toi32_i32$1 = HEAP32[(i64toi32_i32$2 + 3608 | 0) >> 2] | 0;
          i64toi32_i32$0 = HEAP32[(i64toi32_i32$2 + 3612 | 0) >> 2] | 0;
          $1332 = i64toi32_i32$1;
          i64toi32_i32$1 = $8_1;
          HEAP32[($8_1 + 8 | 0) >> 2] = $1332;
          HEAP32[($8_1 + 12 | 0) >> 2] = i64toi32_i32$0;
          HEAP32[(0 + 3616 | 0) >> 2] = $8_1 + 8 | 0;
          HEAP32[(0 + 3612 | 0) >> 2] = $2_1;
          HEAP32[(0 + 3608 | 0) >> 2] = $5_1;
          HEAP32[(0 + 3620 | 0) >> 2] = 0;
          $0_1 = $8_1 + 24 | 0;
          label$104 : while (1) {
           HEAP32[($0_1 + 4 | 0) >> 2] = 7;
           $5_1 = $0_1 + 8 | 0;
           $0_1 = $0_1 + 4 | 0;
           if ($6_1 >>> 0 > $5_1 >>> 0) {
            continue label$104
           }
           break label$104;
          };
          if (($8_1 | 0) == ($4_1 | 0)) {
           break label$62
          }
          HEAP32[($8_1 + 4 | 0) >> 2] = (HEAP32[($8_1 + 4 | 0) >> 2] | 0) & -2 | 0;
          $2_1 = $8_1 - $4_1 | 0;
          HEAP32[($4_1 + 4 | 0) >> 2] = $2_1 | 1 | 0;
          HEAP32[$8_1 >> 2] = $2_1;
          label$105 : {
           if ($2_1 >>> 0 > 255 >>> 0) {
            break label$105
           }
           $6_1 = $2_1 >>> 3 | 0;
           $0_1 = ($6_1 << 3 | 0) + 3200 | 0;
           label$106 : {
            label$107 : {
             $5_1 = HEAP32[(0 + 3160 | 0) >> 2] | 0;
             $6_1 = 1 << $6_1 | 0;
             if ($5_1 & $6_1 | 0) {
              break label$107
             }
             HEAP32[(0 + 3160 | 0) >> 2] = $5_1 | $6_1 | 0;
             $6_1 = $0_1;
             break label$106;
            }
            $6_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
           }
           HEAP32[($0_1 + 8 | 0) >> 2] = $4_1;
           HEAP32[($6_1 + 12 | 0) >> 2] = $4_1;
           HEAP32[($4_1 + 12 | 0) >> 2] = $0_1;
           HEAP32[($4_1 + 8 | 0) >> 2] = $6_1;
           break label$62;
          }
          $0_1 = 31;
          label$108 : {
           if ($2_1 >>> 0 > 16777215 >>> 0) {
            break label$108
           }
           $0_1 = $2_1 >>> 8 | 0;
           $1393 = $0_1;
           $0_1 = (($0_1 + 1048320 | 0) >>> 16 | 0) & 8 | 0;
           $6_1 = $1393 << $0_1 | 0;
           $1400 = $6_1;
           $6_1 = (($6_1 + 520192 | 0) >>> 16 | 0) & 4 | 0;
           $5_1 = $1400 << $6_1 | 0;
           $1407 = $5_1;
           $5_1 = (($5_1 + 245760 | 0) >>> 16 | 0) & 2 | 0;
           $0_1 = (($1407 << $5_1 | 0) >>> 15 | 0) - ($0_1 | $6_1 | 0 | $5_1 | 0) | 0;
           $0_1 = ($0_1 << 1 | 0 | (($2_1 >>> ($0_1 + 21 | 0) | 0) & 1 | 0) | 0) + 28 | 0;
          }
          i64toi32_i32$1 = $4_1;
          i64toi32_i32$0 = 0;
          HEAP32[($4_1 + 16 | 0) >> 2] = 0;
          HEAP32[($4_1 + 20 | 0) >> 2] = i64toi32_i32$0;
          HEAP32[($4_1 + 28 | 0) >> 2] = $0_1;
          $6_1 = ($0_1 << 2 | 0) + 3464 | 0;
          label$109 : {
           label$110 : {
            $5_1 = HEAP32[(0 + 3164 | 0) >> 2] | 0;
            $8_1 = 1 << $0_1 | 0;
            if ($5_1 & $8_1 | 0) {
             break label$110
            }
            HEAP32[(0 + 3164 | 0) >> 2] = $5_1 | $8_1 | 0;
            HEAP32[$6_1 >> 2] = $4_1;
            HEAP32[($4_1 + 24 | 0) >> 2] = $6_1;
            break label$109;
           }
           $0_1 = $2_1 << (($0_1 | 0) == (31 | 0) ? 0 : 25 - ($0_1 >>> 1 | 0) | 0) | 0;
           $5_1 = HEAP32[$6_1 >> 2] | 0;
           label$111 : while (1) {
            $6_1 = $5_1;
            if (((HEAP32[($6_1 + 4 | 0) >> 2] | 0) & -8 | 0 | 0) == ($2_1 | 0)) {
             break label$71
            }
            $5_1 = $0_1 >>> 29 | 0;
            $0_1 = $0_1 << 1 | 0;
            $8_1 = ($6_1 + ($5_1 & 4 | 0) | 0) + 16 | 0;
            $5_1 = HEAP32[$8_1 >> 2] | 0;
            if ($5_1) {
             continue label$111
            }
            break label$111;
           };
           HEAP32[$8_1 >> 2] = $4_1;
           HEAP32[($4_1 + 24 | 0) >> 2] = $6_1;
          }
          HEAP32[($4_1 + 12 | 0) >> 2] = $4_1;
          HEAP32[($4_1 + 8 | 0) >> 2] = $4_1;
          break label$62;
         }
         $0_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
         HEAP32[($0_1 + 12 | 0) >> 2] = $6_1;
         HEAP32[($3_1 + 8 | 0) >> 2] = $6_1;
         HEAP32[($6_1 + 24 | 0) >> 2] = 0;
         HEAP32[($6_1 + 12 | 0) >> 2] = $3_1;
         HEAP32[($6_1 + 8 | 0) >> 2] = $0_1;
        }
        $0_1 = $12_1 + 8 | 0;
        break label$1;
       }
       $0_1 = HEAP32[($6_1 + 8 | 0) >> 2] | 0;
       HEAP32[($0_1 + 12 | 0) >> 2] = $4_1;
       HEAP32[($6_1 + 8 | 0) >> 2] = $4_1;
       HEAP32[($4_1 + 24 | 0) >> 2] = 0;
       HEAP32[($4_1 + 12 | 0) >> 2] = $6_1;
       HEAP32[($4_1 + 8 | 0) >> 2] = $0_1;
      }
      $0_1 = HEAP32[(0 + 3172 | 0) >> 2] | 0;
      if ($0_1 >>> 0 <= $3_1 >>> 0) {
       break label$4
      }
      $4_1 = $0_1 - $3_1 | 0;
      HEAP32[(0 + 3172 | 0) >> 2] = $4_1;
      $0_1 = HEAP32[(0 + 3184 | 0) >> 2] | 0;
      $6_1 = $0_1 + $3_1 | 0;
      HEAP32[(0 + 3184 | 0) >> 2] = $6_1;
      HEAP32[($6_1 + 4 | 0) >> 2] = $4_1 | 1 | 0;
      HEAP32[($0_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
      $0_1 = $0_1 + 8 | 0;
      break label$1;
     }
     HEAP32[($19() | 0) >> 2] = 48;
     $0_1 = 0;
     break label$1;
    }
    label$112 : {
     if (!$9_1) {
      break label$112
     }
     label$113 : {
      label$114 : {
       $6_1 = HEAP32[($8_1 + 28 | 0) >> 2] | 0;
       $0_1 = ($6_1 << 2 | 0) + 3464 | 0;
       if (($8_1 | 0) != (HEAP32[$0_1 >> 2] | 0 | 0)) {
        break label$114
       }
       HEAP32[$0_1 >> 2] = $5_1;
       if ($5_1) {
        break label$113
       }
       $7_1 = $7_1 & (__wasm_rotl_i32(-2 | 0, $6_1 | 0) | 0) | 0;
       HEAP32[(0 + 3164 | 0) >> 2] = $7_1;
       break label$112;
      }
      HEAP32[($9_1 + ((HEAP32[($9_1 + 16 | 0) >> 2] | 0 | 0) == ($8_1 | 0) ? 16 : 20) | 0) >> 2] = $5_1;
      if (!$5_1) {
       break label$112
      }
     }
     HEAP32[($5_1 + 24 | 0) >> 2] = $9_1;
     label$115 : {
      $0_1 = HEAP32[($8_1 + 16 | 0) >> 2] | 0;
      if (!$0_1) {
       break label$115
      }
      HEAP32[($5_1 + 16 | 0) >> 2] = $0_1;
      HEAP32[($0_1 + 24 | 0) >> 2] = $5_1;
     }
     $0_1 = HEAP32[($8_1 + 20 | 0) >> 2] | 0;
     if (!$0_1) {
      break label$112
     }
     HEAP32[($5_1 + 20 | 0) >> 2] = $0_1;
     HEAP32[($0_1 + 24 | 0) >> 2] = $5_1;
    }
    label$116 : {
     label$117 : {
      if ($4_1 >>> 0 > 15 >>> 0) {
       break label$117
      }
      $0_1 = $4_1 + $3_1 | 0;
      HEAP32[($8_1 + 4 | 0) >> 2] = $0_1 | 3 | 0;
      $0_1 = $8_1 + $0_1 | 0;
      HEAP32[($0_1 + 4 | 0) >> 2] = HEAP32[($0_1 + 4 | 0) >> 2] | 0 | 1 | 0;
      break label$116;
     }
     HEAP32[($8_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
     HEAP32[($12_1 + 4 | 0) >> 2] = $4_1 | 1 | 0;
     HEAP32[($12_1 + $4_1 | 0) >> 2] = $4_1;
     label$118 : {
      if ($4_1 >>> 0 > 255 >>> 0) {
       break label$118
      }
      $4_1 = $4_1 >>> 3 | 0;
      $0_1 = ($4_1 << 3 | 0) + 3200 | 0;
      label$119 : {
       label$120 : {
        $6_1 = HEAP32[(0 + 3160 | 0) >> 2] | 0;
        $4_1 = 1 << $4_1 | 0;
        if ($6_1 & $4_1 | 0) {
         break label$120
        }
        HEAP32[(0 + 3160 | 0) >> 2] = $6_1 | $4_1 | 0;
        $4_1 = $0_1;
        break label$119;
       }
       $4_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
      }
      HEAP32[($0_1 + 8 | 0) >> 2] = $12_1;
      HEAP32[($4_1 + 12 | 0) >> 2] = $12_1;
      HEAP32[($12_1 + 12 | 0) >> 2] = $0_1;
      HEAP32[($12_1 + 8 | 0) >> 2] = $4_1;
      break label$116;
     }
     $0_1 = 31;
     label$121 : {
      if ($4_1 >>> 0 > 16777215 >>> 0) {
       break label$121
      }
      $0_1 = $4_1 >>> 8 | 0;
      $1640 = $0_1;
      $0_1 = (($0_1 + 1048320 | 0) >>> 16 | 0) & 8 | 0;
      $6_1 = $1640 << $0_1 | 0;
      $1647 = $6_1;
      $6_1 = (($6_1 + 520192 | 0) >>> 16 | 0) & 4 | 0;
      $3_1 = $1647 << $6_1 | 0;
      $1654 = $3_1;
      $3_1 = (($3_1 + 245760 | 0) >>> 16 | 0) & 2 | 0;
      $0_1 = (($1654 << $3_1 | 0) >>> 15 | 0) - ($0_1 | $6_1 | 0 | $3_1 | 0) | 0;
      $0_1 = ($0_1 << 1 | 0 | (($4_1 >>> ($0_1 + 21 | 0) | 0) & 1 | 0) | 0) + 28 | 0;
     }
     HEAP32[($12_1 + 28 | 0) >> 2] = $0_1;
     i64toi32_i32$1 = $12_1;
     i64toi32_i32$0 = 0;
     HEAP32[($12_1 + 16 | 0) >> 2] = 0;
     HEAP32[($12_1 + 20 | 0) >> 2] = i64toi32_i32$0;
     $6_1 = ($0_1 << 2 | 0) + 3464 | 0;
     label$122 : {
      label$123 : {
       label$124 : {
        $3_1 = 1 << $0_1 | 0;
        if ($7_1 & $3_1 | 0) {
         break label$124
        }
        HEAP32[(0 + 3164 | 0) >> 2] = $7_1 | $3_1 | 0;
        HEAP32[$6_1 >> 2] = $12_1;
        HEAP32[($12_1 + 24 | 0) >> 2] = $6_1;
        break label$123;
       }
       $0_1 = $4_1 << (($0_1 | 0) == (31 | 0) ? 0 : 25 - ($0_1 >>> 1 | 0) | 0) | 0;
       $3_1 = HEAP32[$6_1 >> 2] | 0;
       label$125 : while (1) {
        $6_1 = $3_1;
        if (((HEAP32[($6_1 + 4 | 0) >> 2] | 0) & -8 | 0 | 0) == ($4_1 | 0)) {
         break label$122
        }
        $3_1 = $0_1 >>> 29 | 0;
        $0_1 = $0_1 << 1 | 0;
        $5_1 = ($6_1 + ($3_1 & 4 | 0) | 0) + 16 | 0;
        $3_1 = HEAP32[$5_1 >> 2] | 0;
        if ($3_1) {
         continue label$125
        }
        break label$125;
       };
       HEAP32[$5_1 >> 2] = $12_1;
       HEAP32[($12_1 + 24 | 0) >> 2] = $6_1;
      }
      HEAP32[($12_1 + 12 | 0) >> 2] = $12_1;
      HEAP32[($12_1 + 8 | 0) >> 2] = $12_1;
      break label$116;
     }
     $0_1 = HEAP32[($6_1 + 8 | 0) >> 2] | 0;
     HEAP32[($0_1 + 12 | 0) >> 2] = $12_1;
     HEAP32[($6_1 + 8 | 0) >> 2] = $12_1;
     HEAP32[($12_1 + 24 | 0) >> 2] = 0;
     HEAP32[($12_1 + 12 | 0) >> 2] = $6_1;
     HEAP32[($12_1 + 8 | 0) >> 2] = $0_1;
    }
    $0_1 = $8_1 + 8 | 0;
    break label$1;
   }
   label$126 : {
    if (!$11_1) {
     break label$126
    }
    label$127 : {
     label$128 : {
      $6_1 = HEAP32[($5_1 + 28 | 0) >> 2] | 0;
      $0_1 = ($6_1 << 2 | 0) + 3464 | 0;
      if (($5_1 | 0) != (HEAP32[$0_1 >> 2] | 0 | 0)) {
       break label$128
      }
      HEAP32[$0_1 >> 2] = $8_1;
      if ($8_1) {
       break label$127
      }
      HEAP32[(0 + 3164 | 0) >> 2] = $9_1 & (__wasm_rotl_i32(-2 | 0, $6_1 | 0) | 0) | 0;
      break label$126;
     }
     HEAP32[($11_1 + ((HEAP32[($11_1 + 16 | 0) >> 2] | 0 | 0) == ($5_1 | 0) ? 16 : 20) | 0) >> 2] = $8_1;
     if (!$8_1) {
      break label$126
     }
    }
    HEAP32[($8_1 + 24 | 0) >> 2] = $11_1;
    label$129 : {
     $0_1 = HEAP32[($5_1 + 16 | 0) >> 2] | 0;
     if (!$0_1) {
      break label$129
     }
     HEAP32[($8_1 + 16 | 0) >> 2] = $0_1;
     HEAP32[($0_1 + 24 | 0) >> 2] = $8_1;
    }
    $0_1 = HEAP32[($5_1 + 20 | 0) >> 2] | 0;
    if (!$0_1) {
     break label$126
    }
    HEAP32[($8_1 + 20 | 0) >> 2] = $0_1;
    HEAP32[($0_1 + 24 | 0) >> 2] = $8_1;
   }
   label$130 : {
    label$131 : {
     if ($4_1 >>> 0 > 15 >>> 0) {
      break label$131
     }
     $0_1 = $4_1 + $3_1 | 0;
     HEAP32[($5_1 + 4 | 0) >> 2] = $0_1 | 3 | 0;
     $0_1 = $5_1 + $0_1 | 0;
     HEAP32[($0_1 + 4 | 0) >> 2] = HEAP32[($0_1 + 4 | 0) >> 2] | 0 | 1 | 0;
     break label$130;
    }
    HEAP32[($5_1 + 4 | 0) >> 2] = $3_1 | 3 | 0;
    HEAP32[($10_1 + 4 | 0) >> 2] = $4_1 | 1 | 0;
    HEAP32[($10_1 + $4_1 | 0) >> 2] = $4_1;
    label$132 : {
     if (!$7_1) {
      break label$132
     }
     $3_1 = $7_1 >>> 3 | 0;
     $6_1 = ($3_1 << 3 | 0) + 3200 | 0;
     $0_1 = HEAP32[(0 + 3180 | 0) >> 2] | 0;
     label$133 : {
      label$134 : {
       $3_1 = 1 << $3_1 | 0;
       if ($3_1 & $2_1 | 0) {
        break label$134
       }
       HEAP32[(0 + 3160 | 0) >> 2] = $3_1 | $2_1 | 0;
       $3_1 = $6_1;
       break label$133;
      }
      $3_1 = HEAP32[($6_1 + 8 | 0) >> 2] | 0;
     }
     HEAP32[($6_1 + 8 | 0) >> 2] = $0_1;
     HEAP32[($3_1 + 12 | 0) >> 2] = $0_1;
     HEAP32[($0_1 + 12 | 0) >> 2] = $6_1;
     HEAP32[($0_1 + 8 | 0) >> 2] = $3_1;
    }
    HEAP32[(0 + 3180 | 0) >> 2] = $10_1;
    HEAP32[(0 + 3168 | 0) >> 2] = $4_1;
   }
   $0_1 = $5_1 + 8 | 0;
  }
  global$0 = $1_1 + 16 | 0;
  return $0_1 | 0;
 }
 
 function $21($0_1) {
  $0_1 = $0_1 | 0;
  var $2_1 = 0, $5_1 = 0, $1_1 = 0, $4_1 = 0, $3_1 = 0, $7_1 = 0, $6_1 = 0, $399 = 0, $406 = 0, $413 = 0;
  label$1 : {
   if (!$0_1) {
    break label$1
   }
   $1_1 = $0_1 + -8 | 0;
   $2_1 = HEAP32[($0_1 + -4 | 0) >> 2] | 0;
   $0_1 = $2_1 & -8 | 0;
   $3_1 = $1_1 + $0_1 | 0;
   label$2 : {
    if ($2_1 & 1 | 0) {
     break label$2
    }
    if (!($2_1 & 3 | 0)) {
     break label$1
    }
    $2_1 = HEAP32[$1_1 >> 2] | 0;
    $1_1 = $1_1 - $2_1 | 0;
    $4_1 = HEAP32[(0 + 3176 | 0) >> 2] | 0;
    if ($1_1 >>> 0 < $4_1 >>> 0) {
     break label$1
    }
    $0_1 = $2_1 + $0_1 | 0;
    label$3 : {
     if ((HEAP32[(0 + 3180 | 0) >> 2] | 0 | 0) == ($1_1 | 0)) {
      break label$3
     }
     label$4 : {
      if ($2_1 >>> 0 > 255 >>> 0) {
       break label$4
      }
      $5_1 = HEAP32[($1_1 + 12 | 0) >> 2] | 0;
      label$5 : {
       $6_1 = HEAP32[($1_1 + 8 | 0) >> 2] | 0;
       $7_1 = $2_1 >>> 3 | 0;
       $2_1 = ($7_1 << 3 | 0) + 3200 | 0;
       if (($6_1 | 0) == ($2_1 | 0)) {
        break label$5
       }
      }
      label$6 : {
       if (($5_1 | 0) != ($6_1 | 0)) {
        break label$6
       }
       HEAP32[(0 + 3160 | 0) >> 2] = (HEAP32[(0 + 3160 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $7_1 | 0) | 0) | 0;
       break label$2;
      }
      label$7 : {
       if (($5_1 | 0) == ($2_1 | 0)) {
        break label$7
       }
      }
      HEAP32[($6_1 + 12 | 0) >> 2] = $5_1;
      HEAP32[($5_1 + 8 | 0) >> 2] = $6_1;
      break label$2;
     }
     $7_1 = HEAP32[($1_1 + 24 | 0) >> 2] | 0;
     label$8 : {
      label$9 : {
       $5_1 = HEAP32[($1_1 + 12 | 0) >> 2] | 0;
       if (($5_1 | 0) == ($1_1 | 0)) {
        break label$9
       }
       label$10 : {
        $2_1 = HEAP32[($1_1 + 8 | 0) >> 2] | 0;
        if ($4_1 >>> 0 > $2_1 >>> 0) {
         break label$10
        }
        HEAP32[($2_1 + 12 | 0) >> 2] | 0;
       }
       HEAP32[($2_1 + 12 | 0) >> 2] = $5_1;
       HEAP32[($5_1 + 8 | 0) >> 2] = $2_1;
       break label$8;
      }
      label$11 : {
       $2_1 = $1_1 + 20 | 0;
       $4_1 = HEAP32[$2_1 >> 2] | 0;
       if ($4_1) {
        break label$11
       }
       $2_1 = $1_1 + 16 | 0;
       $4_1 = HEAP32[$2_1 >> 2] | 0;
       if ($4_1) {
        break label$11
       }
       $5_1 = 0;
       break label$8;
      }
      label$12 : while (1) {
       $6_1 = $2_1;
       $5_1 = $4_1;
       $2_1 = $5_1 + 20 | 0;
       $4_1 = HEAP32[$2_1 >> 2] | 0;
       if ($4_1) {
        continue label$12
       }
       $2_1 = $5_1 + 16 | 0;
       $4_1 = HEAP32[($5_1 + 16 | 0) >> 2] | 0;
       if ($4_1) {
        continue label$12
       }
       break label$12;
      };
      HEAP32[$6_1 >> 2] = 0;
     }
     if (!$7_1) {
      break label$2
     }
     label$13 : {
      label$14 : {
       $4_1 = HEAP32[($1_1 + 28 | 0) >> 2] | 0;
       $2_1 = ($4_1 << 2 | 0) + 3464 | 0;
       if ((HEAP32[$2_1 >> 2] | 0 | 0) != ($1_1 | 0)) {
        break label$14
       }
       HEAP32[$2_1 >> 2] = $5_1;
       if ($5_1) {
        break label$13
       }
       HEAP32[(0 + 3164 | 0) >> 2] = (HEAP32[(0 + 3164 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $4_1 | 0) | 0) | 0;
       break label$2;
      }
      HEAP32[($7_1 + ((HEAP32[($7_1 + 16 | 0) >> 2] | 0 | 0) == ($1_1 | 0) ? 16 : 20) | 0) >> 2] = $5_1;
      if (!$5_1) {
       break label$2
      }
     }
     HEAP32[($5_1 + 24 | 0) >> 2] = $7_1;
     label$15 : {
      $2_1 = HEAP32[($1_1 + 16 | 0) >> 2] | 0;
      if (!$2_1) {
       break label$15
      }
      HEAP32[($5_1 + 16 | 0) >> 2] = $2_1;
      HEAP32[($2_1 + 24 | 0) >> 2] = $5_1;
     }
     $2_1 = HEAP32[($1_1 + 20 | 0) >> 2] | 0;
     if (!$2_1) {
      break label$2
     }
     HEAP32[($5_1 + 20 | 0) >> 2] = $2_1;
     HEAP32[($2_1 + 24 | 0) >> 2] = $5_1;
     break label$2;
    }
    $2_1 = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
    if (($2_1 & 3 | 0 | 0) != (3 | 0)) {
     break label$2
    }
    HEAP32[(0 + 3168 | 0) >> 2] = $0_1;
    HEAP32[($3_1 + 4 | 0) >> 2] = $2_1 & -2 | 0;
    HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
    HEAP32[($1_1 + $0_1 | 0) >> 2] = $0_1;
    return;
   }
   if ($3_1 >>> 0 <= $1_1 >>> 0) {
    break label$1
   }
   $2_1 = HEAP32[($3_1 + 4 | 0) >> 2] | 0;
   if (!($2_1 & 1 | 0)) {
    break label$1
   }
   label$16 : {
    label$17 : {
     if ($2_1 & 2 | 0) {
      break label$17
     }
     label$18 : {
      if ((HEAP32[(0 + 3184 | 0) >> 2] | 0 | 0) != ($3_1 | 0)) {
       break label$18
      }
      HEAP32[(0 + 3184 | 0) >> 2] = $1_1;
      $0_1 = (HEAP32[(0 + 3172 | 0) >> 2] | 0) + $0_1 | 0;
      HEAP32[(0 + 3172 | 0) >> 2] = $0_1;
      HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
      if (($1_1 | 0) != (HEAP32[(0 + 3180 | 0) >> 2] | 0 | 0)) {
       break label$1
      }
      HEAP32[(0 + 3168 | 0) >> 2] = 0;
      HEAP32[(0 + 3180 | 0) >> 2] = 0;
      return;
     }
     label$19 : {
      if ((HEAP32[(0 + 3180 | 0) >> 2] | 0 | 0) != ($3_1 | 0)) {
       break label$19
      }
      HEAP32[(0 + 3180 | 0) >> 2] = $1_1;
      $0_1 = (HEAP32[(0 + 3168 | 0) >> 2] | 0) + $0_1 | 0;
      HEAP32[(0 + 3168 | 0) >> 2] = $0_1;
      HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
      HEAP32[($1_1 + $0_1 | 0) >> 2] = $0_1;
      return;
     }
     $0_1 = ($2_1 & -8 | 0) + $0_1 | 0;
     label$20 : {
      label$21 : {
       if ($2_1 >>> 0 > 255 >>> 0) {
        break label$21
       }
       $4_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
       label$22 : {
        $5_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
        $3_1 = $2_1 >>> 3 | 0;
        $2_1 = ($3_1 << 3 | 0) + 3200 | 0;
        if (($5_1 | 0) == ($2_1 | 0)) {
         break label$22
        }
        HEAP32[(0 + 3176 | 0) >> 2] | 0;
       }
       label$23 : {
        if (($4_1 | 0) != ($5_1 | 0)) {
         break label$23
        }
        HEAP32[(0 + 3160 | 0) >> 2] = (HEAP32[(0 + 3160 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $3_1 | 0) | 0) | 0;
        break label$20;
       }
       label$24 : {
        if (($4_1 | 0) == ($2_1 | 0)) {
         break label$24
        }
        HEAP32[(0 + 3176 | 0) >> 2] | 0;
       }
       HEAP32[($5_1 + 12 | 0) >> 2] = $4_1;
       HEAP32[($4_1 + 8 | 0) >> 2] = $5_1;
       break label$20;
      }
      $7_1 = HEAP32[($3_1 + 24 | 0) >> 2] | 0;
      label$25 : {
       label$26 : {
        $5_1 = HEAP32[($3_1 + 12 | 0) >> 2] | 0;
        if (($5_1 | 0) == ($3_1 | 0)) {
         break label$26
        }
        label$27 : {
         $2_1 = HEAP32[($3_1 + 8 | 0) >> 2] | 0;
         if ((HEAP32[(0 + 3176 | 0) >> 2] | 0) >>> 0 > $2_1 >>> 0) {
          break label$27
         }
         HEAP32[($2_1 + 12 | 0) >> 2] | 0;
        }
        HEAP32[($2_1 + 12 | 0) >> 2] = $5_1;
        HEAP32[($5_1 + 8 | 0) >> 2] = $2_1;
        break label$25;
       }
       label$28 : {
        $2_1 = $3_1 + 20 | 0;
        $4_1 = HEAP32[$2_1 >> 2] | 0;
        if ($4_1) {
         break label$28
        }
        $2_1 = $3_1 + 16 | 0;
        $4_1 = HEAP32[$2_1 >> 2] | 0;
        if ($4_1) {
         break label$28
        }
        $5_1 = 0;
        break label$25;
       }
       label$29 : while (1) {
        $6_1 = $2_1;
        $5_1 = $4_1;
        $2_1 = $5_1 + 20 | 0;
        $4_1 = HEAP32[$2_1 >> 2] | 0;
        if ($4_1) {
         continue label$29
        }
        $2_1 = $5_1 + 16 | 0;
        $4_1 = HEAP32[($5_1 + 16 | 0) >> 2] | 0;
        if ($4_1) {
         continue label$29
        }
        break label$29;
       };
       HEAP32[$6_1 >> 2] = 0;
      }
      if (!$7_1) {
       break label$20
      }
      label$30 : {
       label$31 : {
        $4_1 = HEAP32[($3_1 + 28 | 0) >> 2] | 0;
        $2_1 = ($4_1 << 2 | 0) + 3464 | 0;
        if ((HEAP32[$2_1 >> 2] | 0 | 0) != ($3_1 | 0)) {
         break label$31
        }
        HEAP32[$2_1 >> 2] = $5_1;
        if ($5_1) {
         break label$30
        }
        HEAP32[(0 + 3164 | 0) >> 2] = (HEAP32[(0 + 3164 | 0) >> 2] | 0) & (__wasm_rotl_i32(-2 | 0, $4_1 | 0) | 0) | 0;
        break label$20;
       }
       HEAP32[($7_1 + ((HEAP32[($7_1 + 16 | 0) >> 2] | 0 | 0) == ($3_1 | 0) ? 16 : 20) | 0) >> 2] = $5_1;
       if (!$5_1) {
        break label$20
       }
      }
      HEAP32[($5_1 + 24 | 0) >> 2] = $7_1;
      label$32 : {
       $2_1 = HEAP32[($3_1 + 16 | 0) >> 2] | 0;
       if (!$2_1) {
        break label$32
       }
       HEAP32[($5_1 + 16 | 0) >> 2] = $2_1;
       HEAP32[($2_1 + 24 | 0) >> 2] = $5_1;
      }
      $2_1 = HEAP32[($3_1 + 20 | 0) >> 2] | 0;
      if (!$2_1) {
       break label$20
      }
      HEAP32[($5_1 + 20 | 0) >> 2] = $2_1;
      HEAP32[($2_1 + 24 | 0) >> 2] = $5_1;
     }
     HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
     HEAP32[($1_1 + $0_1 | 0) >> 2] = $0_1;
     if (($1_1 | 0) != (HEAP32[(0 + 3180 | 0) >> 2] | 0 | 0)) {
      break label$16
     }
     HEAP32[(0 + 3168 | 0) >> 2] = $0_1;
     return;
    }
    HEAP32[($3_1 + 4 | 0) >> 2] = $2_1 & -2 | 0;
    HEAP32[($1_1 + 4 | 0) >> 2] = $0_1 | 1 | 0;
    HEAP32[($1_1 + $0_1 | 0) >> 2] = $0_1;
   }
   label$33 : {
    if ($0_1 >>> 0 > 255 >>> 0) {
     break label$33
    }
    $2_1 = $0_1 >>> 3 | 0;
    $0_1 = ($2_1 << 3 | 0) + 3200 | 0;
    label$34 : {
     label$35 : {
      $4_1 = HEAP32[(0 + 3160 | 0) >> 2] | 0;
      $2_1 = 1 << $2_1 | 0;
      if ($4_1 & $2_1 | 0) {
       break label$35
      }
      HEAP32[(0 + 3160 | 0) >> 2] = $4_1 | $2_1 | 0;
      $2_1 = $0_1;
      break label$34;
     }
     $2_1 = HEAP32[($0_1 + 8 | 0) >> 2] | 0;
    }
    HEAP32[($0_1 + 8 | 0) >> 2] = $1_1;
    HEAP32[($2_1 + 12 | 0) >> 2] = $1_1;
    HEAP32[($1_1 + 12 | 0) >> 2] = $0_1;
    HEAP32[($1_1 + 8 | 0) >> 2] = $2_1;
    return;
   }
   $2_1 = 31;
   label$36 : {
    if ($0_1 >>> 0 > 16777215 >>> 0) {
     break label$36
    }
    $2_1 = $0_1 >>> 8 | 0;
    $399 = $2_1;
    $2_1 = (($2_1 + 1048320 | 0) >>> 16 | 0) & 8 | 0;
    $4_1 = $399 << $2_1 | 0;
    $406 = $4_1;
    $4_1 = (($4_1 + 520192 | 0) >>> 16 | 0) & 4 | 0;
    $5_1 = $406 << $4_1 | 0;
    $413 = $5_1;
    $5_1 = (($5_1 + 245760 | 0) >>> 16 | 0) & 2 | 0;
    $2_1 = (($413 << $5_1 | 0) >>> 15 | 0) - ($2_1 | $4_1 | 0 | $5_1 | 0) | 0;
    $2_1 = ($2_1 << 1 | 0 | (($0_1 >>> ($2_1 + 21 | 0) | 0) & 1 | 0) | 0) + 28 | 0;
   }
   HEAP32[($1_1 + 16 | 0) >> 2] = 0;
   HEAP32[($1_1 + 20 | 0) >> 2] = 0;
   HEAP32[($1_1 + 28 | 0) >> 2] = $2_1;
   $4_1 = ($2_1 << 2 | 0) + 3464 | 0;
   label$37 : {
    label$38 : {
     label$39 : {
      label$40 : {
       $5_1 = HEAP32[(0 + 3164 | 0) >> 2] | 0;
       $3_1 = 1 << $2_1 | 0;
       if ($5_1 & $3_1 | 0) {
        break label$40
       }
       HEAP32[(0 + 3164 | 0) >> 2] = $5_1 | $3_1 | 0;
       HEAP32[$4_1 >> 2] = $1_1;
       HEAP32[($1_1 + 24 | 0) >> 2] = $4_1;
       break label$39;
      }
      $2_1 = $0_1 << (($2_1 | 0) == (31 | 0) ? 0 : 25 - ($2_1 >>> 1 | 0) | 0) | 0;
      $5_1 = HEAP32[$4_1 >> 2] | 0;
      label$41 : while (1) {
       $4_1 = $5_1;
       if (((HEAP32[($5_1 + 4 | 0) >> 2] | 0) & -8 | 0 | 0) == ($0_1 | 0)) {
        break label$38
       }
       $5_1 = $2_1 >>> 29 | 0;
       $2_1 = $2_1 << 1 | 0;
       $3_1 = ($4_1 + ($5_1 & 4 | 0) | 0) + 16 | 0;
       $5_1 = HEAP32[$3_1 >> 2] | 0;
       if ($5_1) {
        continue label$41
       }
       break label$41;
      };
      HEAP32[$3_1 >> 2] = $1_1;
      HEAP32[($1_1 + 24 | 0) >> 2] = $4_1;
     }
     HEAP32[($1_1 + 12 | 0) >> 2] = $1_1;
     HEAP32[($1_1 + 8 | 0) >> 2] = $1_1;
     break label$37;
    }
    $0_1 = HEAP32[($4_1 + 8 | 0) >> 2] | 0;
    HEAP32[($0_1 + 12 | 0) >> 2] = $1_1;
    HEAP32[($4_1 + 8 | 0) >> 2] = $1_1;
    HEAP32[($1_1 + 24 | 0) >> 2] = 0;
    HEAP32[($1_1 + 12 | 0) >> 2] = $4_1;
    HEAP32[($1_1 + 8 | 0) >> 2] = $0_1;
   }
   $1_1 = (HEAP32[(0 + 3192 | 0) >> 2] | 0) + -1 | 0;
   HEAP32[(0 + 3192 | 0) >> 2] = $1_1;
   if ($1_1) {
    break label$1
   }
   $1_1 = 3616;
   label$42 : while (1) {
    $0_1 = HEAP32[$1_1 >> 2] | 0;
    $1_1 = $0_1 + 8 | 0;
    if ($0_1) {
     continue label$42
    }
    break label$42;
   };
   HEAP32[(0 + 3192 | 0) >> 2] = -1;
  }
 }
 
 function $22($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0, $2_1 = 0;
  $1_1 = HEAP32[(0 + 3152 | 0) >> 2] | 0;
  $2_1 = ($0_1 + 3 | 0) & -4 | 0;
  $0_1 = $1_1 + $2_1 | 0;
  label$1 : {
   label$2 : {
    if (($2_1 | 0) < (1 | 0)) {
     break label$2
    }
    if ($0_1 >>> 0 <= $1_1 >>> 0) {
     break label$1
    }
   }
   label$3 : {
    if ($0_1 >>> 0 <= (__wasm_memory_size() << 16 | 0) >>> 0) {
     break label$3
    }
    if (!(fimport$1($0_1 | 0) | 0)) {
     break label$1
    }
   }
   HEAP32[(0 + 3152 | 0) >> 2] = $0_1;
   return $1_1 | 0;
  }
  HEAP32[($19() | 0) >> 2] = 48;
  return -1 | 0;
 }
 
 function $23($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $4_1 = 0, $3_1 = 0, $5_1 = 0;
  label$1 : {
   if ($2_1 >>> 0 < 512 >>> 0) {
    break label$1
   }
   fimport$2($0_1 | 0, $1_1 | 0, $2_1 | 0) | 0;
   return $0_1 | 0;
  }
  $3_1 = $0_1 + $2_1 | 0;
  label$2 : {
   label$3 : {
    if (($1_1 ^ $0_1 | 0) & 3 | 0) {
     break label$3
    }
    label$4 : {
     label$5 : {
      if (($2_1 | 0) >= (1 | 0)) {
       break label$5
      }
      $2_1 = $0_1;
      break label$4;
     }
     label$6 : {
      if ($0_1 & 3 | 0) {
       break label$6
      }
      $2_1 = $0_1;
      break label$4;
     }
     $2_1 = $0_1;
     label$7 : while (1) {
      HEAP8[$2_1 >> 0] = HEAPU8[$1_1 >> 0] | 0;
      $1_1 = $1_1 + 1 | 0;
      $2_1 = $2_1 + 1 | 0;
      if ($2_1 >>> 0 >= $3_1 >>> 0) {
       break label$4
      }
      if ($2_1 & 3 | 0) {
       continue label$7
      }
      break label$7;
     };
    }
    label$8 : {
     $4_1 = $3_1 & -4 | 0;
     if ($4_1 >>> 0 < 64 >>> 0) {
      break label$8
     }
     $5_1 = $4_1 + -64 | 0;
     if ($2_1 >>> 0 > $5_1 >>> 0) {
      break label$8
     }
     label$9 : while (1) {
      HEAP32[$2_1 >> 2] = HEAP32[$1_1 >> 2] | 0;
      HEAP32[($2_1 + 4 | 0) >> 2] = HEAP32[($1_1 + 4 | 0) >> 2] | 0;
      HEAP32[($2_1 + 8 | 0) >> 2] = HEAP32[($1_1 + 8 | 0) >> 2] | 0;
      HEAP32[($2_1 + 12 | 0) >> 2] = HEAP32[($1_1 + 12 | 0) >> 2] | 0;
      HEAP32[($2_1 + 16 | 0) >> 2] = HEAP32[($1_1 + 16 | 0) >> 2] | 0;
      HEAP32[($2_1 + 20 | 0) >> 2] = HEAP32[($1_1 + 20 | 0) >> 2] | 0;
      HEAP32[($2_1 + 24 | 0) >> 2] = HEAP32[($1_1 + 24 | 0) >> 2] | 0;
      HEAP32[($2_1 + 28 | 0) >> 2] = HEAP32[($1_1 + 28 | 0) >> 2] | 0;
      HEAP32[($2_1 + 32 | 0) >> 2] = HEAP32[($1_1 + 32 | 0) >> 2] | 0;
      HEAP32[($2_1 + 36 | 0) >> 2] = HEAP32[($1_1 + 36 | 0) >> 2] | 0;
      HEAP32[($2_1 + 40 | 0) >> 2] = HEAP32[($1_1 + 40 | 0) >> 2] | 0;
      HEAP32[($2_1 + 44 | 0) >> 2] = HEAP32[($1_1 + 44 | 0) >> 2] | 0;
      HEAP32[($2_1 + 48 | 0) >> 2] = HEAP32[($1_1 + 48 | 0) >> 2] | 0;
      HEAP32[($2_1 + 52 | 0) >> 2] = HEAP32[($1_1 + 52 | 0) >> 2] | 0;
      HEAP32[($2_1 + 56 | 0) >> 2] = HEAP32[($1_1 + 56 | 0) >> 2] | 0;
      HEAP32[($2_1 + 60 | 0) >> 2] = HEAP32[($1_1 + 60 | 0) >> 2] | 0;
      $1_1 = $1_1 + 64 | 0;
      $2_1 = $2_1 + 64 | 0;
      if ($2_1 >>> 0 <= $5_1 >>> 0) {
       continue label$9
      }
      break label$9;
     };
    }
    if ($2_1 >>> 0 >= $4_1 >>> 0) {
     break label$2
    }
    label$10 : while (1) {
     HEAP32[$2_1 >> 2] = HEAP32[$1_1 >> 2] | 0;
     $1_1 = $1_1 + 4 | 0;
     $2_1 = $2_1 + 4 | 0;
     if ($2_1 >>> 0 < $4_1 >>> 0) {
      continue label$10
     }
     break label$2;
    };
   }
   label$11 : {
    if ($3_1 >>> 0 >= 4 >>> 0) {
     break label$11
    }
    $2_1 = $0_1;
    break label$2;
   }
   label$12 : {
    $4_1 = $3_1 + -4 | 0;
    if ($4_1 >>> 0 >= $0_1 >>> 0) {
     break label$12
    }
    $2_1 = $0_1;
    break label$2;
   }
   $2_1 = $0_1;
   label$13 : while (1) {
    HEAP8[$2_1 >> 0] = HEAPU8[$1_1 >> 0] | 0;
    HEAP8[($2_1 + 1 | 0) >> 0] = HEAPU8[($1_1 + 1 | 0) >> 0] | 0;
    HEAP8[($2_1 + 2 | 0) >> 0] = HEAPU8[($1_1 + 2 | 0) >> 0] | 0;
    HEAP8[($2_1 + 3 | 0) >> 0] = HEAPU8[($1_1 + 3 | 0) >> 0] | 0;
    $1_1 = $1_1 + 4 | 0;
    $2_1 = $2_1 + 4 | 0;
    if ($2_1 >>> 0 <= $4_1 >>> 0) {
     continue label$13
    }
    break label$13;
   };
  }
  label$14 : {
   if ($2_1 >>> 0 >= $3_1 >>> 0) {
    break label$14
   }
   label$15 : while (1) {
    HEAP8[$2_1 >> 0] = HEAPU8[$1_1 >> 0] | 0;
    $1_1 = $1_1 + 1 | 0;
    $2_1 = $2_1 + 1 | 0;
    if (($2_1 | 0) != ($3_1 | 0)) {
     continue label$15
    }
    break label$15;
   };
  }
  return $0_1 | 0;
 }
 
 function $24($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0, i64toi32_i32$2 = 0, i64toi32_i32$0 = 0, $4_1 = 0, $6_1 = 0, i64toi32_i32$1 = 0, i64toi32_i32$4 = 0, $6$hi = 0, i64toi32_i32$3 = 0, $5_1 = 0, $14_1 = 0, $104$hi = 0;
  label$1 : {
   if (!$2_1) {
    break label$1
   }
   $3_1 = $2_1 + $0_1 | 0;
   HEAP8[($3_1 + -1 | 0) >> 0] = $1_1;
   HEAP8[$0_1 >> 0] = $1_1;
   if ($2_1 >>> 0 < 3 >>> 0) {
    break label$1
   }
   HEAP8[($3_1 + -2 | 0) >> 0] = $1_1;
   HEAP8[($0_1 + 1 | 0) >> 0] = $1_1;
   HEAP8[($3_1 + -3 | 0) >> 0] = $1_1;
   HEAP8[($0_1 + 2 | 0) >> 0] = $1_1;
   if ($2_1 >>> 0 < 7 >>> 0) {
    break label$1
   }
   HEAP8[($3_1 + -4 | 0) >> 0] = $1_1;
   HEAP8[($0_1 + 3 | 0) >> 0] = $1_1;
   if ($2_1 >>> 0 < 9 >>> 0) {
    break label$1
   }
   $4_1 = (0 - $0_1 | 0) & 3 | 0;
   $3_1 = $0_1 + $4_1 | 0;
   $1_1 = Math_imul($1_1 & 255 | 0, 16843009);
   HEAP32[$3_1 >> 2] = $1_1;
   $4_1 = ($2_1 - $4_1 | 0) & -4 | 0;
   $2_1 = $3_1 + $4_1 | 0;
   HEAP32[($2_1 + -4 | 0) >> 2] = $1_1;
   if ($4_1 >>> 0 < 9 >>> 0) {
    break label$1
   }
   HEAP32[($3_1 + 8 | 0) >> 2] = $1_1;
   HEAP32[($3_1 + 4 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -8 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -12 | 0) >> 2] = $1_1;
   if ($4_1 >>> 0 < 25 >>> 0) {
    break label$1
   }
   HEAP32[($3_1 + 24 | 0) >> 2] = $1_1;
   HEAP32[($3_1 + 20 | 0) >> 2] = $1_1;
   HEAP32[($3_1 + 16 | 0) >> 2] = $1_1;
   HEAP32[($3_1 + 12 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -16 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -20 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -24 | 0) >> 2] = $1_1;
   HEAP32[($2_1 + -28 | 0) >> 2] = $1_1;
   $5_1 = $3_1 & 4 | 0 | 24 | 0;
   $2_1 = $4_1 - $5_1 | 0;
   if ($2_1 >>> 0 < 32 >>> 0) {
    break label$1
   }
   i64toi32_i32$0 = 0;
   $6_1 = $1_1;
   $6$hi = i64toi32_i32$0;
   i64toi32_i32$2 = $1_1;
   i64toi32_i32$1 = 0;
   i64toi32_i32$3 = 32;
   i64toi32_i32$4 = i64toi32_i32$3 & 31 | 0;
   if (32 >>> 0 <= (i64toi32_i32$3 & 63 | 0) >>> 0) {
    i64toi32_i32$1 = i64toi32_i32$2 << i64toi32_i32$4 | 0;
    $14_1 = 0;
   } else {
    i64toi32_i32$1 = ((1 << i64toi32_i32$4 | 0) - 1 | 0) & (i64toi32_i32$2 >>> (32 - i64toi32_i32$4 | 0) | 0) | 0 | (i64toi32_i32$0 << i64toi32_i32$4 | 0) | 0;
    $14_1 = i64toi32_i32$2 << i64toi32_i32$4 | 0;
   }
   $104$hi = i64toi32_i32$1;
   i64toi32_i32$1 = $6$hi;
   i64toi32_i32$1 = $104$hi;
   i64toi32_i32$0 = $14_1;
   i64toi32_i32$2 = $6$hi;
   i64toi32_i32$3 = $6_1;
   i64toi32_i32$2 = i64toi32_i32$1 | i64toi32_i32$2 | 0;
   $6_1 = i64toi32_i32$0 | $6_1 | 0;
   $6$hi = i64toi32_i32$2;
   $1_1 = $3_1 + $5_1 | 0;
   label$2 : while (1) {
    i64toi32_i32$2 = $6$hi;
    i64toi32_i32$0 = $1_1;
    HEAP32[($1_1 + 24 | 0) >> 2] = $6_1;
    HEAP32[($1_1 + 28 | 0) >> 2] = i64toi32_i32$2;
    i64toi32_i32$0 = $1_1;
    HEAP32[($1_1 + 16 | 0) >> 2] = $6_1;
    HEAP32[($1_1 + 20 | 0) >> 2] = i64toi32_i32$2;
    i64toi32_i32$0 = $1_1;
    HEAP32[($1_1 + 8 | 0) >> 2] = $6_1;
    HEAP32[($1_1 + 12 | 0) >> 2] = i64toi32_i32$2;
    i64toi32_i32$0 = $1_1;
    HEAP32[$1_1 >> 2] = $6_1;
    HEAP32[($1_1 + 4 | 0) >> 2] = i64toi32_i32$2;
    $1_1 = $1_1 + 32 | 0;
    $2_1 = $2_1 + -32 | 0;
    if ($2_1 >>> 0 > 31 >>> 0) {
     continue label$2
    }
    break label$2;
   };
  }
  return $0_1 | 0;
 }
 
 function $25($0_1, $1_1, $2_1) {
  $0_1 = $0_1 | 0;
  $1_1 = $1_1 | 0;
  $2_1 = $2_1 | 0;
  var $3_1 = 0;
  label$1 : {
   if (($0_1 | 0) == ($1_1 | 0)) {
    break label$1
   }
   label$2 : {
    if ((($1_1 - $0_1 | 0) - $2_1 | 0) >>> 0 > (0 - ($2_1 << 1 | 0) | 0) >>> 0) {
     break label$2
    }
    return $23($0_1 | 0, $1_1 | 0, $2_1 | 0) | 0 | 0;
   }
   $3_1 = ($1_1 ^ $0_1 | 0) & 3 | 0;
   label$3 : {
    label$4 : {
     label$5 : {
      if ($0_1 >>> 0 >= $1_1 >>> 0) {
       break label$5
      }
      label$6 : {
       if (!$3_1) {
        break label$6
       }
       $3_1 = $0_1;
       break label$3;
      }
      label$7 : {
       if ($0_1 & 3 | 0) {
        break label$7
       }
       $3_1 = $0_1;
       break label$4;
      }
      $3_1 = $0_1;
      label$8 : while (1) {
       if (!$2_1) {
        break label$1
       }
       HEAP8[$3_1 >> 0] = HEAPU8[$1_1 >> 0] | 0;
       $1_1 = $1_1 + 1 | 0;
       $2_1 = $2_1 + -1 | 0;
       $3_1 = $3_1 + 1 | 0;
       if (!($3_1 & 3 | 0)) {
        break label$4
       }
       continue label$8;
      };
     }
     label$9 : {
      if ($3_1) {
       break label$9
      }
      label$10 : {
       if (!(($0_1 + $2_1 | 0) & 3 | 0)) {
        break label$10
       }
       label$11 : while (1) {
        if (!$2_1) {
         break label$1
        }
        $2_1 = $2_1 + -1 | 0;
        $3_1 = $0_1 + $2_1 | 0;
        HEAP8[$3_1 >> 0] = HEAPU8[($1_1 + $2_1 | 0) >> 0] | 0;
        if ($3_1 & 3 | 0) {
         continue label$11
        }
        break label$11;
       };
      }
      if ($2_1 >>> 0 <= 3 >>> 0) {
       break label$9
      }
      label$12 : while (1) {
       $2_1 = $2_1 + -4 | 0;
       HEAP32[($0_1 + $2_1 | 0) >> 2] = HEAP32[($1_1 + $2_1 | 0) >> 2] | 0;
       if ($2_1 >>> 0 > 3 >>> 0) {
        continue label$12
       }
       break label$12;
      };
     }
     if (!$2_1) {
      break label$1
     }
     label$13 : while (1) {
      $2_1 = $2_1 + -1 | 0;
      HEAP8[($0_1 + $2_1 | 0) >> 0] = HEAPU8[($1_1 + $2_1 | 0) >> 0] | 0;
      if ($2_1) {
       continue label$13
      }
      break label$1;
     };
    }
    if ($2_1 >>> 0 <= 3 >>> 0) {
     break label$3
    }
    label$14 : while (1) {
     HEAP32[$3_1 >> 2] = HEAP32[$1_1 >> 2] | 0;
     $1_1 = $1_1 + 4 | 0;
     $3_1 = $3_1 + 4 | 0;
     $2_1 = $2_1 + -4 | 0;
     if ($2_1 >>> 0 > 3 >>> 0) {
      continue label$14
     }
     break label$14;
    };
   }
   if (!$2_1) {
    break label$1
   }
   label$15 : while (1) {
    HEAP8[$3_1 >> 0] = HEAPU8[$1_1 >> 0] | 0;
    $3_1 = $3_1 + 1 | 0;
    $1_1 = $1_1 + 1 | 0;
    $2_1 = $2_1 + -1 | 0;
    if ($2_1) {
     continue label$15
    }
    break label$15;
   };
  }
  return $0_1 | 0;
 }
 
 function $26() {
  global$2 = 5246544;
  global$1 = (3656 + 15 | 0) & -16 | 0;
 }
 
 function $27() {
  return global$0 - global$1 | 0 | 0;
 }
 
 function $28() {
  return global$1 | 0;
 }
 
 function $29() {
  return global$0 | 0;
 }
 
 function $30($0_1) {
  $0_1 = $0_1 | 0;
  global$0 = $0_1;
 }
 
 function $31($0_1) {
  $0_1 = $0_1 | 0;
  var $1_1 = 0;
  $1_1 = (global$0 - $0_1 | 0) & -16 | 0;
  global$0 = $1_1;
  return $1_1 | 0;
 }
 
 function __wasm_rotl_i32(var$0, var$1) {
  var$0 = var$0 | 0;
  var$1 = var$1 | 0;
  var var$2 = 0;
  var$2 = var$1 & 31 | 0;
  var$1 = (0 - var$1 | 0) & 31 | 0;
  return ((-1 >>> var$2 | 0) & var$0 | 0) << var$2 | 0 | (((-1 << var$1 | 0) & var$0 | 0) >>> var$1 | 0) | 0 | 0;
 }
 
 // EMSCRIPTEN_END_FUNCS
;
 bufferView = HEAPU8;
 initActiveSegments(env);
 var FUNCTION_TABLE = Table([null, $2, $3]);
 function __wasm_memory_size() {
  return buffer.byteLength / 65536 | 0;
 }
 
 return {
  "__indirect_function_table": FUNCTION_TABLE, 
  "__wasm_call_ctors": $0, 
  "Compress_PKLIB": $1, 
  "malloc": $20, 
  "implode": $5, 
  "free": $21, 
  "Decompress_PKLIB": $4, 
  "crc32": $18, 
  "__errno_location": $19, 
  "stackSave": $29, 
  "stackRestore": $30, 
  "stackAlloc": $31, 
  "emscripten_stack_init": $26, 
  "emscripten_stack_get_free": $27, 
  "emscripten_stack_get_end": $28
 };
}

  return asmFunc(asmLibraryArg);
}

)(asmLibraryArg);
  },

  instantiate: /** @suppress{checkTypes} */ function(binary, info) {
    return {
      then: function(ok) {
        var module = new WebAssembly.Module(binary);
        ok({
          'instance': new WebAssembly.Instance(module)
        });
        // Emulate a simple WebAssembly.instantiate(..).then(()=>{}).catch(()=>{}) syntax.
        return { catch: function() {} };
      }
    };
  },

  RuntimeError: Error
};

// We don't need to actually download a wasm binary, mark it as present but empty.
wasmBinary = [];

// end include: wasm2js.js
if (typeof WebAssembly !== 'object') {
  abort('no native wasm support detected');
}

// include: runtime_safe_heap.js


// In MINIMAL_RUNTIME, setValue() and getValue() are only available when building with safe heap enabled, for heap safety checking.
// In traditional runtime, setValue() and getValue() are always available (although their use is highly discouraged due to perf penalties)

/** @param {number} ptr
    @param {number} value
    @param {string} type
    @param {number|boolean=} noSafe */
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[((ptr)>>0)]=value; break;
      case 'i8': HEAP8[((ptr)>>0)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}

/** @param {number} ptr
    @param {string} type
    @param {number|boolean=} noSafe */
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for getValue: ' + type);
    }
  return null;
}

// end include: runtime_safe_heap.js
// Wasm globals

var wasmMemory;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported');
  return func;
}

// C calling interface.
/** @param {string|null=} returnType
    @param {Array=} argTypes
    @param {Arguments|Array=} args
    @param {Object=} opts */
function ccall(ident, returnType, argTypes, args, opts) {
  // For fast lookup of conversion functions
  var toC = {
    'string': function(str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) { // null string
        // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
        var len = (str.length << 2) + 1;
        ret = stackAlloc(len);
        stringToUTF8(str, ret, len);
      }
      return ret;
    },
    'array': function(arr) {
      var ret = stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    }
  };

  function convertReturnValue(ret) {
    if (returnType === 'string') return UTF8ToString(ret);
    if (returnType === 'boolean') return Boolean(ret);
    return ret;
  }

  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  assert(returnType !== 'array', 'Return type should not be "array".');
  if (args) {
    for (var i = 0; i < args.length; i++) {
      var converter = toC[argTypes[i]];
      if (converter) {
        if (stack === 0) stack = stackSave();
        cArgs[i] = converter(args[i]);
      } else {
        cArgs[i] = args[i];
      }
    }
  }
  var ret = func.apply(null, cArgs);

  ret = convertReturnValue(ret);
  if (stack !== 0) stackRestore(stack);
  return ret;
}

/** @param {string=} returnType
    @param {Array=} argTypes
    @param {Object=} opts */
function cwrap(ident, returnType, argTypes, opts) {
  return function() {
    return ccall(ident, returnType, argTypes, arguments, opts);
  }
}

// We used to include malloc/free by default in the past. Show a helpful error in
// builds with assertions.

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data.
// @allocator: How to allocate memory, see ALLOC_*
/** @type {function((Uint8Array|Array<number>), number)} */
function allocate(slab, allocator) {
  var ret;
  assert(typeof allocator === 'number', 'allocate no longer takes a type argument')
  assert(typeof slab !== 'number', 'allocate no longer takes a number as arg0')

  if (allocator == ALLOC_STACK) {
    ret = stackAlloc(slab.length);
  } else {
    ret = _malloc(slab.length);
  }

  if (slab.subarray || slab.slice) {
    HEAPU8.set(/** @type {!Uint8Array} */(slab), ret);
  } else {
    HEAPU8.set(new Uint8Array(slab), ret);
  }
  return ret;
}

// include: runtime_strings.js


// runtime_strings.js: Strings related runtime functions that are part of both MINIMAL_RUNTIME and regular runtime.

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
// a copy of that string as a Javascript String object.

var UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined;

/**
 * @param {number} idx
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ArrayToString(heap, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  // (As a tiny code save trick, compare endPtr against endIdx using a negation, so that undefined means Infinity)
  while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr;

  if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
    return UTF8Decoder.decode(heap.subarray(idx, endPtr));
  } else {
    var str = '';
    // If building with TextDecoder, we have already computed the string length above, so test loop end condition against that
    while (idx < endPtr) {
      // For UTF8 byte structure, see:
      // http://en.wikipedia.org/wiki/UTF-8#Description
      // https://www.ietf.org/rfc/rfc2279.txt
      // https://tools.ietf.org/html/rfc3629
      var u0 = heap[idx++];
      if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
      var u1 = heap[idx++] & 63;
      if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
      var u2 = heap[idx++] & 63;
      if ((u0 & 0xF0) == 0xE0) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        if ((u0 & 0xF8) != 0xF0) warnOnce('Invalid UTF-8 leading byte 0x' + u0.toString(16) + ' encountered when deserializing a UTF-8 string on the asm.js/wasm heap to a JS string!');
        u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heap[idx++] & 63);
      }

      if (u0 < 0x10000) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 0x10000;
        str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
      }
    }
  }
  return str;
}

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns a
// copy of that string as a Javascript String object.
// maxBytesToRead: an optional length that specifies the maximum number of bytes to read. You can omit
//                 this parameter to scan the string until the first \0 byte. If maxBytesToRead is
//                 passed, and the string at [ptr, ptr+maxBytesToReadr[ contains a null byte in the
//                 middle, then the string will cut short at that byte index (i.e. maxBytesToRead will
//                 not produce a string of exact length [ptr, ptr+maxBytesToRead[)
//                 N.B. mixing frequent uses of UTF8ToString() with and without maxBytesToRead may
//                 throw JS JIT optimizations off, so it is worth to consider consistently using one
//                 style or the other.
/**
 * @param {number} ptr
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ToString(ptr, maxBytesToRead) {
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
}

// Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
// encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   heap: the array to copy to. Each index in this array is assumed to be one 8-byte element.
//   outIdx: The starting offset in the array to begin the copying.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array.
//                    This count should include the null terminator,
//                    i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
//                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
    return 0;

  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) {
      var u1 = str.charCodeAt(++i);
      u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
    }
    if (u <= 0x7F) {
      if (outIdx >= endIdx) break;
      heap[outIdx++] = u;
    } else if (u <= 0x7FF) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++] = 0xC0 | (u >> 6);
      heap[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0xFFFF) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++] = 0xE0 | (u >> 12);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      if (u >= 0x200000) warnOnce('Invalid Unicode code point 0x' + u.toString(16) + ' encountered when serializing a JS string to an UTF-8 string on the asm.js/wasm heap! (Valid unicode code points should be in range 0-0x1FFFFF).');
      heap[outIdx++] = 0xF0 | (u >> 18);
      heap[outIdx++] = 0x80 | ((u >> 12) & 63);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  heap[outIdx] = 0;
  return outIdx - startIdx;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8(str, outPtr, maxBytesToWrite) {
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  return stringToUTF8Array(str, HEAPU8,outPtr, maxBytesToWrite);
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.
function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
    if (u <= 0x7F) ++len;
    else if (u <= 0x7FF) len += 2;
    else if (u <= 0xFFFF) len += 3;
    else len += 4;
  }
  return len;
}

// end include: runtime_strings.js
// include: runtime_strings_extra.js


// runtime_strings_extra.js: Strings related runtime functions that are available only in regular runtime.

// Given a pointer 'ptr' to a null-terminated ASCII-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function AsciiToString(ptr) {
  var str = '';
  while (1) {
    var ch = HEAPU8[((ptr++)>>0)];
    if (!ch) return str;
    str += String.fromCharCode(ch);
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in ASCII form. The copy will require at most str.length+1 bytes of space in the HEAP.

function stringToAscii(str, outPtr) {
  return writeAsciiToMemory(str, outPtr, false);
}

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

var UTF16Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-16le') : undefined;

function UTF16ToString(ptr, maxBytesToRead) {
  assert(ptr % 2 == 0, 'Pointer passed to UTF16ToString must be aligned to two bytes!');
  var endPtr = ptr;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  var idx = endPtr >> 1;
  var maxIdx = idx + maxBytesToRead / 2;
  // If maxBytesToRead is not passed explicitly, it will be undefined, and this
  // will always evaluate to true. This saves on code size.
  while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
  endPtr = idx << 1;

  if (endPtr - ptr > 32 && UTF16Decoder) {
    return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
  } else {
    var str = '';

    // If maxBytesToRead is not passed explicitly, it will be undefined, and the for-loop's condition
    // will always evaluate to true. The loop is then terminated on the first null char.
    for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
      var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
      if (codeUnit == 0) break;
      // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
      str += String.fromCharCode(codeUnit);
    }

    return str;
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
// Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF16(str, outPtr, maxBytesToWrite) {
  assert(outPtr % 2 == 0, 'Pointer passed to stringToUTF16 must be aligned to two bytes!');
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 2) return 0;
  maxBytesToWrite -= 2; // Null terminator.
  var startPtr = outPtr;
  var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
  for (var i = 0; i < numCharsToWrite; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[((outPtr)>>1)]=codeUnit;
    outPtr += 2;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[((outPtr)>>1)]=0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF16(str) {
  return str.length*2;
}

function UTF32ToString(ptr, maxBytesToRead) {
  assert(ptr % 4 == 0, 'Pointer passed to UTF32ToString must be aligned to four bytes!');
  var i = 0;

  var str = '';
  // If maxBytesToRead is not passed explicitly, it will be undefined, and this
  // will always evaluate to true. This saves on code size.
  while (!(i >= maxBytesToRead / 4)) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0) break;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
  return str;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
// Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF32(str, outPtr, maxBytesToWrite) {
  assert(outPtr % 4 == 0, 'Pointer passed to stringToUTF32 must be aligned to four bytes!');
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 4) return 0;
  var startPtr = outPtr;
  var endPtr = startPtr + maxBytesToWrite - 4;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++i);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[((outPtr)>>2)]=codeUnit;
    outPtr += 4;
    if (outPtr + 4 > endPtr) break;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[((outPtr)>>2)]=0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF32(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i);
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
    len += 4;
  }

  return len;
}

// Allocate heap space for a JS string, and write it there.
// It is the responsibility of the caller to free() that memory.
function allocateUTF8(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = _malloc(size);
  if (ret) stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Allocate stack space for a JS string, and write it there.
function allocateUTF8OnStack(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = stackAlloc(size);
  stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Deprecated: This function should not be called because it is unsafe and does not provide
// a maximum length limit of how many bytes it is allowed to write. Prefer calling the
// function stringToUTF8Array() instead, which takes in a maximum length that can be used
// to be secure from out of bounds writes.
/** @deprecated
    @param {boolean=} dontAddNull */
function writeStringToMemory(string, buffer, dontAddNull) {
  warnOnce('writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!');

  var /** @type {number} */ lastChar, /** @type {number} */ end;
  if (dontAddNull) {
    // stringToUTF8Array always appends null. If we don't want to do that, remember the
    // character that existed at the location where the null will be placed, and restore
    // that after the write (below).
    end = buffer + lengthBytesUTF8(string);
    lastChar = HEAP8[end];
  }
  stringToUTF8(string, buffer, Infinity);
  if (dontAddNull) HEAP8[end] = lastChar; // Restore the value under the null character.
}

function writeArrayToMemory(array, buffer) {
  assert(array.length >= 0, 'writeArrayToMemory array must have a length (should be an array or typed array)')
  HEAP8.set(array, buffer);
}

/** @param {boolean=} dontAddNull */
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    HEAP8[((buffer++)>>0)]=str.charCodeAt(i);
  }
  // Null-terminate the pointer to the HEAP.
  if (!dontAddNull) HEAP8[((buffer)>>0)]=0;
}

// end include: runtime_strings_extra.js
// Memory management

function alignUp(x, multiple) {
  if (x % multiple > 0) {
    x += multiple - (x % multiple);
  }
  return x;
}

var HEAP,
/** @type {ArrayBuffer} */
  buffer,
/** @type {Int8Array} */
  HEAP8,
/** @type {Uint8Array} */
  HEAPU8,
/** @type {Int16Array} */
  HEAP16,
/** @type {Uint16Array} */
  HEAPU16,
/** @type {Int32Array} */
  HEAP32,
/** @type {Uint32Array} */
  HEAPU32,
/** @type {Float32Array} */
  HEAPF32,
/** @type {Float64Array} */
  HEAPF64;

function updateGlobalBufferAndViews(buf) {
  buffer = buf;
  Module['HEAP8'] = HEAP8 = new Int8Array(buf);
  Module['HEAP16'] = HEAP16 = new Int16Array(buf);
  Module['HEAP32'] = HEAP32 = new Int32Array(buf);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
}

var TOTAL_STACK = 5242880;
if (Module['TOTAL_STACK']) assert(TOTAL_STACK === Module['TOTAL_STACK'], 'the stack size can no longer be determined at runtime')

var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 16777216;if (!Object.getOwnPropertyDescriptor(Module, 'INITIAL_MEMORY')) Object.defineProperty(Module, 'INITIAL_MEMORY', { configurable: true, get: function() { abort('Module.INITIAL_MEMORY has been replaced with plain INITIAL_MEMORY (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)') } });

assert(INITIAL_MEMORY >= TOTAL_STACK, 'INITIAL_MEMORY should be larger than TOTAL_STACK, was ' + INITIAL_MEMORY + '! (TOTAL_STACK=' + TOTAL_STACK + ')');

// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && Int32Array.prototype.subarray !== undefined && Int32Array.prototype.set !== undefined,
       'JS engine does not provide full typed array support');

// In non-standalone/normal mode, we create the memory here.
// include: runtime_init_memory.js


// Create the wasm memory. (Note: this only applies if IMPORTED_MEMORY is defined)

  if (Module['wasmMemory']) {
    wasmMemory = Module['wasmMemory'];
  } else
  {
    wasmMemory = new WebAssembly.Memory({
      'initial': INITIAL_MEMORY / 65536
      ,
      'maximum': INITIAL_MEMORY / 65536
    });
  }

if (wasmMemory) {
  buffer = wasmMemory.buffer;
}

// If the user provides an incorrect length, just use that length instead rather than providing the user to
// specifically provide the memory length with Module['INITIAL_MEMORY'].
INITIAL_MEMORY = buffer.byteLength;
assert(INITIAL_MEMORY % 65536 === 0);
updateGlobalBufferAndViews(buffer);

// end include: runtime_init_memory.js

// include: runtime_init_table.js
// In regular non-RELOCATABLE mode the table is exported
// from the wasm module and this will be assigned once
// the exports are available.
var wasmTable;

// end include: runtime_init_table.js
// include: runtime_stack_check.js


// Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
function writeStackCookie() {
  var max = _emscripten_stack_get_end();
  assert((max & 3) == 0);
  // The stack grows downwards
  HEAPU32[(max >> 2)+1] = 0x2135467;
  HEAPU32[(max >> 2)+2] = 0x89BACDFE;
  // Also test the global address 0 for integrity.
  HEAP32[0] = 0x63736d65; /* 'emsc' */
}

function checkStackCookie() {
  if (ABORT) return;
  var max = _emscripten_stack_get_end();
  var cookie1 = HEAPU32[(max >> 2)+1];
  var cookie2 = HEAPU32[(max >> 2)+2];
  if (cookie1 != 0x2135467 || cookie2 != 0x89BACDFE) {
    abort('Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x2135467, but received 0x' + cookie2.toString(16) + ' ' + cookie1.toString(16));
  }
  // Also test the global address 0 for integrity.
  if (HEAP32[0] !== 0x63736d65 /* 'emsc' */) abort('Runtime error: The application has corrupted its heap memory area (address zero)!');
}

// end include: runtime_stack_check.js
// include: runtime_assertions.js


// Endianness check (note: assumes compiler arch was little-endian)
(function() {
  var h16 = new Int16Array(1);
  var h8 = new Int8Array(h16.buffer);
  h16[0] = 0x6373;
  if (h8[0] !== 0x73 || h8[1] !== 0x63) throw 'Runtime error: expected the system to be little-endian!';
})();

function abortFnPtrError(ptr, sig) {
	abort("Invalid function pointer " + ptr + " called with signature '" + sig + "'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this). Build with ASSERTIONS=2 for more info.");
}

// end include: runtime_assertions.js
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;
var runtimeExited = false;

function preRun() {

  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  checkStackCookie();
  assert(!runtimeInitialized);
  runtimeInitialized = true;
  
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  checkStackCookie();
  
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  checkStackCookie();
  runtimeExited = true;
}

function postRun() {
  checkStackCookie();

  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}

function addOnExit(cb) {
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

// include: runtime_math.js


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

assert(Math.imul, 'This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.fround, 'This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.clz32, 'This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.trunc, 'This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');

// end include: runtime_math.js
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function getUniqueRunDependency(id) {
  var orig = id;
  while (1) {
    if (!runDependencyTracking[id]) return id;
    id = orig + Math.random();
  }
}

function addRunDependency(id) {
  runDependencies++;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            err('still waiting on run dependencies:');
          }
          err('dependency: ' + dep);
        }
        if (shown) {
          err('(end of list)');
        }
      }, 10000);
    }
  } else {
    err('warning: run dependency added without ID');
  }
}

function removeRunDependency(id) {
  runDependencies--;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    err('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data

/** @param {string|number=} what */
function abort(what) {
  if (Module['onAbort']) {
    Module['onAbort'](what);
  }

  what += '';
  err(what);

  ABORT = true;
  EXITSTATUS = 1;

  var output = 'abort(' + what + ') at ' + stackTrace();
  what = output;

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  var e = new WebAssembly.RuntimeError(what);

  readyPromiseReject(e);
  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// {{MEM_INITIALIZER}}

// include: memoryprofiler.js


// end include: memoryprofiler.js
// show errors on likely calls to FS when it was not included
var FS = {
  error: function() {
    abort('Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with  -s FORCE_FILESYSTEM=1');
  },
  init: function() { FS.error() },
  createDataFile: function() { FS.error() },
  createPreloadedFile: function() { FS.error() },
  createLazyFile: function() { FS.error() },
  open: function() { FS.error() },
  mkdev: function() { FS.error() },
  registerDevice: function() { FS.error() },
  analyzePath: function() { FS.error() },
  loadFilesFromDB: function() { FS.error() },

  ErrnoError: function ErrnoError() { FS.error() },
};
Module['FS_createDataFile'] = FS.createDataFile;
Module['FS_createPreloadedFile'] = FS.createPreloadedFile;

// include: URIUtils.js


function hasPrefix(str, prefix) {
  return String.prototype.startsWith ?
      str.startsWith(prefix) :
      str.indexOf(prefix) === 0;
}

// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

// Indicates whether filename is a base64 data URI.
function isDataURI(filename) {
  return hasPrefix(filename, dataURIPrefix);
}

var fileURIPrefix = "file://";

// Indicates whether filename is delivered via file protocol (as opposed to http/https)
function isFileURI(filename) {
  return hasPrefix(filename, fileURIPrefix);
}

// end include: URIUtils.js
function createExportWrapper(name, fixedasm) {
  return function() {
    var displayName = name;
    var asm = fixedasm;
    if (!fixedasm) {
      asm = Module['asm'];
    }
    assert(runtimeInitialized, 'native function `' + displayName + '` called before runtime initialization');
    assert(!runtimeExited, 'native function `' + displayName + '` called after runtime exit (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
    if (!asm[name]) {
      assert(asm[name], 'exported native function `' + displayName + '` not found');
    }
    return asm[name].apply(null, arguments);
  };
}

var wasmBinaryFile = 'stormlib-js.wasm';
if (!isDataURI(wasmBinaryFile)) {
  wasmBinaryFile = locateFile(wasmBinaryFile);
}

function getBinary(file) {
  try {
    if (file == wasmBinaryFile && wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    var binary = tryParseAsDataURI(file);
    if (binary) {
      return binary;
    }
    if (readBinary) {
      return readBinary(file);
    } else {
      throw "both async and sync fetching of the wasm failed";
    }
  }
  catch (err) {
    abort(err);
  }
}

function getBinaryPromise() {
  // If we don't have the binary yet, and have the Fetch api, use that;
  // in some environments, like Electron's render process, Fetch api may be present, but have a different context than expected, let's only use it on the Web
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && typeof fetch === 'function'
      // Let's not use fetch to get objects over file:// as it's most likely Cordova which doesn't support fetch for file://
      && !isFileURI(wasmBinaryFile)
      ) {
    return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function(response) {
      if (!response['ok']) {
        throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
      }
      return response['arrayBuffer']();
    }).catch(function () {
      return getBinary(wasmBinaryFile);
    });
  }
  // Otherwise, getBinary should be able to get it synchronously
  return Promise.resolve().then(function() { return getBinary(wasmBinaryFile); });
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
  // prepare imports
  var info = {
    'env': asmLibraryArg,
    'wasi_snapshot_preview1': asmLibraryArg,
  };
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    var exports = instance.exports;

    Module['asm'] = exports;

    wasmTable = Module['asm']['__indirect_function_table'];
    assert(wasmTable, "table not found in wasm exports");

    removeRunDependency('wasm-instantiate');
  }
  // we can't run yet (except in a pthread, where we have a custom sync instantiator)
  addRunDependency('wasm-instantiate');

  // Async compilation can be confusing when an error on the page overwrites Module
  // (for example, if the order of elements is wrong, and the one defining Module is
  // later), so we save Module and check it later.
  var trueModule = Module;
  function receiveInstantiatedSource(output) {
    // 'output' is a WebAssemblyInstantiatedSource object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    assert(Module === trueModule, 'the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?');
    trueModule = null;
    // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
    // When the regression is fixed, can restore the above USE_PTHREADS-enabled path.
    receiveInstance(output['instance']);
  }

  function instantiateArrayBuffer(receiver) {
    return getBinaryPromise().then(function(binary) {
      return WebAssembly.instantiate(binary, info);
    }).then(receiver, function(reason) {
      err('failed to asynchronously prepare wasm: ' + reason);

      abort(reason);
    });
  }

  // Prefer streaming instantiation if available.
  function instantiateAsync() {
    if (!wasmBinary &&
        typeof WebAssembly.instantiateStreaming === 'function' &&
        !isDataURI(wasmBinaryFile) &&
        // Don't use streaming for file:// delivered objects in a webview, fetch them synchronously.
        !isFileURI(wasmBinaryFile) &&
        typeof fetch === 'function') {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function (response) {
        var result = WebAssembly.instantiateStreaming(response, info);
        return result.then(receiveInstantiatedSource, function(reason) {
            // We expect the most common failure cause to be a bad MIME type for the binary,
            // in which case falling back to ArrayBuffer instantiation should work.
            err('wasm streaming compile failed: ' + reason);
            err('falling back to ArrayBuffer instantiation');
            return instantiateArrayBuffer(receiveInstantiatedSource);
          });
      });
    } else {
      return instantiateArrayBuffer(receiveInstantiatedSource);
    }
  }

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to run the instantiation parallel
  // to any other async startup actions they are performing.
  if (Module['instantiateWasm']) {
    try {
      var exports = Module['instantiateWasm'](info, receiveInstance);
      return exports;
    } catch(e) {
      err('Module.instantiateWasm callback failed with error: ' + e);
      return false;
    }
  }

  // If instantiation fails, reject the module ready promise.
  instantiateAsync().catch(readyPromiseReject);
  return {}; // no exports yet; we'll fill them in later
}

// Globals used by JS i64 conversions
var tempDouble;
var tempI64;

// === Body ===

var ASM_CONSTS = {
  
};






  function abortStackOverflow(allocSize) {
      abort('Stack overflow! Attempted to allocate ' + allocSize + ' bytes on the stack, but stack has only ' + (_emscripten_stack_get_free() + allocSize) + ' bytes available!');
    }

  function callRuntimeCallbacks(callbacks) {
      while(callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == 'function') {
          callback(Module); // Pass the module as the first argument.
          continue;
        }
        var func = callback.func;
        if (typeof func === 'number') {
          if (callback.arg === undefined) {
            wasmTable.get(func)();
          } else {
            wasmTable.get(func)(callback.arg);
          }
        } else {
          func(callback.arg === undefined ? null : callback.arg);
        }
      }
    }

  function demangle(func) {
      warnOnce('warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling');
      return func;
    }

  function demangleAll(text) {
      var regex =
        /\b_Z[\w\d_]+/g;
      return text.replace(regex,
        function(x) {
          var y = demangle(x);
          return x === y ? x : (y + ' [' + x + ']');
        });
    }

  function jsStackTrace() {
      var error = new Error();
      if (!error.stack) {
        // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
        // so try that as a special-case.
        try {
          throw new Error();
        } catch(e) {
          error = e;
        }
        if (!error.stack) {
          return '(no stack trace available)';
        }
      }
      return error.stack.toString();
    }

  function stackTrace() {
      var js = jsStackTrace();
      if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']();
      return demangleAll(js);
    }

  function ___assert_fail(condition, filename, line, func) {
      abort('Assertion failed: ' + UTF8ToString(condition) + ', at: ' + [filename ? UTF8ToString(filename) : 'unknown filename', line, func ? UTF8ToString(func) : 'unknown function']);
    }

  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.copyWithin(dest, src, src + num);
    }

  function _emscripten_get_heap_size() {
      return HEAPU8.length;
    }
  
  function abortOnCannotGrowMemory(requestedSize) {
      abort('Cannot enlarge memory arrays to size ' + requestedSize + ' bytes (OOM). Either (1) compile with  -s INITIAL_MEMORY=X  with X higher than the current value ' + HEAP8.length + ', (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ');
    }
  function _emscripten_resize_heap(requestedSize) {
      requestedSize = requestedSize >>> 0;
      abortOnCannotGrowMemory(requestedSize);
    }
var ASSERTIONS = true;



/** @type {function(string, boolean=, number=)} */
function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      if (ASSERTIONS) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      }
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}


// Copied from https://github.com/strophe/strophejs/blob/e06d027/src/polyfills.js#L149

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

/**
 * Decodes a base64 string.
 * @param {string} input The string to decode.
 */
var decodeBase64 = typeof atob === 'function' ? atob : function (input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  var output = '';
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
  do {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output = output + String.fromCharCode(chr1);

    if (enc3 !== 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 !== 64) {
      output = output + String.fromCharCode(chr3);
    }
  } while (i < input.length);
  return output;
};

// Converts a string of base64 into a byte array.
// Throws error on invalid input.
function intArrayFromBase64(s) {
  if (typeof ENVIRONMENT_IS_NODE === 'boolean' && ENVIRONMENT_IS_NODE) {
    var buf;
    try {
      // TODO: Update Node.js externs, Closure does not recognize the following Buffer.from()
      /**@suppress{checkTypes}*/
      buf = Buffer.from(s, 'base64');
    } catch (_) {
      buf = new Buffer(s, 'base64');
    }
    return new Uint8Array(buf['buffer'], buf['byteOffset'], buf['byteLength']);
  }

  try {
    var decoded = decodeBase64(s);
    var bytes = new Uint8Array(decoded.length);
    for (var i = 0 ; i < decoded.length ; ++i) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return bytes;
  } catch (_) {
    throw new Error('Converting base64 string to bytes failed.');
  }
}

// If filename is a base64 data URI, parses and returns data (Buffer on node,
// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
function tryParseAsDataURI(filename) {
  if (!isDataURI(filename)) {
    return;
  }

  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}



__ATINIT__.push({ func: function() { ___wasm_call_ctors() } });
var asmLibraryArg = {
  "__assert_fail": ___assert_fail,
  "emscripten_memcpy_big": _emscripten_memcpy_big,
  "emscripten_resize_heap": _emscripten_resize_heap,
  "getTempRet0": getTempRet0,
  "memory": wasmMemory,
  "setTempRet0": setTempRet0
};
var asm = createWasm();
/** @type {function(...*):?} */
var ___wasm_call_ctors = Module["___wasm_call_ctors"] = createExportWrapper("__wasm_call_ctors");

/** @type {function(...*):?} */
var _Compress_PKLIB = Module["_Compress_PKLIB"] = createExportWrapper("Compress_PKLIB");

/** @type {function(...*):?} */
var _malloc = Module["_malloc"] = createExportWrapper("malloc");

/** @type {function(...*):?} */
var _implode = Module["_implode"] = createExportWrapper("implode");

/** @type {function(...*):?} */
var _free = Module["_free"] = createExportWrapper("free");

/** @type {function(...*):?} */
var _Decompress_PKLIB = Module["_Decompress_PKLIB"] = createExportWrapper("Decompress_PKLIB");

/** @type {function(...*):?} */
var _crc32 = Module["_crc32"] = createExportWrapper("crc32");

/** @type {function(...*):?} */
var ___errno_location = Module["___errno_location"] = createExportWrapper("__errno_location");

/** @type {function(...*):?} */
var stackSave = Module["stackSave"] = createExportWrapper("stackSave");

/** @type {function(...*):?} */
var stackRestore = Module["stackRestore"] = createExportWrapper("stackRestore");

/** @type {function(...*):?} */
var stackAlloc = Module["stackAlloc"] = createExportWrapper("stackAlloc");

/** @type {function(...*):?} */
var _emscripten_stack_init = Module["_emscripten_stack_init"] = function() {
  return (_emscripten_stack_init = Module["_emscripten_stack_init"] = Module["asm"]["emscripten_stack_init"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_stack_get_free = Module["_emscripten_stack_get_free"] = function() {
  return (_emscripten_stack_get_free = Module["_emscripten_stack_get_free"] = Module["asm"]["emscripten_stack_get_free"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_stack_get_end = Module["_emscripten_stack_get_end"] = function() {
  return (_emscripten_stack_get_end = Module["_emscripten_stack_get_end"] = Module["asm"]["emscripten_stack_get_end"]).apply(null, arguments);
};





// === Auto-generated postamble setup entry stuff ===

if (!Object.getOwnPropertyDescriptor(Module, "intArrayFromString")) Module["intArrayFromString"] = function() { abort("'intArrayFromString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "intArrayToString")) Module["intArrayToString"] = function() { abort("'intArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
Module["ccall"] = ccall;
if (!Object.getOwnPropertyDescriptor(Module, "cwrap")) Module["cwrap"] = function() { abort("'cwrap' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "setValue")) Module["setValue"] = function() { abort("'setValue' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
Module["getValue"] = getValue;
if (!Object.getOwnPropertyDescriptor(Module, "allocate")) Module["allocate"] = function() { abort("'allocate' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "UTF8ArrayToString")) Module["UTF8ArrayToString"] = function() { abort("'UTF8ArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "UTF8ToString")) Module["UTF8ToString"] = function() { abort("'UTF8ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF8Array")) Module["stringToUTF8Array"] = function() { abort("'stringToUTF8Array' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF8")) Module["stringToUTF8"] = function() { abort("'stringToUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF8")) Module["lengthBytesUTF8"] = function() { abort("'lengthBytesUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stackTrace")) Module["stackTrace"] = function() { abort("'stackTrace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "addOnPreRun")) Module["addOnPreRun"] = function() { abort("'addOnPreRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "addOnInit")) Module["addOnInit"] = function() { abort("'addOnInit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "addOnPreMain")) Module["addOnPreMain"] = function() { abort("'addOnPreMain' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "addOnExit")) Module["addOnExit"] = function() { abort("'addOnExit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "addOnPostRun")) Module["addOnPostRun"] = function() { abort("'addOnPostRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeStringToMemory")) Module["writeStringToMemory"] = function() { abort("'writeStringToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeArrayToMemory")) Module["writeArrayToMemory"] = function() { abort("'writeArrayToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeAsciiToMemory")) Module["writeAsciiToMemory"] = function() { abort("'writeAsciiToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "addRunDependency")) Module["addRunDependency"] = function() { abort("'addRunDependency' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Object.getOwnPropertyDescriptor(Module, "removeRunDependency")) Module["removeRunDependency"] = function() { abort("'removeRunDependency' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Object.getOwnPropertyDescriptor(Module, "FS_createFolder")) Module["FS_createFolder"] = function() { abort("'FS_createFolder' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "FS_createPath")) Module["FS_createPath"] = function() { abort("'FS_createPath' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Object.getOwnPropertyDescriptor(Module, "FS_createDataFile")) Module["FS_createDataFile"] = function() { abort("'FS_createDataFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Object.getOwnPropertyDescriptor(Module, "FS_createPreloadedFile")) Module["FS_createPreloadedFile"] = function() { abort("'FS_createPreloadedFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Object.getOwnPropertyDescriptor(Module, "FS_createLazyFile")) Module["FS_createLazyFile"] = function() { abort("'FS_createLazyFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Object.getOwnPropertyDescriptor(Module, "FS_createLink")) Module["FS_createLink"] = function() { abort("'FS_createLink' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "FS_createDevice")) Module["FS_createDevice"] = function() { abort("'FS_createDevice' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Object.getOwnPropertyDescriptor(Module, "FS_unlink")) Module["FS_unlink"] = function() { abort("'FS_unlink' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you") };
if (!Object.getOwnPropertyDescriptor(Module, "getLEB")) Module["getLEB"] = function() { abort("'getLEB' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getFunctionTables")) Module["getFunctionTables"] = function() { abort("'getFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "alignFunctionTables")) Module["alignFunctionTables"] = function() { abort("'alignFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "registerFunctions")) Module["registerFunctions"] = function() { abort("'registerFunctions' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "addFunction")) Module["addFunction"] = function() { abort("'addFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "removeFunction")) Module["removeFunction"] = function() { abort("'removeFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getFuncWrapper")) Module["getFuncWrapper"] = function() { abort("'getFuncWrapper' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "prettyPrint")) Module["prettyPrint"] = function() { abort("'prettyPrint' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "makeBigInt")) Module["makeBigInt"] = function() { abort("'makeBigInt' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "dynCall")) Module["dynCall"] = function() { abort("'dynCall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getCompilerSetting")) Module["getCompilerSetting"] = function() { abort("'getCompilerSetting' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "print")) Module["print"] = function() { abort("'print' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "printErr")) Module["printErr"] = function() { abort("'printErr' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getTempRet0")) Module["getTempRet0"] = function() { abort("'getTempRet0' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "setTempRet0")) Module["setTempRet0"] = function() { abort("'setTempRet0' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "callMain")) Module["callMain"] = function() { abort("'callMain' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "abort")) Module["abort"] = function() { abort("'abort' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stringToNewUTF8")) Module["stringToNewUTF8"] = function() { abort("'stringToNewUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "setFileTime")) Module["setFileTime"] = function() { abort("'setFileTime' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "abortOnCannotGrowMemory")) Module["abortOnCannotGrowMemory"] = function() { abort("'abortOnCannotGrowMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "emscripten_realloc_buffer")) Module["emscripten_realloc_buffer"] = function() { abort("'emscripten_realloc_buffer' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "ENV")) Module["ENV"] = function() { abort("'ENV' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "ERRNO_CODES")) Module["ERRNO_CODES"] = function() { abort("'ERRNO_CODES' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "ERRNO_MESSAGES")) Module["ERRNO_MESSAGES"] = function() { abort("'ERRNO_MESSAGES' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "setErrNo")) Module["setErrNo"] = function() { abort("'setErrNo' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "DNS")) Module["DNS"] = function() { abort("'DNS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getHostByName")) Module["getHostByName"] = function() { abort("'getHostByName' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "GAI_ERRNO_MESSAGES")) Module["GAI_ERRNO_MESSAGES"] = function() { abort("'GAI_ERRNO_MESSAGES' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "Protocols")) Module["Protocols"] = function() { abort("'Protocols' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "Sockets")) Module["Sockets"] = function() { abort("'Sockets' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getRandomDevice")) Module["getRandomDevice"] = function() { abort("'getRandomDevice' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "traverseStack")) Module["traverseStack"] = function() { abort("'traverseStack' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "UNWIND_CACHE")) Module["UNWIND_CACHE"] = function() { abort("'UNWIND_CACHE' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "withBuiltinMalloc")) Module["withBuiltinMalloc"] = function() { abort("'withBuiltinMalloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "readAsmConstArgsArray")) Module["readAsmConstArgsArray"] = function() { abort("'readAsmConstArgsArray' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "readAsmConstArgs")) Module["readAsmConstArgs"] = function() { abort("'readAsmConstArgs' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "mainThreadEM_ASM")) Module["mainThreadEM_ASM"] = function() { abort("'mainThreadEM_ASM' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "jstoi_q")) Module["jstoi_q"] = function() { abort("'jstoi_q' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "jstoi_s")) Module["jstoi_s"] = function() { abort("'jstoi_s' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getExecutableName")) Module["getExecutableName"] = function() { abort("'getExecutableName' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "listenOnce")) Module["listenOnce"] = function() { abort("'listenOnce' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "autoResumeAudioContext")) Module["autoResumeAudioContext"] = function() { abort("'autoResumeAudioContext' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "dynCallLegacy")) Module["dynCallLegacy"] = function() { abort("'dynCallLegacy' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getDynCaller")) Module["getDynCaller"] = function() { abort("'getDynCaller' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "dynCall")) Module["dynCall"] = function() { abort("'dynCall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "callRuntimeCallbacks")) Module["callRuntimeCallbacks"] = function() { abort("'callRuntimeCallbacks' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "abortStackOverflow")) Module["abortStackOverflow"] = function() { abort("'abortStackOverflow' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "reallyNegative")) Module["reallyNegative"] = function() { abort("'reallyNegative' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "unSign")) Module["unSign"] = function() { abort("'unSign' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "reSign")) Module["reSign"] = function() { abort("'reSign' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "formatString")) Module["formatString"] = function() { abort("'formatString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "PATH")) Module["PATH"] = function() { abort("'PATH' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "PATH_FS")) Module["PATH_FS"] = function() { abort("'PATH_FS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "SYSCALLS")) Module["SYSCALLS"] = function() { abort("'SYSCALLS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "syscallMmap2")) Module["syscallMmap2"] = function() { abort("'syscallMmap2' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "syscallMunmap")) Module["syscallMunmap"] = function() { abort("'syscallMunmap' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "JSEvents")) Module["JSEvents"] = function() { abort("'JSEvents' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "specialHTMLTargets")) Module["specialHTMLTargets"] = function() { abort("'specialHTMLTargets' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "maybeCStringToJsString")) Module["maybeCStringToJsString"] = function() { abort("'maybeCStringToJsString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "findEventTarget")) Module["findEventTarget"] = function() { abort("'findEventTarget' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "findCanvasEventTarget")) Module["findCanvasEventTarget"] = function() { abort("'findCanvasEventTarget' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "polyfillSetImmediate")) Module["polyfillSetImmediate"] = function() { abort("'polyfillSetImmediate' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "demangle")) Module["demangle"] = function() { abort("'demangle' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "demangleAll")) Module["demangleAll"] = function() { abort("'demangleAll' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "jsStackTrace")) Module["jsStackTrace"] = function() { abort("'jsStackTrace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stackTrace")) Module["stackTrace"] = function() { abort("'stackTrace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getEnvStrings")) Module["getEnvStrings"] = function() { abort("'getEnvStrings' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "checkWasiClock")) Module["checkWasiClock"] = function() { abort("'checkWasiClock' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "flush_NO_FILESYSTEM")) Module["flush_NO_FILESYSTEM"] = function() { abort("'flush_NO_FILESYSTEM' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToI64")) Module["writeI53ToI64"] = function() { abort("'writeI53ToI64' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToI64Clamped")) Module["writeI53ToI64Clamped"] = function() { abort("'writeI53ToI64Clamped' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToI64Signaling")) Module["writeI53ToI64Signaling"] = function() { abort("'writeI53ToI64Signaling' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToU64Clamped")) Module["writeI53ToU64Clamped"] = function() { abort("'writeI53ToU64Clamped' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToU64Signaling")) Module["writeI53ToU64Signaling"] = function() { abort("'writeI53ToU64Signaling' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "readI53FromI64")) Module["readI53FromI64"] = function() { abort("'readI53FromI64' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "readI53FromU64")) Module["readI53FromU64"] = function() { abort("'readI53FromU64' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "convertI32PairToI53")) Module["convertI32PairToI53"] = function() { abort("'convertI32PairToI53' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "convertU32PairToI53")) Module["convertU32PairToI53"] = function() { abort("'convertU32PairToI53' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "uncaughtExceptionCount")) Module["uncaughtExceptionCount"] = function() { abort("'uncaughtExceptionCount' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "exceptionLast")) Module["exceptionLast"] = function() { abort("'exceptionLast' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "exceptionCaught")) Module["exceptionCaught"] = function() { abort("'exceptionCaught' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "ExceptionInfoAttrs")) Module["ExceptionInfoAttrs"] = function() { abort("'ExceptionInfoAttrs' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "ExceptionInfo")) Module["ExceptionInfo"] = function() { abort("'ExceptionInfo' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "CatchInfo")) Module["CatchInfo"] = function() { abort("'CatchInfo' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "exception_addRef")) Module["exception_addRef"] = function() { abort("'exception_addRef' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "exception_decRef")) Module["exception_decRef"] = function() { abort("'exception_decRef' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "Browser")) Module["Browser"] = function() { abort("'Browser' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "funcWrappers")) Module["funcWrappers"] = function() { abort("'funcWrappers' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "getFuncWrapper")) Module["getFuncWrapper"] = function() { abort("'getFuncWrapper' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "setMainLoop")) Module["setMainLoop"] = function() { abort("'setMainLoop' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "tempFixedLengthArray")) Module["tempFixedLengthArray"] = function() { abort("'tempFixedLengthArray' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "miniTempWebGLFloatBuffers")) Module["miniTempWebGLFloatBuffers"] = function() { abort("'miniTempWebGLFloatBuffers' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "heapObjectForWebGLType")) Module["heapObjectForWebGLType"] = function() { abort("'heapObjectForWebGLType' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "heapAccessShiftForWebGLHeap")) Module["heapAccessShiftForWebGLHeap"] = function() { abort("'heapAccessShiftForWebGLHeap' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "GL")) Module["GL"] = function() { abort("'GL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "emscriptenWebGLGet")) Module["emscriptenWebGLGet"] = function() { abort("'emscriptenWebGLGet' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "computeUnpackAlignedImageSize")) Module["computeUnpackAlignedImageSize"] = function() { abort("'computeUnpackAlignedImageSize' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "emscriptenWebGLGetTexPixelData")) Module["emscriptenWebGLGetTexPixelData"] = function() { abort("'emscriptenWebGLGetTexPixelData' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "emscriptenWebGLGetUniform")) Module["emscriptenWebGLGetUniform"] = function() { abort("'emscriptenWebGLGetUniform' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "emscriptenWebGLGetVertexAttrib")) Module["emscriptenWebGLGetVertexAttrib"] = function() { abort("'emscriptenWebGLGetVertexAttrib' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "writeGLArray")) Module["writeGLArray"] = function() { abort("'writeGLArray' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "AL")) Module["AL"] = function() { abort("'AL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "SDL_unicode")) Module["SDL_unicode"] = function() { abort("'SDL_unicode' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "SDL_ttfContext")) Module["SDL_ttfContext"] = function() { abort("'SDL_ttfContext' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "SDL_audio")) Module["SDL_audio"] = function() { abort("'SDL_audio' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "SDL")) Module["SDL"] = function() { abort("'SDL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "SDL_gfx")) Module["SDL_gfx"] = function() { abort("'SDL_gfx' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "GLUT")) Module["GLUT"] = function() { abort("'GLUT' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "EGL")) Module["EGL"] = function() { abort("'EGL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "GLFW_Window")) Module["GLFW_Window"] = function() { abort("'GLFW_Window' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "GLFW")) Module["GLFW"] = function() { abort("'GLFW' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "GLEW")) Module["GLEW"] = function() { abort("'GLEW' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "IDBStore")) Module["IDBStore"] = function() { abort("'IDBStore' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "runAndAbortIfError")) Module["runAndAbortIfError"] = function() { abort("'runAndAbortIfError' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "warnOnce")) Module["warnOnce"] = function() { abort("'warnOnce' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stackSave")) Module["stackSave"] = function() { abort("'stackSave' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stackRestore")) Module["stackRestore"] = function() { abort("'stackRestore' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stackAlloc")) Module["stackAlloc"] = function() { abort("'stackAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "AsciiToString")) Module["AsciiToString"] = function() { abort("'AsciiToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stringToAscii")) Module["stringToAscii"] = function() { abort("'stringToAscii' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "UTF16ToString")) Module["UTF16ToString"] = function() { abort("'UTF16ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF16")) Module["stringToUTF16"] = function() { abort("'stringToUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF16")) Module["lengthBytesUTF16"] = function() { abort("'lengthBytesUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "UTF32ToString")) Module["UTF32ToString"] = function() { abort("'UTF32ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF32")) Module["stringToUTF32"] = function() { abort("'stringToUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF32")) Module["lengthBytesUTF32"] = function() { abort("'lengthBytesUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "allocateUTF8")) Module["allocateUTF8"] = function() { abort("'allocateUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "allocateUTF8OnStack")) Module["allocateUTF8OnStack"] = function() { abort("'allocateUTF8OnStack' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
Module["writeStackCookie"] = writeStackCookie;
Module["checkStackCookie"] = checkStackCookie;
if (!Object.getOwnPropertyDescriptor(Module, "intArrayFromBase64")) Module["intArrayFromBase64"] = function() { abort("'intArrayFromBase64' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "tryParseAsDataURI")) Module["tryParseAsDataURI"] = function() { abort("'tryParseAsDataURI' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_NORMAL")) Object.defineProperty(Module, "ALLOC_NORMAL", { configurable: true, get: function() { abort("'ALLOC_NORMAL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") } });
if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_STACK")) Object.defineProperty(Module, "ALLOC_STACK", { configurable: true, get: function() { abort("'ALLOC_STACK' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") } });

var calledRun;

/**
 * @constructor
 * @this {ExitStatus}
 */
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
}

var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};

/** @type {function(Array=)} */
function run(args) {
  args = args || arguments_;

  if (runDependencies > 0) {
    return;
  }

  // This is normally called automatically during __wasm_call_ctors but need to
  // get these values before even running any of the ctors so we call it redundantly
  // here.
  // TODO(sbc): Move writeStackCookie to native to to avoid this.
  _emscripten_stack_init();
  writeStackCookie();

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;

    if (ABORT) return;

    initRuntime();

    preMain();

    readyPromiseResolve(Module);
    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    assert(!Module['_main'], 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else
  {
    doRun();
  }
  checkStackCookie();
}
Module['run'] = run;

function checkUnflushedContent() {
  // Compiler settings do not allow exiting the runtime, so flushing
  // the streams is not possible. but in ASSERTIONS mode we check
  // if there was something to flush, and if so tell the user they
  // should request that the runtime be exitable.
  // Normally we would not even include flush() at all, but in ASSERTIONS
  // builds we do so just for this check, and here we see if there is any
  // content to flush, that is, we check if there would have been
  // something a non-ASSERTIONS build would have not seen.
  // How we flush the streams depends on whether we are in SYSCALLS_REQUIRE_FILESYSTEM=0
  // mode (which has its own special function for this; otherwise, all
  // the code is inside libc)
  var oldOut = out;
  var oldErr = err;
  var has = false;
  out = err = function(x) {
    has = true;
  }
  try { // it doesn't matter if it fails
    var flush = null;
    if (flush) flush();
  } catch(e) {}
  out = oldOut;
  err = oldErr;
  if (has) {
    warnOnce('stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the FAQ), or make sure to emit a newline when you printf etc.');
    warnOnce('(this may also be due to not including full filesystem support - try building with -s FORCE_FILESYSTEM=1)');
  }
}

/** @param {boolean|number=} implicit */
function exit(status, implicit) {
  checkUnflushedContent();

  // if this is just main exit-ing implicitly, and the status is 0, then we
  // don't need to do anything here and can just leave. if the status is
  // non-zero, though, then we need to report it.
  // (we may have warned about this earlier, if a situation justifies doing so)
  if (implicit && noExitRuntime && status === 0) {
    return;
  }

  if (noExitRuntime) {
    // if exit() was called, we may warn the user if the runtime isn't actually being shut down
    if (!implicit) {
      var msg = 'program exited (with status: ' + status + '), but EXIT_RUNTIME is not set, so halting execution but not exiting the runtime or preventing further async execution (build with EXIT_RUNTIME=1, if you want a true shutdown)';
      readyPromiseReject(msg);
      err(msg);
    }
  } else {

    EXITSTATUS = status;

    exitRuntime();

    if (Module['onExit']) Module['onExit'](status);

    ABORT = true;
  }

  quit_(status, new ExitStatus(status));
}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

noExitRuntime = true;

run();







  return createStormLib.ready
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = createStormLib;
else if (typeof define === 'function' && define['amd'])
  define([], function() { return createStormLib; });
else if (typeof exports === 'object')
  exports["createStormLib"] = createStormLib;
