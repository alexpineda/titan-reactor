import { GeometryOptions, UnitTileScale } from "common/types";

import {
    createLookupTextures,
    createTerrainGeometryFromQuartiles,
    createLookupBitmaps,
    defaultGeometryOptions,
    transformLevelConfiguration,
    doHeightMapEffect,
    LookupBitmaps,
    LookupTextures,
} from ".";

import { loadAllTilesetData, TilesetData } from "./get-tileset-buffers";

import * as sd from "./sd";
import * as hd from "./hd";
import { renderComposer } from "@render";
import { Creep } from "@core/creep/creep";
import { Janitor } from "three-janitor";
import processStore from "@stores/process-store";

export async function terrainComposer(
    mapWidth: number,
    mapHeight: number,
    tileset: number,
    mapTiles: Uint16Array,
    textureResolution: UnitTileScale,
    geomOptions: GeometryOptions = defaultGeometryOptions
) {
    const janitor = new Janitor( "chkToTerrainMesh" );
    const genProcess = processStore().create( "chkToTerrainMesh", 4 );

    const td = await loadAllTilesetData( tileset );

    const lookupBitmaps = createLookupBitmaps( mapWidth, mapHeight, mapTiles, td );

    const lookupTextures = janitor.mop(
        await createLookupTextures( td, {
            blendNonWalkableBase: geomOptions.blendNonWalkableBase,
            mapWidth,
            mapHeight,
            lookupBitmaps,
        } )
    );

    const levels = transformLevelConfiguration(
        geomOptions.elevationLevels,
        geomOptions.normalizeLevels
    );

    genProcess.increment();

    const renderer = renderComposer.glRenderer;

    const heightMaps = doHeightMapEffect( {
        palette: td.palette,
        tileset,
        mapWidth,
        mapHeight,
        lookupTextures,
        geomOptions,
        levels,
        renderer,
    } );

    genProcess.increment();

    renderComposer.preprocessStart();

    const { creepTexture, creepEdgesTexture } = janitor.mop(
        await generateCreepDiffuse( textureResolution, td )
    );

    const { textures } = janitor.mop(
        generateMapDiffuseQuartiles(
            textureResolution,
            mapWidth,
            mapHeight,
            lookupBitmaps,
            td,
            lookupTextures.effectsTextures
        )
    );

    //TODO: generate water mask

    renderComposer.preprocessEnd();
    genProcess.complete();

    const terrain = createTerrainGeometryFromQuartiles(
        mapWidth,
        mapHeight,
        creepTexture,
        creepEdgesTexture,
        geomOptions,
        lookupTextures,
        heightMaps,
        textures
    );

    janitor.mop( terrain, "terrain" );

    const creep = janitor.mop(
        new Creep(
            mapWidth,
            mapHeight,
            lookupTextures.creepTexUniform.value,
            lookupTextures.creepEdgesTexUniform.value
        ),
        "creep"
    );

    return {
        terrain,
        minimapTex: lookupTextures.mapDiffuseTex,
        creep,
        heightMaps,
        dispose() {
            janitor.dispose();
        },
    };
}

const generateCreepDiffuse = async (
    textureResolution: UnitTileScale,
    td: TilesetData
) => {
    const isLowRes = textureResolution === UnitTileScale.SD;

    renderComposer.preprocessStart();

    const creepTexture = isLowRes
        ? sd.grpToCreepTexture( td )
        : hd.ddsToCreepTexture(
              td.hdTiles,
              td.tilegroupsCV5,
              textureResolution,
              renderComposer.glRenderer
          );

    const creepEdgesTexture = isLowRes
        ? await sd.grpToCreepEdgesTextureAsync( td.creepGrpSD, td.palette )
        : hd.ddsToCreepEdgesTexture(
              td.creepGrpHD,
              textureResolution,
              renderComposer.glRenderer
          );

    return {
        creepTexture,
        creepEdgesTexture,
        dispose() {
            creepTexture.dispose();
            creepEdgesTexture.dispose();
        },
    };
};

const generateMapDiffuseQuartiles = (
    textureResolution: UnitTileScale,
    mapWidth: number,
    mapHeight: number,
    lookupBitmaps: LookupBitmaps,
    td: TilesetData,
    effectTextures: LookupTextures["effectsTextures"]
) => {
    const isLowRes = textureResolution === UnitTileScale.SD;

    const textures = isLowRes
        ? sd.createSdQuartiles( mapWidth, mapHeight, lookupBitmaps.diffuse )
        : hd.createHdQuartiles(
              mapWidth,
              mapHeight,
              td.hdTiles,
              lookupBitmaps.mapTilesData,
              textureResolution,
              effectTextures,
              renderComposer.glRenderer
          );

    return {
        textures,
        dispose() {
            textures.dispose();
        },
    };
};
