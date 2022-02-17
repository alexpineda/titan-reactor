import {
  GameStore,
  useGameStore,
  ScreenStore,
  useScreenStore,
} from "../stores";

const selector = (state: GameStore) => state.log;
const errorSelector = (state: ScreenStore) => state.error;
const LogDisplay = () => {
  const log = useGameStore(selector);
  const error = useScreenStore(errorSelector);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column-reverse",
      }}
    >
      {error && <div style={{ color: "red" }}>{error.message}</div>}
      {log.map((entry) => (
        <p style={{ color: entry[1] }}>{entry[0]}</p>
      ))}
    </div>
  );
};

export default LogDisplay;
