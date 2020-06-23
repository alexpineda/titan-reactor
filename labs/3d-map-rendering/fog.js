const fogColor = new THREE.Color(0x080820);

export const createFog = () => ({
    fogColor,
    fog: new THREE.Fog(fogColor, 0, 512 * 2);
})