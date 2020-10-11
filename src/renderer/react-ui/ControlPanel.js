import React from "react";
import { render } from "react-dom";
import { WrappedCanvas } from "./WrappedCanvas";

import "./css/tailwind.min.css";
import "./css/pattern.min.css";
import "./css/icon.css";

export class ControlPanelUi {
  constructor(domElement) {
    this.domElement = domElement;
  }

  render(children = null) {
    render(
      <main>
        <p>Control Panel</p>
        <div>{children}</div>
      </main>,
      this.domElement
    );
  }
}
