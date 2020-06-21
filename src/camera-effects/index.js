import * as THREE from "three"
import { handleResize } from "../../src/controls/gui"
import ks from "ks"

import {
  createFloor,
  createStartLocation,
} from "../../src/meshes/NativeObjects"
import { resolveTripleslashReference } from "typescript"

const scene = new THREE.Scene()

// @ts-ignore
window.scene = scene

let renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("three-js"),
  antialias: true,
})

renderer.setSize(window.innerWidth, window.innerHeight)

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(0, 40, 100)
window.camera = camera

var axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

const cameras = (function (mapWidth, mapHeight, playerPos) {
  const cameras = {}
  cameras.setActive = (active) => (cameras.active = active)
  cameras.world = new THREE.Object3D()
  cameras.world.position.set(0, 40, 100)
  cameras.world.target = new THREE.Vector3(0, 0, 0)

  cameras.top = new THREE.Object3D()
  cameras.top.position.set(0, 100, 0)
  cameras.top.target = new THREE.Vector3(0, 0, 0)

  cameras.players = []

  const playerCamera0 = playerPos[0].clone().add(new THREE.Vector3(-10, 15, 20))

  const playerTarget0 = playerPos[0].clone().add(new THREE.Vector3(5, 5, 5))

  const playerCamera1 = playerPos[1].clone().add(new THREE.Vector3(-10, 15, 20))

  const playerTarget1 = playerPos[1].clone().add(new THREE.Vector3(5, 5, 5))

  cameras.players[0] = new THREE.Object3D()
  cameras.players[0].position.copy(playerCamera0)
  cameras.players[0].target = new THREE.Vector3()
  cameras.players[0].target.copy(playerTarget0)

  cameras.players[1] = new THREE.Object3D()
  cameras.players[1].position.copy(playerCamera1)
  cameras.players[1].target = new THREE.Vector3()
  cameras.players[1].target.copy(playerTarget1)

  cameras.setActive(cameras.world)
  cameras.update = (camera) => {
    camera.position.lerp(cameras.active.position, 0.05)

    if (!cameraTarget.equals(cameras.active.target)) {
      cameraTarget.lerp(cameras.active.target, 0.1)
    }
    camera.lookAt(cameraTarget)
  }

  return cameras
})(128, 128, [new THREE.Vector3(-60, 0, -60), new THREE.Vector3(60, 0, 60)])

const world = new THREE.Group()
const mapMesh = createFloor(128, 128, null)
const startPos = createStartLocation(-60, -60, 0xff0000)
const startPos2 = createStartLocation(60, 60, 0x0000ff)
const gridHelper = new THREE.GridHelper(128, 128)

camera.lookAt(mapMesh.position)

world.add(gridHelper)
world.add(mapMesh)
world.add(startPos)
world.add(startPos2)
scene.add(world)

// document.addEventListener("keydown", function (event) {
//   const { code, shiftKey, altKey, ctrlKey, metaKey } = event

//   console.log("keydown", event)
//   switch (code) {
//     case "KeyW":
//       cameras.setActive(cameras.world)
//       break
//     case "KeyT":
//       cameras.setActive(cameras.top)
//       break
//     case "Digit1":
//       cameras.setActive(cameras.players[0])
//       break
//     case "Digit2":
//       cameras.setActive(cameras.players[1])
//       break
//   }
// })

ks("c+m", () => cameras.setActive(cameras.world))
ks("c+t", () => cameras.setActive(cameras.top))
ks("c+1", () => cameras.setActive(cameras.players[0]))
ks("c+2", () => cameras.setActive(cameras.players[1]))

const clock = new THREE.Clock(true)
let frames = 10

let cameraTarget = new THREE.Vector3()

function gameLoop() {
  cameras.update(camera, world)
  requestAnimationFrame(gameLoop)

  renderer.render(scene, camera)
}
handleResize(camera, renderer)
// window.document.body.appendChild(renderer.domElement)
requestAnimationFrame(gameLoop)
