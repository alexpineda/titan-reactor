import useRealtimeStore from "../../../stores/realtime/unitSelectionStore";
import React, { useRef, useEffect } from "react";

const shieldsSelector = (state) => {
  if (!state.selectedUnits[0]) return 0;
  return state.selectedUnits[0].shields;
};

const Shields = ({ unit }) => {
  const shieldsRef = useRef();

  const setDom = (shields) => {
    if (!shieldsRef.current) return;
    shieldsRef.current.textContent = `${shields}/${unit.unitType.shields}`;
  };

  useEffect(() => {
    setDom(unit.shields);

    return useRealtimeStore.subscribe((shields) => {
      setDom(shields);
    }, shieldsSelector);
  }, [unit]);

  return <p ref={shieldsRef} className="text-gray-400"></p>;
};
export default Shields;
