const { exec } = window.require("child_process");

export default {
    loadReplay : () => new Promise((resolve, reject) => {
        //load replay json w 10mb buffer
        exec("./replay/screp -indent=false -cmds -map -mapres -maptiles ./replay/game.rep", {maxBuffer: 1024 * 10000}, (error, stdout, stderr) => {
                        
            if (error) {
                return reject(error);
            }

            if (stderr) {
                return reject(stderr);
            }

            try {
                resolve(JSON.parse(stdout));
            } catch (e) {
                reject(new Error("Failed JSON.parse on screp data"))
            }
        });
    })
};
