import { Surface } from "@image/canvas";
import Janitor from "@utils/janitor";
import { MouseSelectionBox } from ".";
import { Object3D, PerspectiveCamera, Scene } from "three";
import { SelectionBox } from "three/examples/jsm/interactive/SelectionBox";

export const createImageSelection = (scene: Scene, gameSurface: Surface, minimapSurface: Surface, onSelect: (obj: Object3D[]) => void) => {
    const janitor = new Janitor;
    const selectionBox = new SelectionBox(new PerspectiveCamera, scene);
    const visualBox = janitor.mop(new MouseSelectionBox("#00cc00"));

    let mouseIsDown = false;
    let enabled = true;

    const _selectDown = (event: PointerEvent) => {
        if (event.button !== 0 || !enabled) return;
        minimapSurface.canvas.style.pointerEvents = "none";
        mouseIsDown = true;
        selectionBox.startPoint.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            - (event.clientY / window.innerHeight) * 2 + 1,
            0.5);

        visualBox.start(event.clientX, event.clientY);
    };

    const _selectMove = (event: PointerEvent) => {
        if (!enabled) return;

        if (mouseIsDown) {

            selectionBox.endPoint.set(
                (event.clientX / window.innerWidth) * 2 - 1,
                - (event.clientY / window.innerHeight) * 2 + 1,
                0.5);

            visualBox.end(event.clientX, event.clientY);

        }

    }

    const _selectUp = (event: PointerEvent) => {
        if (!mouseIsDown || !enabled) return;

        minimapSurface.canvas.style.pointerEvents = "auto";
        mouseIsDown = false;
        visualBox.clear();
        // mouseCursor.pointer();

        if (visualBox.isMinDragSize(event.clientX, event.clientY)) {

            selectionBox.endPoint.set(
                (event.clientX / window.innerWidth) * 2 - 1,
                - (event.clientY / window.innerHeight) * 2 + 1,
                0.5);

            onSelect(selectionBox.select())

        }

    }

    janitor.addEventListener(gameSurface.canvas, 'pointerup', _selectUp);
    janitor.addEventListener(gameSurface.canvas, "pointerdown", _selectDown);
    janitor.addEventListener(gameSurface.canvas, 'pointermove', _selectMove);

    return {
        dispose: janitor,
        selectionBox,
        get enabled() {
            return enabled;
        },
        set enabled(value: boolean) {
            visualBox.enabled = value;
            enabled = value;
        }
    }

}