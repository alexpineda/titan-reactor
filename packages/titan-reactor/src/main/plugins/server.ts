import electronIsDev from "electron-is-dev";
import http from "http";
import log from "../logger/singleton";
import nodeStatic from "node-static";
import path from "path";

// TODO: verify it exists
const _p = path.join(__static, "plugins");
var file = new nodeStatic.Server(_p, { cache: electronIsDev ? 0 : 3600 });
const server = http.createServer(function (req, res) {
    //https://web.dev/origin-agent-cluster/
    res.setHeader("Origin-Agent-Cluster", "?1")
    if (electronIsDev) {
        res.setHeader("Access-Control-Allow-Origin", "*");
    }
    req.addListener('end', function () {
        file.serve(req, res, function (err) {
            if (err) {
                log.error("Error serving " + req.url + " - " + err.message);
                res.writeHead(err.status, err.headers);
                res.end();
            }
        });
    }).resume();
});
export default server;