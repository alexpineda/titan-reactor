import { CameraMouse } from "@input/camera-mouse";
import { CameraKeys } from "@input/camera-keys";
import Janitor from "@utils/janitor";
import { SurfaceComposer } from "./surface-composer";
import MinimapMouse from "@input/minimap-mouse";
import { MouseCursor } from "@input/mouse-cursor";
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

export const createInputComposer = ({ events, map }: World, { gameSurface, minimapSurface }: SurfaceComposer, { images, sprites, scene }: SceneComposer, viewComposer: ViewComposer, assets: Assets) => {

    const janitor = new Janitor();
    const cameraMouse = janitor.mop(new CameraMouse(document.body));
    const mouseCursor = janitor.mop(new MouseCursor());
    const cameraKeys = janitor.mop(new CameraKeys(document.body));
    const minimapMouse = janitor.mop(new MinimapMouse(
        minimapSurface,
        map.size[0],
        map.size[1],
    ));

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

    // get followedUnitsPosition() {
    //   if (!hasFollowedUnits()) {
    //     return null;
    //   }
    //   return calculateFollowedUnitsTarget(pxToWorld);
    // },

    return {
        onSceneControllerActivated(sceneController: SceneController) {
            unitSelectionBox.activate(sceneController.gameOptions?.allowUnitSelection, sceneController.viewports[0].camera)
        },
        mouseCursor,
        update(delta: number, elapsed: number) {
            cameraMouse.update(delta / 100, elapsed, viewComposer);
            cameraKeys.update(delta / 100, elapsed, viewComposer);
            minimapMouse.update(viewComposer);
            selectionDisplayComposer.update(viewComposer.primaryCamera!, sprites, [], selectedUnits.values());
        },
        dispose() {
            janitor.dispose();
        }
    }
}