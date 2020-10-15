import React, { useState } from "react";
import { RollingNumber } from "./RollingNumber";

const PlayerResources = ({
  index,
  name,
  minerals,
  gas,
  workers,
  supply,
  supplyMax,
  race,
  color,
  apm,
  textSize,
  hideVision,
  onTogglePlayerVision,
}) => {
  const [showWorkerCount, setShowWorkerCount] = useState(true);
  const toggleWorkerCount = () => setShowWorkerCount(!showWorkerCount);

  let workerIcon = "https://i.imgur.com/guJEX8T.png";
  let supplyIcon = "https://i.imgur.com/ThFP93l.png";
  switch (race) {
    case "terran":
    case "zerg":
    case "protoss":
      break;
  }

  return (
    <tr>
      <td
        className="pr-2"
        data-tip={`Toggle Fog of War`}
        onClick={() => onTogglePlayerVision && onTogglePlayerVision(index)}
      >
        <span
          className={`text-${textSize} cursor-pointer`}
          style={{ color: color.hex, opacity: hideVision ? 0.8 : 1 }}
        >
          {name}
        </span>
      </td>
      <td className="pr-2" onClick={toggleWorkerCount}>
        <img src="https://i.imgur.com/ram4CBj.png" className="inline w-4" />
        <span className={`text-gray-400 text-${textSize}`}>
          <RollingNumber number={minerals} />
        </span>
      </td>
      <td className="pr-2" onClick={toggleWorkerCount}>
        <img src="https://i.imgur.com/NI5ynEw.png" className="inline w-4" />
        <span className={`text-gray-400 text-${textSize}`}>
          <RollingNumber number={gas} />
        </span>
      </td>
      {showWorkerCount && (
        <td className="pr-2" onClick={toggleWorkerCount}>
          <img src={workerIcon} className="inline w-4" />
          <span className={`text-gray-400 text-${textSize}`}>{workers}</span>
        </td>
      )}
      <td className="pr-2 pointer-events-none">
        <img src={supplyIcon} className="inline w-4" />
        <span className={`text-gray-400 text-${textSize}`}>
          {Math.floor(supply / 2)} / {Math.floor(supplyMax / 2)}
        </span>
      </td>
      <td className="pr-2 pointer-events-none">
        <img src="https://i.imgur.com/AFgJh3V.png" className="inline w-4" />
        <span className={`text-gray-400 text-${textSize}`}>
          <RollingNumber number={apm} />
        </span>
      </td>
    </tr>
  );
};
export default ({
  players,
  textSize,
  onTogglePlayerVision,
  onTogglePlayerPov,
}) => {
  const smallIconFontSize = textSize === "xs" ? "0.75rem" : "0.9rem";

  return (
    <div className="flex absolute top-0 right-0 select-none">
      <div className="resources-parent">
        <div
          className="rounded mx-1 my-1 py-1 px-2 flex"
          style={{ backgroundColor: "#1a202c99" }}
        >
          <table className="table-auto flex-1 ">
            <tbody>
              {players.map((player, i) => (
                <PlayerResources
                  key={player.name}
                  index={i}
                  textSize={textSize}
                  {...player}
                  onTogglePlayerVision={onTogglePlayerVision}
                />
              ))}
            </tbody>
          </table>

          <aside className="flex flex-col justify-around ml-2">
            <i
              onClick={() => onTogglePlayerPov && onTogglePlayerPov(0)}
              className={`material-icons rounded cursor-pointer hover:text-yellow-500 ${
                players[0].showPov ? "text-yellow-700" : "text-gray-700 "
              }`}
              style={{ fontSize: smallIconFontSize }}
              data-tip={`${players[0].name} First Person`}
            >
              slideshow
            </i>
            <i
              onClick={() => onTogglePlayerPov && onTogglePlayerPov(1)}
              className={`material-icons hover:text-yellow-500 rounded cursor-pointer ${
                players[1].showPov ? "text-yellow-700" : "text-gray-700 "
              }`}
              style={{ fontSize: smallIconFontSize }}
              data-tip={`${players[1].name} First Person`}
            >
              slideshow
            </i>
          </aside>
          {/* <aside className="flex flex-col justify-between ml-2 b">
            <i
              onClick={() => onTogglePlayerActions && onTogglePlayerActions(0)}
              className={`material-icons hover:text-yellow-500 rounded cursor-pointer ${
                players[0].showActions ? "text-yellow-700" : "text-gray-700 "
              }`}
              style={{ fontSize: smallIconFontSize }}
              title="resources"
            >
              room
            </i>

            <i
              onClick={() => onTogglePlayerActions && onTogglePlayerActions(1)}
              className={`material-icons hover:text-yellow-500 rounded cursor-pointer ${
                players[1].showActions ? "text-yellow-700" : "text-gray-700 "
              }`}
              style={{ fontSize: smallIconFontSize }}
              title="resources"
            >
              room
            </i>
          </aside> */}
        </div>
      </div>
    </div>
  );
};
