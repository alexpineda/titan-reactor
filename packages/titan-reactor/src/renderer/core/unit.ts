import { Player } from "../../common/types";
import { UnitStruct } from "../integration/structs";
import { Mesh, Object3D } from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";

export type Unit = UnitStruct & {
    extra: {
        player?: Player;
        recievingDamage: number;
        isComplete?: boolean;
        wasFlying?: boolean;
        isNowFlying?: boolean;
        timeOfDeath?: number;
        showOnMinimap?: boolean;
        canSelect?: boolean;
        warpingIn?: number;
        warpingLen?: number;
        selected?: boolean;
        highlight: Mesh;
    }
}