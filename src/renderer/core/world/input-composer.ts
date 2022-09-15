import { CameraMouse } from "@input/camera-mouse";
import { CameraKeys } from "@input/camera-keys";
import Janitor from "@utils/janitor";
import { SurfaceComposer } from "./surface-composer";
import MinimapMouse from "@input/minimap-mouse";
import { ViewComposer } from "./view-composer";
import { Object3D } from "three";
import { Image3D, ImageHD, Unit } from "..";
import { canSelectUnit } from "@utils/unit-utils";
import { SceneComposer } from "./scene-composer";
import { createUnitSelectionBox } from "@input/create-unit-selection";
import { IterableSet } from "@utils/iterable-set";
import { createSelectionDisplayComposer } from "@core/selection-objects";
import { Assets } from "common/types";
import { SceneController } from "@plugins/plugin-system-native";
import { World } from "./world";
import { MouseCursor } from "@input/mouse-cursor";

export type InputComposer = ReturnType<typeof createInputComposer>;

export const createInputComposer = ({ events, map }: World, { gameSurface, minimapSurface }: SurfaceComposer, { images, sprites, scene }: SceneComposer, viewComposer: ViewComposer, assets: Assets) => {

    const janitor = new Janitor();
    const cameraMouse = janitor.mop(new CameraMouse(document.body));
    const cameraKeys = janitor.mop(new CameraKeys(document.body));
    const minimapMouse = janitor.mop(new MinimapMouse(
        minimapSurface,
        map.size[0],
        map.size[1],
    ));
    janitor.mop(new MouseCursor(minimapSurface.canvas));
    gameSurface.canvas.style.cursor = "none";

    const _getSelectionUnit = (object: Object3D): Unit | null => {

        if (object instanceof ImageHD || object instanceof Image3D) {
            return canSelectUnit(images.getUnit(object));
        } else if (object.parent) {
            return _getSelectionUnit(object.parent);
        }

        return null;

    };

    const followedUnits = new IterableSet<Unit>((units) => events.emit("followed-units-changed", units));

    const selectedUnits = new IterableSet<Unit>((units) => events.emit("selected-units-changed", units));

    janitor.addEventListener(minimapSurface.canvas, "mousedown", () => followedUnits.clear());

    const unitSelectionBox = createUnitSelectionBox(selectedUnits, scene, _getSelectionUnit);

    janitor.mop(unitSelectionBox.listen(gameSurface, minimapSurface));

    const selectionDisplayComposer = createSelectionDisplayComposer(assets);
    scene.add(...selectionDisplayComposer.objects);

    events.on("units-cleared", () => {
        selectedUnits.clear();
        followedUnits.clear();
    });

    events.on("unit-killed", (unit) => {
        selectedUnits.delete(unit);
        followedUnits.delete(unit);
    });

    events.on("unit-destroyed", (unit) => {
        selectedUnits.delete(unit);
        followedUnits.delete(unit);
    });


    return {
        get mousePosition() {
            return cameraMouse.mouse;
        },
        selectedUnits,
        followedUnits,
        get unitSelectionStatus() {
            return unitSelectionBox.status;
        },
        onSceneControllerActivated(sceneController: SceneController) {
            unitSelectionBox.activate(sceneController.gameOptions?.allowUnitSelection, sceneController.viewports[0].camera)
        },
        update(delta: number, elapsed: number) {
            cameraMouse.update(delta / 100, elapsed, viewComposer);
            cameraKeys.update(delta / 100, elapsed, viewComposer);
            minimapMouse.update(viewComposer);
            selectionDisplayComposer.update(viewComposer.primaryCamera!, sprites, [], selectedUnits.toArray());
        },
        dispose() {
            janitor.dispose();
        },
        inputGameTimeApi: {
            // get followedUnitsPosition() {
            //   if (!hasFollowedUnits()) {
            //     return null;
            //   }
            //   return calculateFollowedUnitsTarget(pxToWorld);
            // },
        }
    }
}