import React from "react";
import Visible from "../../utils/visible";

export default ({ players, visible = true }) => {
  return (
    <Visible visible={visible}>
      <section>
        {players.map((player) => {
          return (
            <div key={player.name}>
              <span className="name">{player.name}</span>{" "}
              <span className="minerals">{player.minerals}</span>{" "}
              <span className="gas">{player.gas}</span>{" "}
              <span className="apm">{player.apm}</span>
            </div>
          );
        })}
      </section>
    </Visible>
  );
};
