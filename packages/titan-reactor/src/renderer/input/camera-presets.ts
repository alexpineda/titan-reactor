import CameraControls from "camera-controls";

export const smoothDollyIn = (control: CameraControls) => {
    control.dolly(3, true);
    control.rotate(0, (Math.PI) / 96, true);
}

export const smoothDollyOut = (control: CameraControls) => {
    control.rotate(0, -(Math.PI) / 96, true);
    control.dolly(-3, true);
}