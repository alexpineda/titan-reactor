import React, { useRef } from "react";

import {
  techTypesByUnitType,
  upgrades as upgradeTypes,
  upgradesByUnitType,
} from "../../../../common/bwdat/enums";
import { useGameStore, GameStore, useProductionStore } from "../../../stores";
import { Unit } from "../../../core";
import { AssetsMissingError } from "../../../../common/errors";
import { TechDataDAT, UpgradeDAT } from "../../../../common/types";

interface Props {
  unit: Unit;
}
const iconSelector = (state: GameStore) => state?.assets?.cmdIcons;
const bwDatSelector = (state: GameStore) => state?.assets?.bwDat;

type UpgradeDATWithZeroRemaining = UpgradeDAT & {
  remainingBuildTime: number;
};
type TechDataDATWithZeroRemaining = TechDataDAT & {
  remainingBuildTime: number;
};
const Upgrades = ({ unit }: Props) => {
  const itemsRef = useRef<HTMLDivElement>(null);
  const cmdIcons = useGameStore(iconSelector);
  const bwDat = useGameStore(bwDatSelector);
  if (!bwDat || !cmdIcons) {
    throw new AssetsMissingError();
  }

  const validTechs = techTypesByUnitType[unit.typeId] || [];
  const validUpgrades =
    upgradesByUnitType[unit.typeId] ||
    (unit.dat.isProtoss && unit.dat.isBuilding
      ? [upgradeTypes.protossPlasmaShields]
      : []);

  //todo realtime updates
  const { tech, upgrades } = useProductionStore.getState();
  // useEffect(() => ReactTooltip.rebuild(), [unit]);

  if (!validTechs.length && !validUpgrades.length) return null;
  if (!unit.owner) return null;

  const completedTech = [
    ...tech[unit.owner.id].filter(
      (t) => t.remainingBuildTime === 0 && validTechs.includes(t.typeId)
    ),
    ...upgrades[unit.owner.id].filter(
      (t) => t.remainingBuildTime === 0 && validUpgrades.includes(t.typeId)
    ),
  ];

  // re-add incomplete items
  const items = [
    ...validUpgrades
      .map(
        (upgrType) =>
          completedTech.find(
            (item) => item.isUpgrade && item.typeId === upgrType
          ) ||
          ({
            ...bwDat.upgrades[upgrType],
            remainingBuildTime: 0,
          } as UpgradeDATWithZeroRemaining)
      )
      .sort((a, b) => a.remainingBuildTime - b.remainingBuildTime),
    ...validTechs
      .map(
        (techType) =>
          completedTech.find(
            (item) => item.isTech && item.typeId === techType
          ) ||
          ({
            ...bwDat.tech[techType],
            remainingBuildTime: 0,
          } as TechDataDATWithZeroRemaining)
      )
      .sort((a, b) => a.remainingBuildTime - b.remainingBuildTime),
  ];

  //@todo add weapons details to appropriate upgrades

  return (
    <div ref={itemsRef} className="flex pl-3 pointer-events-auto">
      {items.map((item) => {
        const filter =
          item.remainingBuildTime === 0
            ? "hue-rotate(67deg) brightness(5)"
            : "grayscale(1) brightness(5)";

        return (
          <div key={item.icon} className="relative mt-2 mr-1">
            {item.level > 1 && (
              <p className="text-xs text-gray-500 right-0 bottom-0">
                {item.level}
              </p>
            )}
            <img
              src={cmdIcons[item.icon]}
              className="w-5 h-5 pointer-events-auto"
              style={{ filter }}
              data-tip={`${item.name || item.type.name} ${
                item.level > 1 ? `Level: ${item.level}` : ""
              }`}
              data-for="upgrades"
            />
          </div>
        );
      })}
    </div>
  );
};
export default Upgrades;
