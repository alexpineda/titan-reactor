import { fileExists } from "../../common/utils/file-exists";
import path from "path";
import { app } from "electron";

export async function findMapsPath() {
    const mapsPath = path.join( app.getPath( "documents" ), "Starcraft", "Maps" );
    if ( await fileExists( mapsPath ) ) {
        return mapsPath;
    }
    return app.getPath( "documents" );
}
