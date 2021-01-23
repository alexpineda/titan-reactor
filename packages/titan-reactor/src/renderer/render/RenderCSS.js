import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer";

import {
  CSS3DRenderer,
  CSS3DObject,
  CSS3DSprite,
} from "three/examples/jsm/renderers/CSS3DRenderer";

class RenderCSS {
  constructor(domElement) {
    this.domElement = domElement;
    this.css2dRenderer = new CSS2DRenderer();
    this.css3dRenderer = new CSS3DRenderer();

    this.css2dRenderer.domElement.style.position = "absolute";
    this.css2dRenderer.domElement.style.top = "0px";
    this.css2dRenderer.domElement.style.pointerEvents = "none";
    domElement.appendChild(this.css2dRenderer.domElement);

    this.css3dRenderer.domElement.style.position = "absolute";
    this.css3dRenderer.domElement.style.top = "0px";
    this.css3dRenderer.domElement.style.pointerEvents = "none";
    domElement.appendChild(this.css3dRenderer.domElement);
  }

  setSize(width, height) {
    this.css2dRenderer.setSize(width, height);
    this.css3dRenderer.setSize(width, height);
  }

  render(scene, camera) {
    this.css2dRenderer.render(scene, camera);
    this.css3dRenderer.render(scene, camera);
  }

  dispose() {
    this.css2dRenderer.domElement.remove();
    this.css3dRenderer.domElement.remove();
  }
}

export default RenderCSS;
