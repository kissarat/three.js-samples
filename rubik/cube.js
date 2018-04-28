const deg = Math.PI / 180

const control = {
  ArrowUp: function () {
    this.scene.rotation.z += this.rotation
  },
  ArrowDown: function () {
    this.scene.rotation.z -= this.rotation
  },
  ArrowLeft: function () {
    this.scene.rotation.y += this.rotation
  },
  ArrowRight: function () {
    this.scene.rotation.y -= this.rotation
  }
}

const axises = ['x', 'y', 'z']

function World(options) {
  if (!options) {
    options = {}
  }
  this.updates = []
  this.createScene()
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.z = 5;

  this.camera = camera
  this.renderer = renderer
  this.createGroup()

  this.last = Date.now()
  for (var key in World.defaults) {
    this[key] = key in options ? options[key] : World.defaults[key]
  }
  this.animate();
  this.render()
}

World.defaults = {
  play: 100000,
  speed: 1000
}

const BORDER = 1.08


World.prototype = {
  get delta() {
    return this.time - this.last
  },

  get rotation() {
    return this.delta * Math.PI / 2
  },

  render: function () {
    this.renderer.render(this.scene, this.camera);
  },

  multiplicity: function (n) {
    return this.time % n
  },

  updateWhile: function (time, cb) {
    cb.start = this.time
    cb.end = cb.start + time
    this.updates.push(cb)
  },

  update: function (cb) {
    this.updates.push(cb)
  },

  animate: function () {
    const world = this
    this.time = Date.now() / this.speed
    if (this.play > 0 && this.updates.length > 0) {
      this.updates.forEach(function (update) {
        const hasCount = isFinite(update.end)
        update.call(world, Math.min((world.time - update.start) / (update.end - update.start), 1))
        if (hasCount && update.end < world.time) {
          world.removeUpdate(update)
        }
      })
      this.renderer.render(this.scene, this.camera);
    }
    this.last = Date.now() / this.speed
    this.play--
    requestAnimationFrame(function () {
      world.animate()
    });
  },

  createScene: function () {
    this.scene = new THREE.Scene();
    this.scene.rotation.x = 45 * deg
    this.scene.rotation.y = 45 * deg
    this.scene.rotation.z = 90 * deg
    // this.update(function () {
    //   this.scene.rotation.x += this.delta * Math.PI / 2
    // })
  },

  getObject: function (name) {
    return this.scene.getObjectByName(name)
  },

  createNode: function () {
    const material = [0xff3333, 0xff8800, 0xffff33, 0x33ff33, 0x3333ff, 0x8833ff].map(function (color) {
      return new THREE.MeshBasicMaterial({color: color})
    })
    const box = new THREE.BoxGeometry(1, 1, 1);
    var cube = new THREE.Mesh(box, material);
    this.scene.add(cube);
    cube.x = 0
    cube.y = 0
    cube.z = 0
    return cube
  },

  createGroup: function () {
    this.cubes = []
    for (var x = 0; x <= 2; x++) {
      this.cubes[x] = []
      for (var y = 0; y <= 2; y++) {
        this.cubes[x][y] = []
        for (var z = 0; z <= 2; z++) {
          if (!(x === y === z === 1)) {
            const cube = this.createNode()
            cube.position.x = (x - 1) * BORDER
            cube.position.y = (y - 1) * BORDER
            cube.position.z = (z - 1) * BORDER
            this.cubes[x][y][z] = cube
          }
        }
      }
    }
  },

  getAddress: function (x, y, z) {
    console.log(x, y, z)
    return this.cubes[x][y][z]
  },

  setGroup: function (axis, n, array) {
    for (var i = 0; i <= 2; i++) {
      for (var j = 0; j <= 2; j++) {
        switch (axis) {
          case 'x':
            array.push(this.getAddress(n, i, j))
            break
          case 'y':
            array.push(this.getAddress(i, n, j))
            break
          case 'z':
            array.push(this.getAddress(i, j, n))
            break
        }
      }
    }
    return array
  },

  applyGroup: function (group, cube, two) {
  },

  execute: function (x) {
    const world = this
    const one = x & 3
    const axis = 0 === one ? '' : axises[one - 1]
    const two = (x >> 2) & 3
    const angle = 0 === two ? -1 : two * 90 * deg
    const rate = (x >> 4) & 7
    if (axis.length > 0 && angle >= 0) {
      const group = new THREE.Group();
      const array = [];
      [C1, C2, C3].forEach(function (n) {
        if ((n >> 4) & rate) {
          console.log(axis, rate)
          world.setGroup(axis, rate, array)
        }
      })
      array.forEach(function (cube) {
        group.add(cube)
      })
      this.scene.add(group)
      function updateGroup(time) {
        if (time < 1) {
          group.rotation[axis] = time * angle
        }
        else {
          array.forEach(function (cube) {
            cube[axis] = (cube[axis] + two) % 4
            cube.rotation[axis] = cube[axis] * 90 * deg
            world.scene.add(cube)
          })
          this.scene.remove(group)
        }
      }

      this.updateWhile(1, updateGroup)
      console.log(axis || '-', two * 90, rate & 1, rate & 2, rate & 4)
      // this.scene.remove(group)
    }
  },

  removeUpdate: function (action) {
    var i
    while ((i = this.updates.indexOf(action)) >= 0) {
      this.updates.splice(i, 1)
    }
  }
}

const A0 = 0
const AX = 1
const AY = 2
const AZ = 3
const AN1 = 1 << 2
const AN2 = 2 << 2
const AN3 = 3 << 2
const C1 = 1 << 5
const C2 = 1 << 6
const C3 = 1 << 7
const C12 = C1 | C2
const C23 = C2 | C3
const C13 = C1 | C3
const CA = C1 | C2 | C3

// for(var name in control) {
//
// }

addEventListener('load', function () {
  window.world = new World()
})

addEventListener('keydown', function (e) {
  const action = control[e.key]
  world.play += 100
  if ('function' === typeof action) {
    if (world.updates.indexOf(action) < 0) {
      action.start = Date.now()
      world.updates.push(action)
    }
  }
})

addEventListener('keyup', function (e) {
  const action = control[e.key]
  if ('function' === typeof action) {
    world.removeUpdate(action)
  }
})
