import concat from "concat-stream";
import createScmExtractor from "scm-extractor";
import fs from "fs";

export default ( filename: string ): Promise<Buffer> =>
    new Promise<Buffer>( ( res ) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        fs
            .createReadStream( filename )
            .pipe( createScmExtractor() )
            .pipe(
                concat( ( data: Buffer ) => {
                    res( data );
                } )
            )
    );
