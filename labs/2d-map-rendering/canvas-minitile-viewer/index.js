import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import { PaletteViewer } from "./palette/PaletteViewer";
import { MinitilesViewer } from "./minitile/MinitilesViewer";
import { MegatilesViewer } from "./minitile/MegaTileViewer";

const App = () => {
  const [palette, setPalette] = useState([]);
  const [minitiles, setMinitiles] = useState(null);

  return (
    <div>
      <PaletteViewer colors={palette} setColors={setPalette} />
      {!!palette.length && (
        <div>
          <MinitilesViewer palette={palette} setMinitiles={setMinitiles} />
        </div>
      )}
      {!!minitiles && (
        <div>
          <MegatilesViewer minitiles={minitiles} />
        </div>
      )}
    </div>
  );
};

render(<App />, document.getElementById("app"));
