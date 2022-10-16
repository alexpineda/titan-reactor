import { Downgrader } from "./downgrader";

import BufferList from "bl";
import VersionDowngrader from "./version";
import StringDowngrader from "./string";
import CRGBDowngrader from "./crgb";
import { Version } from "../chk-common";
import { uint32 } from "../../util/alloc";

class Orchestrate {
    readonly chunks: [string, Buffer][];
    isSCR: boolean;
    downgraders: Downgrader[];

    constructor( chunks: [string, Buffer][] ) {
        this.chunks = chunks;

        const versionDowngrader = new VersionDowngrader();
        this.downgraders = [
            versionDowngrader,
            new StringDowngrader(),
            new CRGBDowngrader(),
        ];

        const versionChunk = this._getChunk( versionDowngrader.chunkName )?.[1];
        if ( versionChunk === undefined ) {
            throw new Error( "no version chunk" );
        }
        const version = versionDowngrader.read( versionChunk );
        this.isSCR = version === Version.SCR || version === Version.BroodwarRemastered;
    }

    _getChunk( chunkName: string ) {
        return this.chunks.find( ( [name] ) => name === chunkName );
    }

    downgrade() {
        const _omit: string[] = [];
        const _add: ( readonly [string, Buffer] )[] = [];

        this.downgraders.forEach( ( downgrader ) => {
            const chunk = this._getChunk( downgrader.chunkName );
            // if the chunk exists, downgrade it
            if ( chunk ) {
                _omit.push( downgrader.chunkName );
                const newChunk = downgrader.downgrade( chunk[1] );

                // if we're replacing it with something, do so
                if ( newChunk ) {
                    // if there is existing chunks of the new name make sure we don't include them
                    _omit.push( newChunk[0] );
                    // add the downgraded chunk
                    _add.push( newChunk );
                }
            }
        } );

        const out = new BufferList();
        const outChunks = [
            ...this.chunks.filter( ( [name] ) => !_omit.includes( name ) ),
            ..._add,
        ];

        for ( const [name, buffer] of outChunks ) {
            out.append( Buffer.from( name ) );
            out.append( uint32( buffer.length ) );
            out.append( buffer );
        }

        // return a Buffer
        return out.slice( 0 );
    }
}
export default Orchestrate;
