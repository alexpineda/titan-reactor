import React, { useEffect, useRef } from "react";
import Health from "./Health";
import Shields from "./Shields";
import Resource from "./Resource";
import Energy from "./Energy";
import Kills, { showKillsExtraUnits } from "./Kills";
import Wireframe from "./Wireframe";
import Progress from "./Progress";
import Name from "./Name";
import Queue from "./Queue";
import Loaded from "./Loaded";
import useUnitSelectionStore from "../../../stores/realtime/unitSelectionStore";
import Upgrades from "./Upgrades";

const selector = (state) =>
  state.selectedUnits[0] && state.selectedUnits[0].loaded;

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

  const loadedRef = useRef();
  const progressRef = useRef();

  const setDom = (hasLoaded) => {
    if (!loadedRef.current || !progressRef.current) return;
    loadedRef.current.style.display = hasLoaded ? "flex" : "none";
    progressRef.current.style.display = hasLoaded ? "none" : "block";
  };

  useEffect(() => {
    setDom(selector({ selectedUnits: [unit] }));
    return useUnitSelectionStore.subscribe(
      (hasLoaded) => setDom(hasLoaded),
      selector
    );
  }, [unit]);

  return (
    <div className="flex flex-col relative w-full">
      <div className="flex">
        <Name unit={unit} className="pt-1 pl-3" />
        <Upgrades unit={unit} />
      </div>
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
          <Loaded unit={unit} ref={loadedRef} />
          <Queue unit={unit} />
          <Progress unit={unit} ref={progressRef} />
        </div>
      </div>
    </div>
  );
};
