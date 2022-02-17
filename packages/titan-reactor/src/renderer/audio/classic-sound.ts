import { SoundStruct } from "../integration/structs";

export interface ClassicSound extends SoundStruct {
    extra: {
        volume: number;
        pan: number;
    }
}