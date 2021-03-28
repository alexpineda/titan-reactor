import React from "react";
import shallow from "zustand/shallow";
import WrappedElement from "./WrappedElement";
import Minimap from "./game/Minimap";
import StandAloneProductionBar from "./game/production/StandAloneProductionBar";
import Chat from "./game/Chat";
import ResourcesBar from "./game/resources/ResourcesBar";
import UnitSelection from "./game/UnitSelection";
import ReplayPosition from "./game/ReplayPosition";
import ProducerBar from "./game/ProducerBar";
import Menu from "./game/Menu";
import Visible from "./components/visible";
import { ProducerWindowPosition } from "common/settings";

import useGameStore from "../stores/gameStore";
import useSettingsStore from "../stores/settingsStore";
import useHudStore from "../stores/hudStore";

const Game = () => {
  const { dimensions, canvas } = useGameStore(
    (state) => ({
      dimensions: state.dimensions,
      canvas: state.game.surface.canvas,
    }),
    shallow
  );

  const selectedUnits = useGameStore((state) => state.selectedUnits, shallow);

  const {
    showFps,
    showInGameMenu,
    toggleInGameMenu,
    showReplayControls,
    showUnitSelection,
  } = useHudStore(
    (state) => ({
      showFps: state.show.fps,
      showInGameMenu: state.show.inGameMenu,
      toggleInGameMenu: state.toggleInGameMenu,
      showReplayControls: state.show.replayControls,
      showUnitSelection: state.show.unitSelection,
    }),
    shallow
  );

  const {
    esportsHud,
    producerWindowPosition,
    alwaysHideReplayControls,
    embedProduction,
  } = useSettingsStore(
    (state) => ({
      esportsHud: state.data.esportsHud,
      producerWindowPosition: state.data.producerWindowPosition,
      alwaysHideReplayControls: state.data.alwaysHideReplayControls,
      embedProduction: state.data.embedProduction,
    }),
    shallow
  );

  return (
    <>
      <WrappedElement
        style={{
          position: "absolute",
          zIndex: "-10",
          left: `${dimensions.left}px`,
          top: `${dimensions.top}px`,
        }}
        domElement={canvas}
      />
      <Chat />
      {producerWindowPosition != ProducerWindowPosition.None && <ProducerBar />}

      {showInGameMenu && (
        <Menu onClose={() => toggleInGameMenu()} onBackToMainMenu={() => {}} />
      )}
      {(!esportsHud || !embedProduction) && <StandAloneProductionBar />}
      <Visible visible={!esportsHud}>
        <ResourcesBar
          className="flex absolute pointer-events-none"
          style={{
            top: `${dimensions.top}px`,
            right: `${dimensions.right}px`,
          }}
        />
      </Visible>

      <div
        className="w-full flex absolute pointer-events-none justify-between"
        style={{
          bottom: `${dimensions.bottom}px`,
          width: `${dimensions.width}px`,
          left: `${dimensions.left}px`,
        }}
      >
        <Minimap className="pointer-events-auto" />

        <Visible visible={esportsHud}>
          <ResourcesBar
            className="flex-1 self-end pointer-events-none"
            textSize="lg"
            fitToContent
          />
        </Visible>

        <Visible
          visible={
            showUnitSelection &&
            (selectedUnits.length || alwaysHideReplayControls)
          }
        >
          <UnitSelection className="pointer-events-none" />
        </Visible>
        <Visible
          visible={
            showReplayControls &&
            !alwaysHideReplayControls &&
            selectedUnits.length === 0
          }
        >
          <ReplayPosition className="pointer-events-auto" />
        </Visible>
      </div>
    </>
  );
};

export default Game;
