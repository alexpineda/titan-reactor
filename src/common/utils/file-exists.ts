import fs, { promises as fsPromises } from "fs";

export async function fileExists( path: string ) {
    try {
        await fsPromises.access( path, fs.constants.R_OK );
        return true;
    } catch ( err ) {
        return false;
    }
}
