import React from "react";
import Health from "./Health";
import Shields from "./Shields";
import Resource from "./Resource";
import Energy from "./Energy";
import Kills from "./Kills";
import Wireframe from "./Wireframe";
import Progress from "./Progress";
import Name from "./Name";
import Queue from "./Queue";

export default ({ unit }) => {
  const showHp = !(unit.unitType.isResourceContainer && !unit.owner);
  const showShields = unit.unitType.shieldsEnabled;
  const showEnergy = unit.unitType.isSpellcaster;
  const showKills = !(
    !unit.unitType.isSpellcaster &&
    unit.unitType.groundWeapon === 130 &&
    unit.unitType.airWeapon === 130
  );
  const showResourceAmount = unit.resourceAmount !== null;

  return (
    <div className="flex relative">
      <div className="flex flex-col items-center" style={{ width: "190px" }}>
        <Name unit={unit} />
        <Wireframe unit={unit} />
        <Progress unit={unit} />
        <Queue unit={unit} />
      </div>
      <div className="flex-1 pr-1 text-lg text-center pt-6">
        {showHp && <Health unit={unit} />}
        {showShields && <Shields unit={unit} />}
        {showResourceAmount && <Resource unit={unit} />}
        {showEnergy && <Energy unit={unit} />}
        {showKills && <Kills unit={unit} />}
      </div>
    </div>
  );
};
