import { useState } from "react";
import shallow from "zustand/shallow";
import { UnitsAndImages } from "./units-and-images";

import { Surface } from "@image";
import { Commands } from "./commands";
import { Animation } from "./animation";
import { Frames } from "./frames";
import { useIscriptStore } from "../stores";
import { Search } from "./app-frame/search";
import { EmptySection } from "./app-frame/empty-section";

if (module.hot) {
  module.hot.accept();
}

const App = ({ surface }: { surface: Surface }) => {
  const [search, setSearch] = useState("");

  const { blockFrameCount, selectedBlock } = useIscriptStore(
    (store) => ({
      blockFrameCount: store.blockFrameCount,
      selectedBlock: store.block,
    }),
    shallow
  );

  return (
    <div style={{ background: "white" }}>
      <Search search={search} setSearch={setSearch} />
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100vh",
          alignItems: "stretch",
          color: "var(--gray-8)",
        }}
      >
        <UnitsAndImages search={search} />
        {selectedBlock ? (
          <Commands selectedBlock={selectedBlock} />
        ) : (
          <EmptySection label="Select a unit or image" />
        )}
        {selectedBlock ? (
          <Animation selectedBlock={selectedBlock} surface={surface} />
        ) : (
          <aside
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              maxHeight: "100vh",
            }}
          >
            <EmptySection label="Select a unit or image" />
          </aside>
        )}
        <Frames numFrames={blockFrameCount} />
      </div>
    </div>
  );
};
export default App;
