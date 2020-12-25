import React from "react";
import Visible from "./visible";

const Tab = ({ tabName, activeTab, children, className }) => (
  <Visible visible={tabName === activeTab}>
    <ul
      className={`tab-content divide-y-8 divide-transparent leading-relaxed ${className}`}
    >
      {children}
    </ul>
  </Visible>
);

export default Tab;
