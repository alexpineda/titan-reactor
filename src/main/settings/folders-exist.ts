import { fileExists } from "common/utils/file-exists";
import path from "path";

export const foldersExist = async ( rootDirectory: string, directories: string[] ) => {
    if ( await fileExists( rootDirectory ) ) {
        for ( const folder of directories ) {
            if ( !( await fileExists( path.join( rootDirectory, folder ) ) ) ) {
                return false;
            }
        }
    } else {
        return false;
    }
    return true;
};
