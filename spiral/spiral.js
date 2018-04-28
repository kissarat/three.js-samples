const deg = Math.PI / 180

const autonames = {}

class ObjectModel {
  constructor(options) {
    if (this.constructor.defaults) {
      for (const key in this.constructor.defaults) {
        this[key] = this.constructor.defaults[key]
      }
    }
    if (options) {
      for (const key in options) {
        this[key] = options[key]
      }
    }
  }

  get name() {
    const name = this.constructor.name.toLowerCase()
    if (!autonames[name]) {
      autonames[name] = 0
    }
    return name + (++autonames[name])
  }
}

class Cube extends ObjectModel {
  update(mesh) {
    mesh.position.set(this.x || 0, this.y || 0, this.z || 0)
  }
}

class World extends ObjectModel {
  constructor(options) {
    super(options)
    this.updates = []
    this.createScene()
    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    let renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera.position.z = 5;

    this.camera = camera
    this.renderer = renderer

    this.init()

    this.models = [
      {x: 1, y: 1}
    ]
      .map(o => new Cube(o))
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.rotation.x = 45 * deg
    this.scene.rotation.y = 45 * deg
    this.scene.rotation.z = 90 * deg
  }


  init() {

  }

  update() {
    for(const model of this.models) {
      if (!model.vid) {
        const material = [0xff3333, 0xff8800, 0xffff33, 0x33ff33, 0x3333ff, 0x8833ff].map(function (color) {
          return new THREE.MeshBasicMaterial({color: color})
        })
        const box = new THREE.BoxGeometry(1, 1, 1);
        var cube = new THREE.Mesh(box, material);
        this.scene.add(cube);
        model.vid = cube.id
        // cube.setObjectName()
      }
      model.update(this.scene.getObjectById(model.vid))
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    this.update()
    this.render()
    requestAnimationFrame(() => this.animate())
  }
}

World.defaults = {
  play: 100000,
  speed: 1000
}

document.addEventListener('DOMContentLoaded', function () {
  window.world = new World()
  world.animate()
})
