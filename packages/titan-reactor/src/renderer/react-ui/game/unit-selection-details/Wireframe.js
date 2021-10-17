import React, { useRef, useEffect } from "react";
import { range } from "ramda";
import { shuffle } from "lodash";
import useRealtimeStore from "../../../stores/realtime/unitSelectionStore";
import useGameStore from "../../../stores/gameStore";
import shallow from "zustand/shallow";
import redXIcon from "../../css/redXIcon.png";

let stepLayers = range(0, 4).map(() => 0);

const findRandomIndex = (list, pred) => {
  const eligible = shuffle(range(0, list.length));

  while (eligible.length) {
    const idx = eligible.shift();
    if (pred(list[idx])) {
      return idx;
    }
  }
};

const steps = range(0, 8).map(() => {
  const idx = findRandomIndex(stepLayers, (layer) => layer < 120);
  stepLayers[idx] = stepLayers[idx] + 60;
  return [...stepLayers];
});

const zergSteps = range(0, 6).map((step) => {
  const layers = range(0, 4);

  //best guesses for zerg layer colors
  switch (step) {
    case 0:
      layers[0] = "hue-rotate(267deg) brightness(177%) saturate(0.4)";
      layers[1] = "hue-rotate(225deg) brightness(80%) saturate(0.6)";
      layers[2] = "hue-rotate(242deg) brightness(50%) saturate(0.6)";
      layers[3] = "hue-rotate(235deg) brightness(60%) saturate(0.6)";
      break;
    case 1:
      layers[0] = "hue-rotate(35deg) brightness(200%) saturate(0.8)";
      layers[1] = "hue-rotate(0deg) brightness(77%) saturate(0.7)";
      layers[2] = "hue-rotate(0deg) brightness(68%) saturate(0.6)";
      layers[3] = "hue-rotate(225deg) brightness(81%) saturate(0.7)";
      break;
    case 2:
      layers[0] = "hue-rotate(33deg) brightness(265%) saturate(0.8)";
      layers[1] = "hue-rotate(1deg) brightness(73%) saturate(0.9)";
      layers[2] = "hue-rotate(18deg) brightness(122%) saturate(0.7)";
      layers[3] = "hue-rotate(280deg) brightness(134%) saturate(0.3)";
      break;
    case 3:
      layers[0] = "hue-rotate(88deg) brightness(266%) saturate(0.6)";
      layers[1] = "hue-rotate(35deg) brightness(454%) saturate(0.9)";
      layers[2] = "hue-rotate(45deg) brightness(155%) saturate(0.5)";
      layers[3] = "hue-rotate(289deg) brightness(100%) saturate(0.3)";
      break;
    case 4:
      layers[0] = "hue-rotate(99deg) brightness(224%) saturate(0.8)";
      layers[1] = "hue-rotate(43deg) brightness(337%) saturate(0.9)";
      layers[2] = "hue-rotate(42deg) brightness(143%) saturate(0.6)";
      layers[3] = "hue-rotate(8deg) brightness(80%) saturate(0.7)";
      break;
    case 5: //
      layers[0] = "hue-rotate(45deg) brightness(437%) saturate(1)";
      layers[1] = "hue-rotate(113deg) brightness(262%) saturate(0.8)";
      layers[2] = "hue-rotate(37deg) brightness(341%) saturate(0.8)";
      layers[3] = "hue-rotate(0deg) brightness(90%) saturate(0.7)";
  }

  return layers;
});

const getFilter = (unit, step, layerIndex) => {
  let effectiveStep = steps[step][layerIndex];

  if (
    unit.unitType.isZerg ||
    (unit.unitType.isResourceContainer && !unit.owner)
  ) {
    return zergSteps[step][layerIndex];
  } else {
    let degree;
    let brightness;
    if (unit.unitType.isTerran) {
      brightness = "brightness(400%)";
      degree = effectiveStep;
      //protoss yellow needs some different settings
    } else if (effectiveStep === 60) {
      brightness = "brightness(425%)";
      degree = 70;
      //protoss brightness lower than terran
    } else {
      brightness = "brightness(250%)";
      degree = effectiveStep;
    }

    return `hue-rotate(${degree}deg) ${effectiveStep > 0 ? brightness : ""}`;
  }
};

