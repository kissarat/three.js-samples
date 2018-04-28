const deg = Math.PI / 180
const ROTATE = 1 / 3
const PI2 = 2 * Math.PI

const nameCounter = {}
const objects = {}

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
    if (!this.name) {
      const name = this.constructor.name.toLowerCase()
      if (!nameCounter[name]) {
        nameCounter[name] = 0
      }
      this.name = name + (++nameCounter[name])
    }
    objects[this.name] = this
  }
}

class Cube extends ObjectModel {
  update(world, mesh) {
    const angle = world.getAngle(this.n / 10)
    // const a = world.getAngle(this.a * this.n / 2)
    mesh.position.x = Math.cos(angle) * this.l
    mesh.position.z = Math.sin(angle) * this.l
    mesh.position.y = this.h * Math.abs(Math.cos(world.getAngle(1/4))) / 2
    mesh.rotation.y = -angle
  }
}

class World extends ObjectModel {
  constructor(options) {
    super(options)
    this.updates = []
    this.createScene()
    let camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);

    let renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera.position.z = 12;

    this.camera = camera
    this.renderer = renderer

    const gridHelper = new THREE.GridHelper(10, 10);
    this.scene.add(gridHelper);

    this.init()

    this.models = []
    const amount = 10
    for (let n = 0; n < amount; n++) {
      this.models.push(new Cube({
        n: amount - n,
        h: n,
        l: (amount - n) / 2,
        a: Math.random(),
        size: 0.3 + 0.7 * (1 - n / amount)
      }))
    }
    this.size = amount
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.rotation.x = 45 * deg
    this.scene.rotation.y = 45 * deg
    // this.scene.rotation.z = -45 * deg
  }

  get time() {
    return Date.now() / this.speed
  }

  get angle() {
    return this.getAngle(1)
  }

  getAngle(n) {
    const time = this.time * n
    const left = ROTATE * time
    return (left - Math.floor(left)) * PI2
  }

  get alpha() {
    return Math.cos(this.angle)
  }

  get beta() {
    return Math.sin(this.angle)
  }

  init() {

  }

  update() {
    for (const model of this.models) {
      if (!model.vid) {
        const material = [0xff3333, 0xff8800, 0xffff33, 0x33ff33, 0x3333ff, 0x8833ff].map(function (color) {
          return new THREE.MeshBasicMaterial({color: color})
        })
        const box = new THREE.BoxGeometry(model.size, model.size, model.size);
        const cube = new THREE.Mesh(box, material);
        cube.name = model.name
        this.scene.add(cube);
        model.vid = cube.id
        // cube.setObjectName()
      }
      model.update(this, this.scene.getObjectById(model.vid))
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  requestAnimation() {
    // setTimeout(() => this.animate(), 200)
    requestAnimationFrame(() => this.animate())
  }

  animate() {
    this.update()
    this.render()
    this.requestAnimation()
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
