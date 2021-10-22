# iscript
A javascript parser for iscript.bin files. Ported from PyDAT.

[![NPM](https://img.shields.io/npm/v/iscript.svg?style=flat)](https://www.npmjs.org/package/iscript)

[![NPM](https://nodei.co/npm/iscript.png)](https://www.npmjs.org/package/iscript)

See [example.js](./example.js) for a simple example.

This module exports a single function, `iscript`, which takes a Buffer object and returns the animation blocks, as well as the unit iscripts that refer to them.
