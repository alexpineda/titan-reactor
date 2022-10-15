import { app } from "electron";
import path from "path";

export const ROOT_PATH = {
    // /dist
    dist: path.join( __dirname, "../.." ),
    // /dist or /public
    public: path.join( __dirname, app.isPackaged ? "../.." : "../../../bundled" ),
};
