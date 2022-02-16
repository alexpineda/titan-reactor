import { Player, UnitDAT } from "../../common/types";
import { UnitStruct } from "../integration/structs";
import { Mesh, Object3D } from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";

export type Unit = UnitStruct & {
    extra: {
        player?: Player;
        recievingDamage: number;
        timeOfDeath?: number;
        warpingIn?: number;
        warpingLen?: number;
        selected?: boolean;
        highlight: Mesh;
        dat: UnitDAT
    }
}