import { MouseInput } from "@input/mouse-input";
import { ArrowKeyInput } from "@input/arrow-key-input";
import { Janitor } from "three-janitor";
import { expose } from "@utils/object-utils";
import { World } from "./world";

export type InputComposer = ReturnType<typeof createInputComposer>;

export const createInputComposer = (world: World) => {

    const janitor = new Janitor("InputComposer");
    const mouseInput = janitor.mop(new MouseInput(document.body), "mouseInput");
    const arrowKeyInput = janitor.mop(new ArrowKeyInput(document.body), "arrowKeyInput");

    return {
        get mouse() {
            return mouseInput;
        },
        get keyboard() {
            return arrowKeyInput;
        },
        update() {
            if (this.mouse.clicked) {
                if (world.events.emit("mouse-click", this.mouse.event) === false) {
                    this.mouse.interrupted = true;
                }
            }
        },
        resetState() {
            mouseInput.reset();
        },
        dispose: () => janitor.dispose(),
        api: {
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