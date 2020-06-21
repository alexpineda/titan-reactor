import * as THREE from "three"
import React from "react"
import { render } from "react-dom"
import { handleResize } from "../../src/display/resize"
import OptionsHUD from "./options"

console.log("lab:perf", new Date().toLocaleString())

const scene = new THREE.Scene()

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
camera.position.set(0, 2, 10)
var cameraHelper = new THREE.CameraHelper(camera)
scene.add(cameraHelper)

const mapMesh = (function () {
  const geo = new THREE.PlaneGeometry(10, 10, 10, 10)
  const mat = new THREE.MeshBasicMaterial({
    color: "#e4b4b4",
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.rotateX(-Math.PI / 2)
  return mesh
})()

scene.add(mapMesh)

function gameLoop() {
  mapMesh.rotation.z += 0.001
  renderer.render(scene, camera)
  requestAnimationFrame(gameLoop)
}
handleResize(camera, renderer)
window.document.body.appendChild(renderer.domElement)
requestAnimationFrame(gameLoop)

render(<OptionsHUD />, document.getElementById("options"))
