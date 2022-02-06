import CameraControls from "camera-controls";

export const smoothDollyIn = (control: CameraControls, amp = 1, withRotate = true) => {
    control.dolly(3 * amp, true);
    withRotate && control.rotate(0, (Math.PI * amp) / 96, true);
}

export const smoothDollyOut = (control: CameraControls, amp = 1, withRotate = true) => {
    control.rotate(0, -(Math.PI * amp) / 96, true);
    withRotate && control.dolly(-3 * amp, true);
}