import React from "react";
import { render } from "react-dom";
import WrappedElement from "./WrappedElement";
import { LoadingOverlay } from "./LoadingOverlay";
import { LoadingProgress } from "./LoadingProgress";
import FileDropZone from "./components/FileDropZone";
import "./css/tailwind.min.css";
import "./css/pattern.min.css";
import "./css/icon.css";
import "./css/styles.css";

import { mapPreviewCanvas } from "../3d-map-rendering/textures/mapPreviewCanvas";
import Home from "./home/Home";
import Loading from "./home/Loading";

export class UI {
  constructor(domElement, context, onFileDropped) {
    this.context = context;
    this.domElement = domElement;
    this.onFileDropped = onFileDropped;
    this._lastRender = null;
  }

  render(children = null) {
    render(<>{children}</>, this.domElement);
  }

  hide() {
    this.render(null);
  }

  resetListener(listener) {
    if (this.context.hasEventListener("settings", this._listener)) {
      this.context.removeEventListener("settings", this._listener);
    }
    this._listener = listener;
    if (listener) {
      this.context.addEventListener("settings", this._listener);
    }
  }

  home() {
    this.resetListener(() => this.home());
    this.render(
      <Home settings={this.context.settings} lang={this.context.lang} />
    );
  }

  criticalError() {
    this.resetListener(null);
    this.render(
      <p>There was a critical error. Try deleting your settings file.</p>
    );
  }

  loading() {
    this.resetListener(null);
    this.render(<Loading lang={this.context.lang} />);
  }

  async overlay({ chk, label, description, header = null }) {
    this.resetListener(null);
    if (chk) {
      const preview = await mapPreviewCanvas(chk);
      const mapPreview = <WrappedElement canvas={preview} />;

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
    this.resetListener(null);
    this.render(<LoadingProgress progress={progress} total={total} />);
  }
}
