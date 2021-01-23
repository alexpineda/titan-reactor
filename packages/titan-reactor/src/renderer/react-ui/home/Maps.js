import React, { useState } from "react";
import Tab from "../components/Tab";
import TabSelector from "../components/TabSelector";

const Tabs = {
  Maps: "Maps",
  Community: "Community",
};

export default ({ phrases }) => {
  const [tab, setTab] = useState(Tabs.Maps);

  return (
    <>
      <ul className="mb-6 flex">
        <TabSelector
          activeTab={tab}
          tab={Tabs.Maps}
          setTab={setTab}
          label={phrases["LOCAL_MAPS"]}
        />
        <TabSelector
          activeTab={tab}
          tab={Tabs.Community}
          setTab={setTab}
          label={phrases["COMMUNITY_MAPS"]}
        />
      </ul>
      <main style={{ maxHeight: "50vh" }}>
        <Tab tabName={Tabs.Maps} activeTab={tab}>
          <div>
            <div>Folder</div>
            <div>File</div>
          </div>
        </Tab>
        <Tab tabName={Tabs.Maps} activeTab={tab}>
          Maps
        </Tab>
      </main>
      <button className="mt-auto g-btn--yellow-to-orange">
        {phrases["BUTTON_LAUNCH"]}
      </button>
    </>
  );
};
