import { Assets } from "@image/assets";
import { describe, it, expect, jest } from "@jest/globals";
import type Chk from "bw-chk";
import { preloadMapUnitsAndSpriteFiles } from "./preload-map-units-and-sprites";
import processStore from "@stores/process-store";

import * as imagesFromIScript from "@utils/images-from-iscript";

jest.mock( "@utils/images-from-iscript", () => ( {
    __esModule: true,
    calculateImagesFromSpritesIscript: jest.fn(),
    calculateImagesFromUnitsIscript: jest.fn(),
    calculateImagesFromIScript: jest.fn(),
} ) );

jest.mock( "@stores/process-store" );

describe( "preloadMapUnitsAndSpriteFiles", () => {
    it( "should call calculate images from all sprites gathered from the map", () => {
        const assetFixture = {
            bwDat: {},
            loadImageAtlasAsync: jest.fn(),
        } as unknown as Assets;

        const mapFixture = {
            units: [ { sprite: 1 } ],
            sprites: [ { spriteId: 2 } ],
        } as Chk;

        // mock calculateImagesFromSpritesIscript to return an empty array
        (
            imagesFromIScript.calculateImagesFromSpritesIscript as jest.Mock
        ).mockReturnValue( [] );

        // mock processStore to return a mock create function
        ( processStore as jest.Mock ).mockReturnValue( {
            create: jest.fn(),
        } );

        preloadMapUnitsAndSpriteFiles( assetFixture, mapFixture );

        // expect calculateImagesFromSpritesIscript to be called with the sprites from the map
        expect( imagesFromIScript.calculateImagesFromSpritesIscript ).toBeCalledWith(
            assetFixture.bwDat,
            [ 1, 2 ]
        );
    } );
} );
