import { SoundStruct } from "../../common/types/structs";

export interface ClassicSound extends SoundStruct {
    extra: {
        volume: number;
        pan: number;
    }
}