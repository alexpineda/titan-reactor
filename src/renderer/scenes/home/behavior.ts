import { MathUtils, Object3D, PointLight, Vector3 } from "three";

const pick = (d0: number, d1: number, c: number) => {
    return Math.random() > c ? d0 : d1;
}

const delayMod = (d0: number, d1: number, c: number, r: number) => {

}

const sequence = [pick, repeat([delay(1000), everyOther(5)]), execute]

repeat([maybe(slowBlink, fastBlink, 0.1)]);

const slowBlink = delayMod(1000, 1250, 0.5, 5).repeat(_up);
const fastBlink = delayMod(100, 250, 0.5, 1).repeat(_up);

maybe(slowBlink, fastBlink, 0.1)



delay(1000, 2000, 0.3)
    .start(delay(1000, 2000, 0.3).tap(() => blink()).repeat(5, 5))

const createWraith = (og: Object3D, originalPosition: Vector3, i: number) => {
    let _swerveRate = 1000;
    let _nextSwerveRate = 1000;
    let _nextSwerveAngle = Math.PI / 3.5;

    let [wx, wy, wz] = [
        MathUtils.randInt(1000, 4000),
        MathUtils.randInt(1000, 4000),
        MathUtils.randInt(1000, 4000),
    ];

    const wraith = og.clone(true) as Wraith;

    const burnerLight = new PointLight(0xff5500, 20, 1.5, 10);
    burnerLight.position.set(0, 0.1, -0.3);
    wraith.add(burnerLight);

    const rightBlinker = new PointLight(i ? wraithRed : wraithBlue, 2, 1, 7);
    rightBlinker.position.set(-0.2, -0.2, -0.05);
    wraith.add(rightBlinker);

    const leftBlinker = new PointLight(i ? wraithRed : wraithBlue, 2, 1, 7);
    leftBlinker.position.set(0.2, -0.2, -0.05);
    wraith.add(leftBlinker);

    let _a = 0;
    let _b = 0;
    let _interval0: NodeJS.Timeout;
    let _interval1: NodeJS.Timeout;

    _fireParticles.points.position.set(0, 0, -0.2);
    wraith.add(_fireParticles.points.clone());
    // if (!_fireParticles.points.parent) wraith.add(_fireParticles.points);

    return Object.assign(wraith, {
        init() {
            this.position.copy(originalPosition);

            // _a = 0;
            // _interval0 = setInterval(() => {
            //     rightBlinker.intensity = _a % 3 === 0 ? 1 : 0;
            //     _a++;
            // }, 1000 + Math.random() * 1000);

            // _b = 0;
            // _interval1 = setInterval(() => {
            //     leftBlinker.intensity = _b % 4 === 0 ? 1 : 0;
            //     _b++;
            // }, 1000 + Math.random() * 1000);
        },
        update(delta: number, elapsed: number) {
            _swerveRate = MathUtils.damp(_swerveRate, _nextSwerveRate, 0.001, delta);
            if (Math.abs(_swerveRate - _nextSwerveRate) < 1) {
                _nextSwerveRate = Math.random() * 5000 + 10000;
            }
            this.rotation.z = MathUtils.damp(
                this.rotation.z,
                Math.sin(elapsed / _swerveRate) * _nextSwerveAngle,
                0.001,
                delta
            );
            this.position.x = originalPosition.x + Math.sin(elapsed / wx) * 0.3;
            this.position.y = originalPosition.y + Math.sin(elapsed / wy) * 0.3;
            this.position.z = originalPosition.z + Math.sin(elapsed / wz) * 0.3;
        },
        dispose() {
            clearInterval(_interval0);
            clearInterval(_interval1);
        },
    } as Wraith);
};
