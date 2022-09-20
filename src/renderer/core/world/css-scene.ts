import { Janitor } from "@utils/janitor";
import { Camera, Scene } from "three";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";

export class CssScene extends Scene {
    #cssRenderer = new CSS2DRenderer();
    #janitor = new Janitor("CssScene");
    constructor() {
        super();
        this.#cssRenderer.domElement.style.position = 'absolute';
        this.#cssRenderer.domElement.style.pointerEvents = 'none';
        this.#cssRenderer.domElement.style.top = '0px';
        this.#cssRenderer.domElement.style.left = '0px';
        this.#cssRenderer.domElement.style.zIndex = '100';
        document.body.appendChild(this.#cssRenderer.domElement);
        this.#janitor.mop(() => document.body.removeChild(this.#cssRenderer.domElement), "domElement");
    }

    setSize(width: number, height: number) {
        this.#cssRenderer.setSize(width, height);
    }

    render(camera: Camera) {
        let _cssItems = 0;
        for (const cssItem of this.children) {
            _cssItems += cssItem.children.length;
            if (_cssItems > 0) {
                break;
            }
        }
        //TODO: remove css renderer from main thread
        if (_cssItems) {
            this.#cssRenderer.render(this, camera);
        }
    }

    dispose() {
        this.#janitor.dispose();
    }
}