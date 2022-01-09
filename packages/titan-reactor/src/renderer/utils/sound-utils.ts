import { SoundDAT, MapCoords } from "../../common/types";
import { SoundStruct } from "../integration/data-transfer";

export const MinPlayVolume = 10;

// Calculate the volume using the openbw algorithm
export const getBwVolume = ( dat: SoundDAT, mapCoords: MapCoords, sound: SoundStruct, left: number, top: number, right: number, bottom: number) => {
    let volume = dat.minVolume || 0;

    if (sound.x !== 0 && sound.y !== 0) {
        let distance = 0;
        if (mapCoords.x < left) distance += left - mapCoords.x;
        else if (mapCoords.x > right) distance += mapCoords.x - right;
        if (mapCoords.z < top) distance += top - mapCoords.z;
        else if (mapCoords.z > bottom) distance += mapCoords.z - bottom;

        const distance_volume = 99 - (99 * distance) / 16;

        if (distance_volume > volume) volume = distance_volume;
    }

    return volume;
}