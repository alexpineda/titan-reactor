import React, { useEffect, useRef } from "react";
import Health from "./health";
import Shields from "./shields";
import Resource from "./resource";
import Energy from "./energy";
import Kills, { showKillsExtraUnits } from "./kills";
import Wireframe from "./Wireframe";
import Progress from "./progress";
import Name from "./name";
import Queue from "./queue";
import Loaded from "./loaded";
import { useUnitSelectionStore, UnitSelectionStore } from "../../../stores";
import Upgrades from "./upgrades";

import { Unit } from "../../../core";
interface Props {
  unit: Unit;
}

const selector = (state: Pick<UnitSelectionStore, "selectedUnits">) =>
  Boolean(state.selectedUnits[0] && state.selectedUnits[0].loaded);

const LargeUnitDetail = ({ unit }: Props) => {
  const showHp = !(unit.dat.isResourceContainer && !unit.owner);
  const showShields = unit.dat.shieldsEnabled;
  const showEnergy = unit.dat.isSpellcaster;
  const showKills =
    !(
      !unit.dat.isSpellcaster &&
      unit.dat.groundWeapon === 130 &&
      unit.dat.airWeapon === 130
    ) || showKillsExtraUnits.includes(unit.typeId);

  const showResourceAmount = unit.resourceAmount !== null;

  const loadedRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLElement>(null);

  const setDom = (hasLoaded: boolean) => {
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
      <div className="flex items-center pt-1 pl-3">
        <Name unit={unit} />
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
export default LargeUnitDetail;
