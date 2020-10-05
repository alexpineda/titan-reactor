import React from "react";

const PlayerResources = ({
  index,
  name,
  minerals,
  gas,
  workers,
  supply,
  race,
  apm,
  textSize,
  onTogglePlayerVision,
}) => {
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
        <span className={`text-red-500 text-${textSize} cursor-pointer`}>
          {name}
        </span>
      </td>
      <td className="pr-2 pointer-events-none">
        <img src="https://i.imgur.com/ram4CBj.png" className="inline w-4" />
        <span className={`text-gray-400 text-${textSize}`}>{minerals}</span>
      </td>
      <td className="pr-2 pointer-events-none">
        <img src="https://i.imgur.com/NI5ynEw.png" className="inline w-4" />
        <span className={`text-gray-400 text-${textSize}`}>{gas}</span>
      </td>
      <td className="pr-2 pointer-events-none">
        <img src={workerIcon} className="inline w-4" />
        <span className={`text-gray-400 text-${textSize}`}>{workers}</span>
      </td>
      <td className="pr-2 pointer-events-none">
        <img src={supplyIcon} className="inline w-4" />
        <span className={`text-gray-400 text-${textSize}`}>{supply}</span>
      </td>
      <td className="pr-2 pointer-events-none">
        <img src="https://i.imgur.com/AFgJh3V.png" className="inline w-4" />
        <span className={`text-gray-400 text-${textSize}`}>{apm}</span>
      </td>
    </tr>
  );
};
export default ({
  players,
  textSize,
  onTogglePlayerVision,
  onTogglePlayerFPV,
  onToggleDualFPV,
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

          <aside className="flex flex-col justify-between ml-2">
            <i
              onClick={() => onTogglePlayerFPV && onTogglePlayerFPV(0)}
              className="material-icons text-yellow-700 rounded cursor-pointer"
              style={{ fontSize: smallIconFontSize }}
              data-tip={`${players[0].name} First Person`}
            >
              slideshow
            </i>
            <i
              onClick={() => onToggleDualFPV && onToggleDualFPV(0)}
              className="material-icons text-yellow-700 rounded cursor-pointer transform rotate-90 mb-1"
              style={{ fontSize: smallIconFontSize }}
              data-tip={`Split First Person`}
            >
              call_merge
            </i>
            <i
              onClick={() => onTogglePlayerFPV && onTogglePlayerFPV(1)}
              className="material-icons text-yellow-700 rounded cursor-pointer"
              style={{ fontSize: smallIconFontSize }}
              data-tip={`${players[1].name} First Person`}
            >
              slideshow
            </i>
          </aside>
        </div>
      </div>
    </div>
  );
};
