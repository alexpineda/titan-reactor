import electronIsDev from "electron-is-dev";
import http from "http";
import nodeStatic from "node-static";
import path from "path";

const _p = path.join(__static, "plugins");
var file = new nodeStatic.Server(_p, { cache: electronIsDev ? 0 : 3600 });
const server = http.createServer(function (req, res) {
    //https://web.dev/origin-agent-cluster/
    res.setHeader("Origin-Agent-Cluster", "?1")

    req.addListener('end', function () {
        file.serve(req, res, function (err, result) {
            if (err) { // There was an error serving the file
                console.error("Error serving " + req.url + " - " + err.message);

                // Respond to the client
                res.writeHead(err.status, err.headers);
                res.end();
            }
        });
    }).resume();
});
export default server;