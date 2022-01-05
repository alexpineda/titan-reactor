import createOpenBw from "./titan.js";
import OpenBWFileList from "./openbw-filelist"
import { readFileSync } from "fs";
import path from "path";

const openBwFiles = new OpenBWFileList();
const wasmFileLocation = path.join(__static, "titan.wasm");
console.log("wasmFileLocation", wasmFileLocation);

const callbacks = {
    beforeFrame: () => {},
    afterFrame: () => {},
};

const openBw = {
    api: null,
    callbacks,
    loaded: createOpenBw({
        wasmBinary: readFileSync(wasmFileLocation),
    }).then((_api : any) => {
        openBw.api = _api;
        openBwFiles.init(_api, callbacks)
        return true;
    }),
}

;

export { openBw, openBwFiles };