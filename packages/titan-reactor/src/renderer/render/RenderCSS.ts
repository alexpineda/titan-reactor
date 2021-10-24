import { PerspectiveCamera, Scene } from "three";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer";

class RenderCSS {
  domElement: HTMLElement;
  css2dRenderer: CSS2DRenderer;
  css3dRenderer: CSS3DRenderer;

  constructor(domElement: HTMLElement) {
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

  setSize(width: number, height: number) {
    this.css2dRenderer.setSize(width, height);
    this.css3dRenderer.setSize(width, height);
  }

  render(scene: Scene, camera: PerspectiveCamera) {
    this.css2dRenderer.render(scene, camera);
    this.css3dRenderer.render(scene, camera);
  }

  dispose() {
    this.css2dRenderer.domElement.remove();
    this.css3dRenderer.domElement.remove();
  }
}

export default RenderCSS;
