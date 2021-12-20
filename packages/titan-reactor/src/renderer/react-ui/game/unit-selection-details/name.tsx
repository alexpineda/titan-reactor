import { AssetsMissingError } from "../../../../common/errors";
import React, { useEffect, useRef } from "react";
import { UnitInstance } from "../../../game";

import {
  useGameStore,
  useUnitSelectionStore,
  UnitSelectionStore,
} from "../../../stores";

interface Props {
  unit: UnitInstance;
  className?: string;
}
const transformName = (name: string) => name.split(" ").slice(1).join(" ");

const Name = ({ unit, className = "" }: Props) => {
  const bwDat = useGameStore((state) => state?.assets?.bwDat);
  if (!bwDat) {
    throw new AssetsMissingError("bwDat");
  }
  const nameRef = useRef();

  const getZergBuildingType = (unit: UnitInstance) => {
    const queuedZergType =
      unit.dat.isZerg && unit.queue && unit.queue.units.length
        ? bwDat.units[unit.queue.units[0]]
        : null;
    const queuedBuildingZergType =
      queuedZergType && unit.dat.isBuilding ? queuedZergType : null;
    return queuedBuildingZergType || null;
  };

  const selector = (state: UnitSelectionStore) => {
    if (!state.selectedUnits[0]) return "";

    const zergBuildingType = getZergBuildingType(state.selectedUnits[0]);
    const name = zergBuildingType
      ? zergBuildingType.name
      : state.selectedUnits[0].dat.name;
    if (!state.selectedUnits[0].owner) {
      return name;
    } else {
      // remove race prefix
      return transformName(name);
    }
  };

  const setDom = (name: string) => {
    if (!nameRef.current) return;
    nameRef.current.textContent = name;
  };

  useEffect(() => {
    setDom(selector({ selectedUnits: [unit] }));

    return useUnitSelectionStore.subscribe((name) => {
      setDom(name);
    }, selector);
  }, [unit]);

  return <p ref={nameRef} className={`text-white uppercase ${className}`}></p>;
};
export default Name;
