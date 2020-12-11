import React, { useState } from "react";
import Tab from "../components/Tab";
import TabSelector from "../components/TabSelector";

const Tabs = {
  Maps: "Maps",
  Community: "Community",
};

export default ({ lang }) => {
  const [tab, setTab] = useState(Tabs.Maps);

  return (
    <>
      <ul className="mb-6 flex">
        <TabSelector
          activeTab={tab}
          tab={Tabs.Maps}
          setTab={setTab}
          label={lang["LOCAL_MAPS"]}
        />
        <TabSelector
          activeTab={tab}
          tab={Tabs.Community}
          setTab={setTab}
          label={lang["COMMUNITY_MAPS"]}
        />
      </ul>
      <Tab tabName={Tabs.Maps} activeTab={tab}>
        <div>
          <div>Folder</div>
          <div>File</div>
        </div>
      </Tab>
      <Tab tabName={Tabs.Maps} activeTab={tab}>
        Maps
      </Tab>

      <button className="mt-auto g-btn--yellow-to-orange">
        {lang["BUTTON_LAUNCH"]}
      </button>
    </>
  );
};
