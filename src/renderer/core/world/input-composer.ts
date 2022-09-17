import { MouseInput } from "@input/mouse-input";
import { ArrowKeyInput } from "@input/arrow-key-input";
import { SurfaceComposer } from "./surface-composer";
import { ViewComposer } from "./view-composer";
import Janitor from "@utils/janitor";

export type InputComposer = ReturnType<typeof createInputComposer>;

export const createInputComposer = ({ gameSurface }: SurfaceComposer, viewComposer: ViewComposer) => {

    const janitor = new Janitor()
    const mouseInput = janitor.mop(new MouseInput(document.body));
    const arrowKeyInput = janitor.mop(new ArrowKeyInput(document.body));
    gameSurface.canvas.style.cursor = "none";

    return {
        get mouse() {
            return mouseInput;
        },
        update(delta: number, elapsed: number) {
            mouseInput.update(delta / 100, elapsed, viewComposer);
            arrowKeyInput.update(delta / 100, elapsed, viewComposer);
        },
        resetState() {
            mouseInput.reset();
        },
        dispose: () => janitor.dispose(),
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