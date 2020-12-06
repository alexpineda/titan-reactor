import React from "react";
import Visible from "./visible";

const Tab = ({ tabName, activeTab, children }) => (
  <Visible visible={tabName === activeTab}>
    <ul className="tab-content divide-y-8 divide-transparent leading-relaxed">
      {children}
    </ul>
  </Visible>
);

export default Tab;
