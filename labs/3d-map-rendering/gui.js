import * as dat from "dat.gui"
import Stats from "stats.js"

export function createStats() {
  const stats = new Stats()
  stats.showPanel(0)
  document.body.appendChild(stats.dom)
  return stats
}

export function createGui() {
  const gui = new dat.GUI()

  let control = new (function () {
    const listeners = {}
    const ctrl = this;

    this.on = function (eventName, handler) {
      if (listeners[eventName]) {
        listeners[eventName].push(handler)
      } else {
        listeners[eventName] = [handler]
      }
    }
    const dispatch = function (eventName, eventData) {
      listeners[eventName] &&
        listeners[eventName].forEach((handler) => handler(eventData))
    }

    this.game = {
      pause: function () {
        dispatch("game:togglePause")
      },
      restart: function () {
        dispatch("game:restart")
      },
    }
    this.lighting = {
      x: 40,
      y: 300,
      z: 120,
      c: "#ffffff",
    }

    this.map = {
        map: '',
        reload: function () {
            dispatch("map:reload", ctrl.map.map)
          },
    }
    this.scene = {
        save: function() {
            dispatch("scene:save");
        }
    }

    this.camera = {
      fov: 45,
      near: 0.1,
      far: 1000,
      position: {
        x: 0,
        y: 30,
        z: 120,
      },
      lookAtReset: function () {
        dispatch("camera:lookAtReset")
      },
    }
  })()

  

  const m = gui.addFolder("Map")
  m.add(control.map, 'map', [ 
    'Reap the Storm.scx',
    '(3)Neo_Sylphid_2.0.scx',
    '(2)MatchPoint1.3.scx',
    '(2)Eclipse_1.05a.scx',
    '(4)CircuitBreakers1.0.scx',
    '(4)Fighting Spirit.scx',
    '(4)Polypoid 1.32.scx',
    '(2)Hitchhiker 1.3[P].scx',
    '(2)Neo Bloody Ridge 2.1.scx',
    '(4)Escalade1.0.scx',
    '(4)LaMancha1.1.scx',
    '(2)Destination.scx',
    '(2)Heartbreak Ridge 2.1.scx',
    '(3)Whiteout1.2.scx',
    '(4)Gladiator1.1.scx',
    '(3)Longinus 2.scx',
    '(3)Tau Cross.scx',
    '(3)Transistor1.2.scm',
    '(4)Jade.scx',
    '(2)Overwatch(n).scx',
    '(2)Tres Pass.scx',
    '(3)Power Bond.scx',
    '(4)BlockChainSE2.1.scx',
    '(2)Cross Game.scx',
    '(3)Medusa 2.2_iCCup.scx',
    '(4)Colosseum 2.0_iCCup.scx',
    '(4)Ground_Zero_2.0_iCCup.scx',
    '(2)Benzene 1.1_iCCup.scx',
    '(3)Aztec 2.1_iCCup.scx',
    '(4)In the Way of an Eddy.scx',
    '(4)Roadkill.scm',
    '(2)Polaris Rhapsody.scx',
    '(8)Big Game Hunters.scm',
    '(4)Blood Bath.scm',
  ] )
  m.add(control.map, "reload")

  const g = gui.addFolder("Game")
  g.add(control.game, "pause")
  g.add(control.game, "restart")

  const f1 = gui.addFolder("Lighting")
  f1.add(control.lighting, "x")
  f1.add(control.lighting, "y")
  f1.add(control.lighting, "z")
  f1.add(control.lighting, "c")

  const f2 = gui.addFolder("Camera")
  f2.add(control.camera, "fov")
  f2.add(control.camera, "near")
  f2.add(control.camera, "far")
  f2.add(control.camera.position, "x").listen()
  f2.add(control.camera.position, "y").listen()
  f2.add(control.camera.position, "z").listen()
  f2.add(control.camera, "lookAtReset")

  const scene = gui.addFolder("Scene");
  scene.add(control.scene, "save");
  
  gui.show()
  return control
}