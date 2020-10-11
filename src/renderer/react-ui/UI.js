import React from "react";
import { render } from "react-dom";
import { WrappedCanvas } from "./WrappedCanvas";
import { LoadingOverlay } from "./LoadingOverlay";

import "./css/tailwind.min.css";
import "./css/pattern.min.css";
import "./css/icon.css";
import { mapPreviewCanvas } from "../3d-map-rendering/textures/mapPreviewCanvas";

export class UI {
  constructor(domElement, gameCanvas, miniMapCanvas) {
    this.gameCanvas = gameCanvas;
    this.miniMapCanvas = miniMapCanvas;
    this.domElement = domElement;
  }

  render(children = null) {
    render(
      <>
        <WrappedCanvas canvas={this.gameCanvas} />
        {children}
      </>,
      this.domElement
    );
  }

  async overlay({ chk, label, description }) {
    if (chk) {
      const preview = await mapPreviewCanvas(chk);
      const mapPreview = <WrappedCanvas canvas={preview} />;

      this.render(
        <LoadingOverlay
          label={chk.title}
          description={chk.tilesetName}
          mapPreview={mapPreview}
        />
      );
    } else {
      this.render(<LoadingOverlay label={label} description={description} />);
    }
  }
}
