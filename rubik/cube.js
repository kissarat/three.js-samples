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
  for(var key in World.defaults) {
    this[key] = key in options ? options[key] : World.defaults[key]
  }
  this.animate();
  this.renderer.render(this.scene, this.camera);
}

World.defaults = {
  play: 1000,
  speed: 1000
}


World.prototype = {
  get delta() {
    return this.time - this.last
  },

  get rotation() {
    return this.delta * Math.PI / 2
  },

  multiplicity: function(n) {
    return this.time % n
  },

  update: function (cb) {
    this.updates.push(cb)
  },

  animate: function () {
    const world = this
    this.time = Date.now() / this.speed
    if (this.play > 0 && this.updates.length > 0) {
      this.updates.forEach(function (update) {
        update.call(world)
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
    return cube
  },

  createGroup: function () {
    for (var x = -1; x <= 1; x++) {
      for (var y = -1; y <= 1; y++) {
        for (var z = -1; z <= 1; z++) {
          const cube = this.createNode()
          cube.position.x = x * 1.08
          cube.position.y = y * 1.08
          cube.position.z = z * 1.08
        }
      }
    }
  }
}

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
    var i
    while ((i = world.updates.indexOf(action)) >= 0) {
      world.updates.splice(i, 1)
    }
  }
})
