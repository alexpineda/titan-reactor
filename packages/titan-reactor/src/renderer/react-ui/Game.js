import React from "react";
import WrappedElement from "./WrappedElement";
import Minimap from "./game/Minimap";
import Production from "./game/Production";
import ResourcesBar from "./game/resource-bar/ResourcesBar";
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
  const { dimensions, canvas, selectedUnits } = useGameStore((state) => ({
    dimensions: state.dimensions,
    canvas: state.game.surface.canvas,
    selectedUnits: state.game.selectedUnits,
  }));

  const {
    showFps,
    showInGameMenu,
    toggleInGameMenu,
    showReplayControls,
    showUnitSelection,
  } = useHudStore((state) => ({
    showFps: state.show.fps,
    showInGameMenu: state.show.inGameMenu,
    toggleInGameMenu: state.toggleInGameMenu,
    showReplayControls: state.show.replayControls,
    showUnitSelection: state.show.unitSelection,
  }));

  const {
    esportsHud,
    producerWindowPosition,
    alwaysHideReplayControls,
  } = useSettingsStore((state) => ({
    esportsHud: state.data.esportsHud,
    producerWindowPosition: state.data.producerWindowPosition,
    alwaysHideReplayControls: state.data.alwaysHideReplayControls,
  }));

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
      {producerWindowPosition != ProducerWindowPosition.None && <ProducerBar />}

      {showInGameMenu && (
        <Menu onClose={() => toggleInGameMenu()} onBackToMainMenu={() => {}} />
      )}
      {/* {showProduction && (
        <Production
          players={players}
          textSize={settings.textSize}
          gameDimensions={gameDimensions}
        />
      )} */}
      <Visible visible={!esportsHud}>
        <ResourcesBar
          className="flex absolute"
          style={{
            top: `${dimensions.top}px`,
            right: `${dimensions.right}px`,
          }}
        />
      </Visible>

      {/* {UnitDetails && (
        <p>Nan</p>
        // <UnitDetails onClose={onUnitDetails} gameDimensions={gameDimensions} />
      )} */}
      <div
        className="w-full flex absolute divide-x-4 divide-transparent px-2 pointer-events-none"
        style={{
          bottom: `${dimensions.bottom}px`,
          width: `${dimensions.width}px`,
          left: `${dimensions.left}px`,
        }}
      >
        <Minimap className="pointer-events-auto" />

        <Visible visible={esportsHud}>
          <ResourcesBar
            className="flex-1 self-end pointer-events-auto"
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
          <UnitSelection className="pointer-events-auto" />
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
