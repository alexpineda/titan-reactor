import { Version } from "../chk-common";
import { uint16 } from "../../util/alloc";
import { Downgrader } from "./downgrader";

class VersionDowngrader implements Downgrader {
    constructor() {
        this.chunkName = "VER\x20";
    }
    chunkName: string;

    read( buffer: Buffer ) {
        return buffer.readUInt16LE( 0 );
    }

    downgrade( buffer: Buffer ) {
        const version = buffer.readUInt16LE( 0 );
        const newVersion = uint16(
            version === Version.SCR ? Version.Hybrid : Version.Broodwar
        );

        return [this.chunkName, newVersion] as const;
    }
}
export default VersionDowngrader;
