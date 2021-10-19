import React, { useEffect, useRef } from "react";
import useProductionStore from "../../../stores/realtime/productionStore";
import useGameStore from "../../../stores/gameStore";
import {
  techTypesByUnitType,
  upgradesByUnitType,
} from "../../../../common/types/abilitiesMap";
import upgradeTypes from "../../../../common/types/upgrades";

const iconSelector = (state) => state.assets.icons.cmdIcons;
const bwDatSelector = (state) => state.assets.bwDat;

const Upgrades = ({ unit }) => {
  const itemsRef = useRef();
  const cmdIcons = useGameStore(iconSelector);
  const bwDat = useGameStore(bwDatSelector);

  const validTechs = techTypesByUnitType[unit.typeId] || [];
  const validUpgrades =
    upgradesByUnitType[unit.typeId] ||
    (unit.unitType.isProtoss && unit.unitType.isBuilding
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
          ) || bwDat.upgrades[upgrType]
      )
      .sort((a, b) => a.remainingBuildTime - b.remainingBuildTime),
    ...validTechs
      .map(
        (techType) =>
          completedTech.find(
            (item) => item.isTech && item.typeId === techType
          ) || bwDat.tech[techType]
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
              getcontent={() =>
                `${item.name || item.type.name} ${
                  item.level > 1 ? `Level ${item.level}` : ""
                }`
              }
              data-for="upgrades"
            />
          </div>
        );
      })}
    </div>
  );
};
export default Upgrades;
