import { StdVector } from "@buffer-view";
import { HOOK_ON_TECH_COMPLETED, HOOK_ON_UPGRADE_COMPLETED } from "@plugins/hooks";
import { BwDAT, OpenBWAPI, TechDataDAT, UpgradeDAT } from "common/types";
import range from "common/utils/range";
import * as plugins from "@plugins";

export const completedUpgrades = range(0, 8).map(() => [] as number[]);
const completedResearch = range(0, 8).map(() => [] as number[]);
const completedUpgradesReset = range(0, 8).map(() => [] as number[][]);
const completedResearchReset = range(0, 8).map(() => [] as number[][]);

let productionData: StdVector;

export const updateCompletedUpgrades = (openBW: OpenBWAPI, bwDat: BwDAT, currentBwFrame: number) => {
    if (!productionData) {
        productionData = new StdVector(openBW.HEAP32, openBW._get_buffer(9) >> 2);
    }
    let addr32 = openBW._get_buffer(9) >> 2;
    for (let player = 0; player < 8; player++) {
        productionData.addr32 = addr32 + (player * 9) + 3;
        _updateCompleted(completedUpgrades[player], completedUpgradesReset[player], 3, bwDat.upgrades, HOOK_ON_UPGRADE_COMPLETED, currentBwFrame);
        productionData.addr32 += 3;
        _updateCompleted(completedResearch[player], completedResearchReset[player], 2, bwDat.tech, HOOK_ON_TECH_COMPLETED, currentBwFrame);
    }
}

const _updateCompleted = (arr: number[], arrReset: number[][], size: number, dat: UpgradeDAT[] | TechDataDAT[], hook: string, currentBwFrame: number) => {
    let j = 0;
    let typeId = 0;
    let level = 0;
    for (const val of productionData) {
        if (j === 0) {
            typeId = val;
        } else if (j === size - 1) {
            if (val === 0 && !arr.includes(typeId)) {
                arr.push(typeId);
                arrReset.push([typeId, currentBwFrame]);
                plugins.callHook(hook, [typeId, level, dat[typeId]]);
            }
        } else if (j === 1) {
            level = val;
        }
        j++;
        if (j === size) {
            j = 0;
        }
    }
}

export const resetCompletedUpgrades = (frame: number) => {
    for (let player = 0; player < 8; player++) {
        completedResearchReset[player] = completedResearchReset[player].filter(([_, techFrame]) => techFrame <= frame);
        completedResearch[player] = completedResearch.map(([techId]) => techId);
        completedUpgradesReset[player] = completedUpgradesReset[player].filter(([_, techFrame]) => techFrame <= frame);
        completedUpgrades[player] = completedUpgrades.map(([techId]) => techId);
    }

}

