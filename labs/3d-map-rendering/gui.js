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

    this.displacement = {
      elevations: '1 1 1 1 1 1 1',
      regenerate : function () {
        console.log('dispatch:displacement')
        dispatch("displacement", ctrl.roughness)
      },
    }

    this.roughness = {
      elevations: '1 1 1 1 1 1 1',
      detailsElevations: '1 0 0 0 0 0 0',
      detailsRatio: '0.5 0 0 0 0 0 0',
      scale: 0.5,
      blur: 0,
      water: false,
    lava: false,
    twilight: false,
    skipDetails: false,
          onlyWalkable: false,
      regenerate : function () {
        console.log('dispatch:roughness')
        dispatch("roughness", ctrl.roughness)
      },
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

  })()

  
  gui.remember(control);

  const mapFolder = gui.addFolder("Map")
  const map = mapFolder.add(control.map, 'map', [ 
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
  map.onFinishChange(function(value) {
    map.object.reload(value)
  });
  mapFolder.add(control.map, "reload")

  const roughnessFolder = gui.addFolder("Roughness")
  roughnessFolder.add(control.roughness, "elevations")
  roughnessFolder.add(control.roughness, "detailsElevations")
  roughnessFolder.add(control.roughness, "detailsRatio")
  roughnessFolder.add(control.roughness, "scale")
  roughnessFolder.add(control.roughness, "blur")
  roughnessFolder.add(control.roughness, "water")
  roughnessFolder.add(control.roughness, "lava")
  roughnessFolder.add(control.roughness, "twilight")
  roughnessFolder.add(control.roughness, "skipDetails")
  roughnessFolder.add(control.roughness, "onlyWalkable")
  roughnessFolder.add(control.roughness, "regenerate")

  const displacementFolder = gui.addFolder('Displacement');
  displacementFolder.add(control.displacement, 'elevations');
  displacementFolder.add(control.displacement, 'regenerate');
  
  const sceneFolder = gui.addFolder("Scene");
  sceneFolder.add(control.scene, "save");
  
  gui.show()
  return control
}