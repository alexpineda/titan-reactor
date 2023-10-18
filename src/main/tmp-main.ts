import path from "path";


export const ROOT_PATH = {
    // /dist
    dist: path.join( __dirname, "../.." ),
    // /dist or /public
    public: path.join( __dirname, process.env.NODE_ENV !== "production" ? "../.." : "../../../bundled" ),
};


export const LOG_PATH = "./";
export const PLUGIN_PATH = "./";

export const BUNDLED_SUBPATH = path.normalize( "/bundled/" );
export const RESOURCES_PATH = path.normalize( ROOT_PATH.public );



