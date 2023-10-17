const DEFAULT_FAR = 256;
const POLAR_MAX = (10 * Math.PI) / 64;
const POLAR_MIN = (2 * Math.PI) / 64;
// const POV_COMMANDS = [0x0c, 0x14, 0x15, 0x60, 0x61];
const PIP_PROXIMITY = 16;
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();
export default class PluginAddon extends SceneController {
    // #pip: GameViewPort;
    gameOptions = {
        audio: "stereo",
    };
    async onEnterScene(prevData) {
        this.viewport.fullScreen();
        const orbit = this.viewport.orbit;
        if (typeof prevData?.target?.x === "number" && typeof prevData?.target?.z === "number") {
            await orbit.setTarget(prevData.target.x, 0, prevData.target.z, false);
        }
        else {
            await orbit.setTarget(0, 0, 0, false);
        }
        orbit.camera.far = DEFAULT_FAR;
        orbit.camera.fov = 15;
        orbit.camera.updateProjectionMatrix();
        orbit.dollyToCursor = true;
        orbit.verticalDragToForward = true;
        orbit.maxDistance = 128;
        orbit.minDistance = 20;
        orbit.maxPolarAngle = POLAR_MAX;
        orbit.minPolarAngle = POLAR_MIN + THREE.MathUtils.degToRad(5);
        orbit.maxAzimuthAngle = 0;
        orbit.minAzimuthAngle = 0;
        await orbit.rotatePolarTo(orbit.minPolarAngle, false);
        await orbit.rotateAzimuthTo(0, false);
        await orbit.zoomTo(1, false);
        await orbit.dollyTo(55, false);

    }
 
    onCameraMouseUpdate(delta, elapsed, scrollY, screenDrag, lookAt, mouse, clientX, clientY, clicked) {
        const _delta = delta * 20;
        if (scrollY) {
            if (scrollY < 0) {
                this.viewport.orbit.dolly(12, true);
                this.viewport.orbit.rotate(0, (Math.PI ) / 96, true);
            }
            else {
                this.viewport.orbit.dolly(-12, true);
                this.viewport.orbit.rotate(0, -(Math.PI ) / 96, true);
            }
        }
        if (screenDrag.x !== 0) {
            this.viewport.orbit.truck(screenDrag.x * _delta * this.settings.input.movementSpeed(), 0, true);
        }
        if (screenDrag.y !== 0) {
            this.viewport.orbit.forward(screenDrag.y * _delta * this.settings.input.movementSpeed(), true);
        }
    }
    onCameraKeyboardUpdate(delta, elapsed, move) {
        const _delta = delta * 20;
        if (move.x !== 0) {
            this.viewport.orbit.truck(move.x * _delta * this.settings.input.movementSpeed(), 0, true);
        }
        if (move.y !== 0) {
            this.viewport.orbit.forward(move.y * _delta * this.settings.input.movementSpeed(), true);
        }
    }
    _groundTarget(viewport, t) {
        return viewport.orbit.getTarget(t).setY(0);
    }
    _areProximate(a, b) {
        return a.distanceTo(b) < PIP_PROXIMITY;
    }
    _areProximateViewports(a, b) {
        return this._areProximate(this._groundTarget(a, _a), this._groundTarget(b, _b));
    } 

    onFrame() {
        if (this.followedUnits.size) {
            const pos = this.getFollowedUnitsCenterPosition();
            if (pos) {
                this.viewport.orbit.moveTo(pos.x, pos.y, pos.z, true);
            }
        }
    }

    onMinimapDragUpdate(pos, isDragStart, mouseButton) {

        if (mouseButton === 0) {
          this.viewport.orbit.moveTo(pos.x, 0, pos.y, !isDragStart);
        }
    }

}
;