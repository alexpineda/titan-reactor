import { TilesetData } from "./get-tileset-buffers";

export type LookupBitmaps = {
    mapTilesData: Uint16Array;
    diffuse: Uint8Array;
    layers: Uint8Array;
    paletteIndices: Uint8Array;
    occlussionRoughnessMetallic: Uint8Array;
};

export const createLookupBitmaps = (
    mapWidth: number,
    mapHeight: number,
    mapTiles: Uint16Array,
    {
        palette: paletteWPE,
        tilegroupsCV5,
        megatilesVX4,
        minitilesFlagsVF4,
        minitilesVR4,
    }: TilesetData
): LookupBitmaps => {
    let tileGroup,
        groupIndex,
        groupOffset,
        megatileId,
        mapTile,
        mini,
        minitile,
        flipped,
        meta,
        walkable,
        mid,
        high,
        elevation,
        miniPos,
        pixelPos,
        r,
        g,
        b;

    const mapTilesData = new Uint16Array( mapWidth * mapHeight );
    const diffuse = new Uint8Array( mapWidth * mapHeight * 32 * 32 * 4 );
    const layers = new Uint8Array( mapWidth * mapHeight * 4 * 4 );
    const paletteIndices = new Uint8Array( mapWidth * mapHeight * 32 * 32 );
    const occlussionRoughnessMetallic = new Uint8Array(
        mapWidth * mapHeight * 32 * 32 * 4
    );
    const metaData = new Uint8Array( mapWidth * mapHeight * 4 * 4 );

    for ( let mapY = 0; mapY < mapHeight; mapY++ ) {
        for ( let mapX = 0; mapX < mapWidth; mapX++ ) {
            mapTile = mapY * mapWidth + mapX;
            let tileId = 0;
            if ( mapTile > mapTiles.length ) {
                tileId = 0;
            } else {
                tileId = mapTiles[mapTile];
            }

            tileGroup = tileId >> 4;
            groupIndex = tileId & 0xf;
            groupOffset = tileGroup * 26 + groupIndex + 10;
            megatileId = 0;
            if ( groupOffset > tilegroupsCV5.length ) {
                megatileId = 0;
            } else {
                megatileId = tilegroupsCV5[groupOffset];
            }

            mapTilesData[mapY * mapWidth + mapX] = megatileId;

            for ( let miniY = 0; miniY < 4; miniY++ ) {
                for ( let miniX = 0; miniX < 4; miniX++ ) {
                    const _megaIdx = megatileId * 16 + ( miniY * 4 + miniX );
                    mini = megatilesVX4[_megaIdx];
                    minitile = mini & 0xfffffffe;
                    flipped = mini & 1;
                    meta = minitilesFlagsVF4[_megaIdx];
                    walkable = meta & 0x01;
                    mid = meta & 0x02;
                    high = meta & 0x04;
                    // blocksView = meta & 0x08;
                    elevation = 0;

                    // bool tile_can_have_creep(xy_t<size_t> tile_pos) {
                    //   size_t index = tile_pos.y * game_st.map_tile_width + tile_pos.x;
                    //   if (st.tiles[index].flags & (tile_t::flag_unbuildable | tile_t::flag_partially_walkable)) return false;
                    //   if (tile_pos.y == game_st.map_tile_height - 1) return true;
                    //   if (st.tiles[index + game_st.map_tile_width].flags & tile_t::flag_unbuildable) return false;
                    //   return true;
                    // }

                    if ( high && walkable && mid ) {
                        elevation = 6;
                    } else if ( high && walkable ) {
                        elevation = 5;
                    } else if ( high ) {
                        elevation = 4;
                    } else if ( mid && walkable ) {
                        elevation = 3;
                    } else if ( mid ) {
                        elevation = 2;
                    } else if ( walkable ) {
                        elevation = 1;
                    }

                    miniPos =
                        mapY * mapWidth * 16 + mapX * 4 + miniY * mapWidth * 4 + miniX;

                    layers[miniPos] = elevation;
                    metaData[miniPos] = meta;

                    for ( let colorY = 0; colorY < 8; colorY++ ) {
                        for ( let colorX = 0; colorX < 8; colorX++ ) {
                            let color = 0;
                            if ( flipped ) {
                                color =
                                    minitilesVR4[
                                        minitile * 0x20 + colorY * 8 + ( 7 - colorX )
                                    ];
                            } else {
                                color =
                                    minitilesVR4[minitile * 0x20 + colorY * 8 + colorX];
                            }

                            const c4 = color * 4;

                            r = paletteWPE[c4];
                            g = paletteWPE[c4 + 1];
                            b = paletteWPE[c4 + 2];

                            pixelPos =
                                mapY * mapWidth * 1024 +
                                mapX * 32 +
                                miniY * mapWidth * 256 +
                                miniX * 8 +
                                colorY * mapWidth * 32 +
                                colorX;

                            paletteIndices[pixelPos] = color;

                            const p4 = pixelPos * 4;
                            diffuse[p4] = r;
                            diffuse[p4 + 1] = g;
                            diffuse[p4 + 2] = b;
                            diffuse[p4 + 3] = 255;

                            // G channel for roughness
                            occlussionRoughnessMetallic[p4 + 1] =
                                elevation == 0 ? 0 : 255;
                        }
                    }
                }
            }
        }
    }

    return {
        mapTilesData,
        diffuse,
        layers,
        paletteIndices,
        occlussionRoughnessMetallic,
    };
};
