import React from "react";
import { render } from "react-dom";
import { WrappedCanvas } from "./WrappedCanvas";
import { LoadingOverlay } from "./LoadingOverlay";
import { LoadingProgress } from "./LoadingProgress";
import "./css/tailwind.min.css";
import "./css/pattern.min.css";
import "./css/icon.css";
import "./css/styles.css";

import { mapPreviewCanvas } from "../3d-map-rendering/textures/mapPreviewCanvas";
import Home from "./home/Home";
import Loading from "./home/Loading";

export class UI {
  constructor(domElement, context) {
    this.context = context;
    this.domElement = domElement;
  }

  render(children = null) {
    render(
      <>
        <WrappedCanvas canvas={this.context.getGameCanvas()} />
        {children}
      </>,
      this.domElement
    );
  }

  home() {
    this.render(<Home context={this.context} />);
  }

  loading(lang) {
    this.render(<Loading lang={lang} />);
  }

  async overlay({ chk, label, description, header = null }) {
    if (chk) {
      const preview = await mapPreviewCanvas(chk);
      const mapPreview = <WrappedCanvas canvas={preview} />;

      this.render(
        <LoadingOverlay
          label={chk.title}
          description={chk.tilesetName}
          mapPreview={mapPreview}
          header={header}
        />
      );
    } else {
      this.render(<LoadingOverlay label={label} description={description} />);
    }
  }

  progress(progress, total) {
    this.render(<LoadingProgress progress={progress} total={total} />);
  }
}
