import { Grp } from "common/image/grp";
import { parseIScriptBin } from "./parse-iscript-bin";
import path from "path";

import { ReadFile, AnimFrame, GrpSprite } from "../types";
import range from "../utils/range";
import { BwDAT } from "./bw-dat";
import { FlingiesDAT } from "./flingy-dat";
import { ImagesDAT } from "./images-dat";
import { OrdersDAT } from "./orders-dat";
import { LoDAT, parseLo } from "./parse-lo";
import { SoundsDAT } from "./sounds-dat";
import { SpritesDAT } from "./sprites-dat";
import { TechDatasDAT } from "./tech-data-dat";
import { UnitDAT, UnitsDAT } from "./units-dat";
import { UpgradesDAT } from "./upgrades-dat";
import { WeaponsDAT } from "./weapons-dat";

export async function loadDATFiles( readFile: ReadFile ): Promise<BwDAT> {
    const iscript = parseIScriptBin( await readFile( "scripts/iscript.bin" ) );

    const imagesDat = new ImagesDAT( readFile );
    const images = await imagesDat.load();

    const los: LoDAT[] = [];
    for ( let i = 0; i < imagesDat.stats.length; i++ ) {
        if ( imagesDat.stats[i]!.includes( ".lo" ) ) {
            const fpath = path.join( "unit/", imagesDat.stats[i]!.replace( /\\/g, "/" ) );
            los[i] = parseLo( await readFile( fpath ) );
        }
    }
    const sprites = await new SpritesDAT( readFile, images ).load();
    const flingy = await new FlingiesDAT( readFile, sprites ).load();
    const weapons = await new WeaponsDAT( readFile, flingy ).load();
    const sounds = await new SoundsDAT( readFile ).load();

    const units = ( await new UnitsDAT( readFile, flingy, sounds ).load() ).map(
        ( u ) => new UnitDAT( u )
    );

    const tech = await new TechDatasDAT( readFile ).load();
    const upgrades = await new UpgradesDAT( readFile ).load();
    const orders = await new OrdersDAT( readFile ).load();

    const bufs = await Promise.all(
        images.map( ( image ) => readFile( `unit/${image.grpFile.replace( /\\/g, "/" )}` ) )
    );

    const grps = bufs.map( ( buf ): GrpSprite => {
        const grp = new Grp( buf );
        const frames = range( 0, grp.frameCount() ).map( ( frame ): AnimFrame => {
            const { x, y, w, h } = grp.header( frame );
            //FIXME: calculate xoff, yoff
            return { x, y, w, h, xoff: 0, yoff: 0 };
        } );
        const maxFrameH = frames.reduce( ( max, { h } ) => {
            return h > max ? h : max;
        }, 0 );
        const maxFramew = frames.reduce( ( max, { w } ) => {
            return w > max ? w : max;
        }, 0 );

        const { w, h } = grp.maxDimensions();
        return {
            w,
            h,
            frames,
            maxFrameH,
            maxFramew,
        };
    } );

    return {
        iscript,
        sounds,
        tech,
        upgrades,
        orders,
        units,
        images,
        los,
        sprites,
        weapons,
        grps,
    };
}
