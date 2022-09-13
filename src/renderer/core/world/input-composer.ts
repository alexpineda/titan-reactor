import { CameraMouse } from "@input/camera-mouse";
import { CameraKeys } from "@input/camera-keys";
import Janitor from "@utils/janitor";
import { SurfaceComposer } from "./surface-composer";
import MinimapMouse from "@input/minimap-mouse";
import Chk from "bw-chk";
import { ReactiveSessionVariables, SessionChangeEvent } from "./reactive-session-variables";
import { mixer } from "@audio/main-mixer";
// import { selectionObjects as selectionMarkers } from "../../core/selection-objects";

export const createInputComposer = ({ minimapSurface, viewports }: SurfaceComposer, map: Chk, sessionApi: ReactiveSessionVariables) => {


    const janitor = new Janitor();


    const cameraMouse = janitor.mop(new CameraMouse(document.body));

    // janitor.mop(unitSelectionBox.listen(gameSurface, minimapSurface));

    const cameraKeys = janitor.mop(new CameraKeys(document.body));


    const minimapMouse = janitor.mop(new MinimapMouse(
        minimapSurface,
        map.size[0],
        map.size[1],
    ));

    janitor.addEventListener(minimapSurface.canvas, "mousedown", () => {
        // followedUnits.clear();

    });


    const sessionListener = ({ detail: { settings } }: SessionChangeEvent) => {

        mixer.setVolumes(settings.audio);

    };

    //@ts-ignore cant type EventTarget?
    janitor.addEventListener(sessionApi.events, "change", sessionListener, { passive: true });

    // scene.add(...selectionMarkers);


    // const _getSelectionUnit = (object: Object3D): Unit | null => {

    //     if (object instanceof ImageHD || object instanceof Image3D) {
    //         return canSelectUnit(images.getUnit(object));
    //     } else if (object.parent) {
    //         return _getSelectionUnit(object.parent);
    //     }

    //     return null;

    // };

    // const followedUnits = new IterableSet<Unit>();
    // const selectedUnits = new IterableSet<Unit>();

    // const unitSelectionBox = createUnitSelectionBox(selectedUnits, {
    //     onGetUnit: _getSelectionUnit
    // });

    // selectedUnits.externalOnChange = (units) => {
    //     plugins.nativePlugins.callHook(HOOK_ON_UNITS_SELECTED, units);
    //     plugins.uiPlugins.onUnitsSelected(units);
    // }

    // units.externalOnClearUnits = () => {
    //     // selectedUnits.clear();
    //     // followedUnits.clear();
    // };
    // units.externalOnCreateUnit = (unit) => plugins.nativePlugins.callHook(HOOK_ON_UNIT_CREATED, unit);
    // //TODO: killed vs destroyed
    // units.externalOnFreeUnit = (unit) => {
    //     plugins.nativePlugins.callHook(HOOK_ON_UNIT_KILLED, unit);
    //     // selectedUnits.delete(unit);
    //     // followedUnits.delete(unit);
    // }

    // get followedUnitsPosition() {
    //   if (!hasFollowedUnits()) {
    //     return null;
    //   }
    //   return calculateFollowedUnitsTarget(pxToWorld);
    // },

    return {

        update(delta: number, elapsed: number) {
            cameraMouse.update(delta / 100, elapsed, viewports);
            cameraKeys.update(delta / 100, elapsed, viewports);
            minimapMouse.update(viewports);
        },
        dispose() {
            janitor.dispose();
        }
    }
}