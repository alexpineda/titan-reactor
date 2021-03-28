import { easePolyOut } from "d3-ease";
import React, { useEffect, useRef } from "react";
import useProductionStore from "../../../stores/realtime/productionStore";
import useGameStore from "../../../stores/gameStore";

const poly = easePolyOut.exponent(0.5);

const iconsSelector = (state) => state.game.cmdIcons;
// check keys since shallow will verify same object
const comparitor = (a, b) => {
  if (!a || !b) return false;
  var keysA = Object.keys(a);

  if (keysA.length !== Object.keys(b).length) {
    return false;
  }

  for (var i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(a, keysA[i]) ||
      !Object.is(a[keysA[i]], b[keysA[i]])
    ) {
      return false;
    }
  }
  return true;
};

export default ({ type, index, color, playerId }) => {
  const cmdIcons = useGameStore(iconsSelector);

  const wrapperRef = useRef();
  const imgRef = useRef();
  const progressRef = useRef();
  const countRef = useRef();

  const unitBelongsToPlayer = (u) => u.ownerId === playerId;

  const selector = (state) => {
    if (type === "units") {
      return state[type].filter(unitBelongsToPlayer).slice(0, 10)[index];
    } else {
      return state[type][playerId][index];
    }
  };

  const setDom = (item) => {
    if (
      !wrapperRef.current ||
      !imgRef.current ||
      !countRef.current ||
      !progressRef.current
    )
      return;

    if (item) {
      wrapperRef.current.style.display = "block";

      if (item.count > 1) {
        countRef.current.textContent = item.count;
        countRef.current.style.display = "block";
      } else {
        countRef.current.style.display = "hidden";
      }

      imgRef.current.src = cmdIcons[item.icon];
      const pct = poly(1 - item.remainingBuildTime / item.buildTime) * 100;
      progressRef.current.style.backgroundImage = `linear-gradient(90deg, ${color}ee 0%, ${color}aa ${pct}%, rgba(0,0,0,0.5) ${pct}%)`;

      if (item.remainingBuildTime === 0 && (item.isTech || item.isUpgrade)) {
        imgRef.current.style.outline = `2px groove ${color}aa`;
        // using a property as state to determine whether to add glow (only once)
        if (Date.now() - item.timeCompleted < 4000) {
          imgRef.current.style.animation = `glow-${item.owner} 0.4s 10 alternate`;
        } else {
          imgRef.current.style.animation = "";
        }
      }
    } else {
      wrapperRef.current.style.display = "none";
    }
  };

  useEffect(() => {
    setDom(selector(useProductionStore.getState()));

    return useProductionStore.subscribe(
      (item) => {
        setDom(item);
      },
      selector,
      comparitor
    );
  }, [type, index, color, playerId]);

  return (
    <div ref={wrapperRef} className="w-10 h-10 mr-1 relative">
      <img
        ref={imgRef}
        style={{
          filter: "grayscale(1) brightness(6)",
        }}
      />
      <div
        ref={progressRef}
        className="absolute left-0 bottom-0 right-0 h-1"
      ></div>
      <p
        ref={countRef}
        className="text-white absolute text-xs px-1 rounded bottom-0 right-0 z-20"
        style={{
          opacity: "0.9",
          fontFamily: "conthrax",
          fontWeight: "900",
          textShadow: "-2px -2px 2px black",
        }}
      ></p>
    </div>
  );
};
