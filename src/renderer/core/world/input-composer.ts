import { MouseInput } from "@input/mouse-input";
import { ArrowKeyInput } from "@input/arrow-key-input";
import Janitor from "@utils/janitor";
import { expose } from "@utils/object-utils";

export type InputComposer = ReturnType<typeof createInputComposer>;

export const createInputComposer = () => {

    const janitor = new Janitor()
    const mouseInput = janitor.mop(new MouseInput(document.body));
    const arrowKeyInput = janitor.mop(new ArrowKeyInput(document.body));

    return {
        get mouse() {
            return mouseInput;
        },
        get keyboard() {
            return arrowKeyInput;
        },
        resetState() {
            mouseInput.reset();
        },
        dispose: () => janitor.dispose(),
        inputGameTimeApi: {
            mouse: expose(mouseInput, ["mouseScrollY", "screenDrag", "lookAt", "move", "modifiers", "clientX", "clientY", "clicked"], { asValues: false }),
            // get followedUnitsPosition() {
            //   if (!hasFollowedUnits()) {
            //     return null;
            //   }
            //   return calculateFollowedUnitsTarget(pxToWorld);
            // },
        }
    }
}