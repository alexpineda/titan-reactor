import CameraControls from "camera-controls";

export const smoothDollyIn = (control: CameraControls, amp = 1) => {
    control.dolly(3 * amp, true);
    control.rotate(0, (Math.PI * amp) / 96, true);
}

export const smoothDollyOut = (control: CameraControls, amp = 1) => {
    control.rotate(0, -(Math.PI * amp) / 96, true);
    control.dolly(-3 * amp, true);
}