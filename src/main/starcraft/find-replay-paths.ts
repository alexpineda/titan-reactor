import { fileExists } from "../../common/utils/file-exists";
import path from "path";
import { app } from "electron";

export async function findReplaysPath() {
    const replaysPath = path.join(
        app.getPath( "documents" ),
        "Starcraft",
        "Maps",
        "Replays"
    );
    if ( await fileExists( replaysPath ) ) {
        return replaysPath;
    }
    return app.getPath( "documents" );
}