const calcStepZerg = (unit) =>
  unit.unitType.isResourceContainer
    ? 5
    : Math.floor((unit.hp / unit.unitType.hp) * 5);

const calcStepTerranProtoss = (unit) =>
  unit.hp === unit.unitType.hp
    ? 7
    : Math.floor(Math.min(1, unit.hp / (unit.unitType.hp * 0.77)) * 6);

const calcStep = (unit) =>
  unit.unitType.isZerg || (unit.unitType.isResourceContainer && !unit.owner)
    ? calcStepZerg(unit)
    : calcStepTerranProtoss(unit);

const calcTypeId = (unit) =>
  unit.unitType.isZerg &&
  unit.unitType.isBuilding &&
  unit.queue &&
  unit.queue.units.length
    ? unit.queue.units[0]
    : unit.typeId;

const selector = (state) => {
  if (!state.selectedUnits[0]) return 0;
  return {
    unit: state.selectedUnits[0],
    typeId: calcTypeId(state.selectedUnits[0]),
    step: calcStep(state.selectedUnits[0]),
    canSelect: state.selectedUnits[0].canSelect,
  };
};

const refLayer = (ref) => ({ ref, filter: "", backgroundImage: "", step: 0 });

const Wireframe = ({ unit, size = "lg", className = "" }) => {
  const wireframeIcons = useGameStore(
    (state) => state.assets.icons.wireframeIcons
  );
  const layerRefs = range(0, 4).map(() => refLayer(useRef()));
  const xRef = useRef();

  const setDom = ({ unit, typeId, step }, transition) => {
    if (layerRefs.some(({ ref: { current } }) => !current) || !xRef.current)
      return;

    const trans =
      transition ||
      (unit.unitType.isBuilding ? "filter 4s linear" : "filter 1s linear");

    for (let i = 0; i < 4; i++) {
      const filter = getFilter(unit, step, i);

      layerRefs[i].ref.current.style.transition = trans;

      if (layerRefs[i].filter !== filter) {
        layerRefs[i].ref.current.style.filter = filter;
        layerRefs[i].filter = filter;
      }

      const backgroundImage = `url(${wireframeIcons.wireframes[typeId]}`;
      if (layerRefs[i].backgroundImage !== backgroundImage) {
        layerRefs[i].ref.current.style.backgroundImage = backgroundImage;
        layerRefs[i].backgroundImage = backgroundImage;
      }
    }
  };

  useEffect(() => {
    setDom(selector({ selectedUnits: [unit] }), "filter 0s linear");

    return useRealtimeStore.subscribe(
      (data) => {
        setDom(data);
      },
      selector,
      shallow
    );
  }, [unit]);

  const style =
    size === "lg"
      ? { width: "128px", height: "128px" }
      : { width: "64px", height: "64px" };

  const layerStyle = {
    width: "128px",
    height: "128px",
    position: "absolute",
  };
  if (size === "md") {
    layerStyle.transform = "translate(-32px, -32px) scale(0.5)";
  }
  const shieldStyle = { filter: "hue-rotate(200deg)" };

  return (
    <div className={`relative ${className}`} style={style}>
      <img
        ref={xRef}
        src={redXIcon}
        className="absolute left-0 top-0 right-0 bottom-0 z-30 hidden"
      />
      {layerRefs.map(({ ref }, i) => {
        return (
          <div
            key={i}
            ref={ref}
            style={{
              ...layerStyle,
              backgroundPositionX: `-${i * 128}px`,
            }}
          ></div>
        );
      })}

      {unit.shields > 0 && (
        <>
          <div
            style={{
              ...layerStyle,
              ...shieldStyle,
              backgroundPositionX: "-512px",
            }}
          ></div>
          {unit.shields === unit.unitType.shields && (
            <div
              style={{
                ...layerStyle,
                ...shieldStyle,
                backgroundPositionX: "-640px",
              }}
            ></div>
          )}
        </>
      )}
    </div>
  );
};
export default Wireframe;
