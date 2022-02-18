import { GameStore, useGameStore } from "../stores";

const selector = (state: GameStore) => state.fps;

const FpsDisplay = () => {
  const fps = useGameStore(selector);

  return (
    <div
      style={{
        color: "white",
        position: "absolute",
        zIndex: "10",
      }}
    >
      {fps}
    </div>
  );
};

export default FpsDisplay;
