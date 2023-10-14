import { Vector3 } from "three";
import { SoundDAT } from "common/types";
import gameStore from "@stores/game-store";
import { SoundChannels } from "@audio/sound-channels";
import { ProjectedCameraView } from "renderer/camera/projected-camera-view";
import { PxToWorld } from "common/utils/conversions";
import { mixer } from "@core/global";
import { GameViewPort } from "../camera/game-viewport";

export const MinPlayVolume = 10;

// Calculate the volume using the openbw algorithm
export const getBwVolume = (
    dat: SoundDAT,
    mapCoords: Vector3,
    x: number,
    y: number,
    left: number,
    top: number,
    right: number,
    bottom: number
) => {
    let volume = dat.minVolume || 0;

    if ( x !== 0 && y !== 0 ) {
        let distance = 0;
        if ( mapCoords.x < left ) distance += left - mapCoords.x;
        else if ( mapCoords.x > right ) distance += mapCoords.x - right;
        if ( mapCoords.z < top ) distance += top - mapCoords.z;
        else if ( mapCoords.z > bottom ) distance += mapCoords.z - bottom;

        const distance_volume = 99 - ( 99 * distance ) / 16;

        if ( distance_volume > volume ) volume = distance_volume;
    }

    return volume;
};

export const getBwPanning = (
    x: number,
    y: number,
    mapCoords: Vector3,
    left: number,
    width: number
) => {
    let pan = 0;

    if ( x !== 0 && y !== 0 ) {
        let pan_x = mapCoords.x - ( left + width / 2 );
        const isLeft = pan_x < 0;
        if ( isLeft ) pan_x = -pan_x;
        if ( pan_x <= 2 ) pan = 0;
        else if ( pan_x <= 5 ) pan = 52;
        else if ( pan_x <= 10 ) pan = 127;
        else if ( pan_x <= 20 ) pan = 191;
        else if ( pan_x <= 40 ) pan = 230;
        else pan = 255;
        if ( isLeft ) pan = -pan;
    }

    return pan / 255;
};

const SoundPlayMaxDistance = 100;
const _soundCoords = new Vector3();
let _soundDat: SoundDAT;

export function buildSound(
    elapsed: number,
    x: number,
    y: number,
    typeId: number,
    unitTypeId: number,
    pxToWorld: PxToWorld,
    audio: GameViewPort["audioType"],
    projectedView: ProjectedCameraView,
    soundChannels: SoundChannels
) {
    const assets = gameStore().assets!;
    _soundDat = assets.bwDat.sounds[typeId];
    pxToWorld.xyz( x, y, _soundCoords );

    if ( audio === "3d" ) {
        if (
            _soundDat.minVolume ||
            mixer.position.distanceTo( _soundCoords ) < SoundPlayMaxDistance
        ) {
            soundChannels.play(
                elapsed,
                typeId,
                unitTypeId,
                _soundDat,
                _soundCoords,
                null,
                null
            );
        }
    } else if ( audio === "stereo" ) {
        const volume = getBwVolume(
            _soundDat,
            _soundCoords,
            x,
            y,
            projectedView.left,
            projectedView.top,
            projectedView.right,
            projectedView.bottom
        );
        if ( volume > MinPlayVolume ) {
            const pan = getBwPanning(
                x,
                y,
                _soundCoords,
                projectedView.left,
                projectedView.width
            );
            soundChannels.play(
                elapsed,
                typeId,
                unitTypeId,
                _soundDat,
                _soundCoords,
                volume,
                pan
            );
        }
    }
}