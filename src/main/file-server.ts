import express from "express";
import * as casclib from "bw-casclib";

export const server = express();
let _handle: any = null;

export const opts = {
    path: ""
}

server.use(function (_, res, next) {
    res.setHeader("Origin-Agent-Cluster", "?1")
    res.setHeader("Access-Control-Allow-Origin", "*");
    next()
})

server.get("*", async function (req, res) {
    if (_handle === null) {
        console.log("opening path " + opts.path)
        _handle = await casclib.openStorage(opts.path);
    }
    console.log("requesting " + req.path.slice(1))
    const data = await casclib.readFile(_handle, req.path.slice(1));

    res.setHeader("Content-Type", "application/octet-stream");
    res.send(data);
    res.end();
});

server.post("*", async function (req, res) {
    if ((req.params as { replay?: string })["replay"]) {
        // req.body
    } else if ((req.params as { map?: string })["map"]) {

    }
});

// ipcMain.on('start-server', (event, arg) => {
//     store.set("port", arg);
//     opts.path = store.get("directory");
//     console.log(arg, opts.path)
//     try {
//       server.listen(arg, "localhost")
//       event.sender.send('start-server-reply', {});
//     } catch (e) {
//       event.sender.send('start-server-reply', { error: (e as Error).message ?? "Error starting server" });
//     }
//   });