import { useSettingsStore, SettingsStore } from "../stores";
import FpsDisplay from "./fps-display";

const settingsSelector = (state: SettingsStore) => state.data.graphics.showFps;

const GameView = () => {
  const showFps = useSettingsStore(settingsSelector);

  return <>{showFps && <FpsDisplay />}</>;
};

export default GameView;
