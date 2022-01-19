# Contributors Crash Course

Yoyo come in here with ur editor! Quick!

Titan Reactor mostly leverages OpenBW via WASM, Typescript, and WebGL via three.js.

## Primary Tech
- node ^14.
- yarn ^1.0
- three@latest
- electron-webpack@latest
- electron^15.0.0
- preact@latest
- zustand
- openbw

## Build
For our build we use `electron-webpack` which includes hot reload for both renderer and main process
There are pre-built wasm binaries/js files that need to be fetched using the `git lfs` system (Large File Storage), you can also build these yourself if you want over at the titan-reactor/openbw repo.
