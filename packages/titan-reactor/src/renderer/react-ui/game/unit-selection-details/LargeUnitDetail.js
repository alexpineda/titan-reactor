import React from "react";
import Health from "./Health";
import Shields from "./Shields";
import Resource from "./Resource";
import Energy from "./Energy";
import Kills, { showKillsExtraUnits } from "./Kills";
import Wireframe from "./Wireframe";
import Progress from "./Progress";
import Name from "./Name";
import Queue from "./Queue";

export default ({ unit }) => {
  const showHp = !(unit.unitType.isResourceContainer && !unit.owner);
  const showShields = unit.unitType.shieldsEnabled;
  const showEnergy = unit.unitType.isSpellcaster;
  const showKills =
    !(
      !unit.unitType.isSpellcaster &&
      unit.unitType.groundWeapon === 130 &&
      unit.unitType.airWeapon === 130
    ) || showKillsExtraUnits.includes(unit.typeId);

  const showResourceAmount = unit.resourceAmount !== null;

  return (
    <div className="flex flex-col relative w-full">
      <Name unit={unit} className="pt-1 pl-3" />
      <div className="flex">
        <div className="flex w-1/2 items-center justify-center">
          <Wireframe unit={unit} size="md" className="mx-3 my-4" />

          <div className="flex flex-col flex-1 ">
            {showHp && <Health unit={unit} />}
            {showShields && <Shields unit={unit} />}
            {showResourceAmount && <Resource unit={unit} />}
            {showEnergy && <Energy unit={unit} />}
            {showKills && <Kills unit={unit} />}
          </div>
        </div>
        <div className="flex flex-col">
          <Queue unit={unit} />
          <Progress unit={unit} />
        </div>
      </div>
    </div>
  );
};
