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
    this._lastRender = null;
  }

  _render(children = null) {
    render(
      <>
        <WrappedCanvas canvas={this.context.getGameCanvas()} />
        {children}
      </>,
      this.domElement
    );
  }

  hide() {
    this._render(null);
  }

  hud(children) {
    this.resetListener(() => this.hud(children));
    this._render(children);
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
    this._render(
      <Home settings={this.context.settings} lang={this.context.lang} />
    );
  }

  criticalError() {
    this.resetListener(null);
    this._render(
      <p>There was a critical error. Try deleting your settings file.</p>
    );
  }

  loading() {
    this.resetListener(null);
    this._render(<Loading lang={this.context.lang} />);
  }

  async overlay({ chk, label, description, header = null }) {
    this.resetListener(null);
    if (chk) {
      const preview = await mapPreviewCanvas(chk);
      const mapPreview = <WrappedCanvas canvas={preview} />;

      this._render(
        <LoadingOverlay
          label={chk.title}
          description={chk.tilesetName}
          mapPreview={mapPreview}
          header={header}
        />
      );
    } else {
      this._render(<LoadingOverlay label={label} description={description} />);
    }
  }

  progress(progress, total) {
    this.resetListener(null);
    this._render(<LoadingProgress progress={progress} total={total} />);
  }
}
