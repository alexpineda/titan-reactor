import React, { useEffect, useRef } from "react";

import range from "../../../../common/utils/range";
import { useUnitSelectionStore, UnitSelectionStore } from "../../../stores";
import { showKillsExtraUnits } from "./kills";
import SmallUnitItem from "./small-unit-item";
import { UnitInstance } from "../../../game";

interface Props {
  units: UnitInstance[];
}

const canSelect = (u: UnitInstance) => u.canSelect;
const hasNonAttackers = (u: UnitInstance) =>
  !u.dat.isSpellcaster &&
  u.dat.groundWeapon === 130 &&
  u.dat.airWeapon === 130 &&
  !showKillsExtraUnits.includes(u.typeId);
const sumKills = (tkills: number, { kills }: Pick<UnitInstance, "kills">) =>
  tkills + kills;

const selector = (state: Pick<UnitSelectionStore, "selectedUnits">) => {
  if (state.selectedUnits.some(hasNonAttackers)) {
    return "";
  } else {
    return `Kills: ${state.selectedUnits
      .filter(canSelect)
      .reduce(sumKills, 0)}`;
  }
};

const SmallUnitDetail = ({ units }: Props) => {
  const killsRef = useRef<HTMLParagraphElement>(null);

  const setDom = (killsText: string) => {
    if (!killsRef.current) return;
    killsRef.current.textContent = killsText;
  };

  useEffect(() => {
    setDom(selector({ selectedUnits: units }));

    return useUnitSelectionStore.subscribe((killsText) => {
      setDom(killsText);
    }, selector);
  }, [units]);

  return (
    <div className="flex pl-1 pt-1 flex-1" style={{ minHeight: "2.75rem" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 2.5rem)",
          gridTemplateRows: "repeat(2, 2.5rem)",
          gridGap: ".25rem",
        }}
      >
        {range(0, 12).map((i) => (
          <SmallUnitItem key={i} index={i} unit={units[i]} showLoaded={false} />
        ))}
      </div>

      <div
        ref={killsRef}
        className="text-gray-300 p-1 self-center  w-full text-center"
      ></div>
    </div>
  );
};
export default SmallUnitDetail;
